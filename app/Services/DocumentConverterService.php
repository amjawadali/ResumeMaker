<?php

namespace App\Services;

use Spatie\PdfToImage\Pdf;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver;

class DocumentConverterService
{
    protected string $tempPath;

    public function __construct()
    {
        $this->tempPath = storage_path('app/temp/document-conversion');
        
        // Ensure temp directory exists
        if (!file_exists($this->tempPath)) {
            mkdir($this->tempPath, 0755, true);
        }
    }

    /**
     * Convert a PDF file to an array of image paths
     *
     * @param string $pdfPath
     * @return array Array of image file paths
     * @throws \Exception
     */
    public function convertPdfToImages(string $pdfPath): array
    {
        if (!class_exists('Imagick')) {
            throw new \Exception('PDF conversion requires the Imagick PHP extension, which is not installed or enabled on this server. Please upload an image (JPG/PNG) instead.');
        }

        try {
            $pdf = new Pdf($pdfPath);
            $pageCount = $pdf->getNumberOfPages();
            $imagePaths = [];

            for ($page = 1; $page <= $pageCount; $page++) {
                $outputPath = $this->tempPath . '/pdf_page_' . uniqid() . '_' . $page . '.jpg';
                
                $pdf->setPage($page)
                    ->setOutputFormat('jpg')
                    ->setCompressionQuality(85)
                    ->saveImage($outputPath);
                
                // Optimize the image
                $optimizedPath = $this->optimizeImage($outputPath);
                $imagePaths[] = $optimizedPath;
                
                // Clean up original if different from optimized
                if ($outputPath !== $optimizedPath && file_exists($outputPath)) {
                    unlink($outputPath);
                }
            }

            return $imagePaths;
            
        } catch (\Exception $e) {
            Log::error('PDF conversion error: ' . $e->getMessage());
            throw new \Exception('Failed to convert PDF. Please upload an image instead. Error: ' . $e->getMessage());
        }
    }

    /**
     * Process an image file (resize, optimize)
     *
     * @param string $imagePath
     * @return string Path to processed image
     */
    public function processImage(string $imagePath): string
    {
        try {
            return $this->optimizeImage($imagePath);
        } catch (\Exception $e) {
            Log::error('Image processing error: ' . $e->getMessage());
            // Return original path if optimization fails
            return $imagePath;
        }
    }

    /**
     * Optimize image for API consumption
     *
     * @param string $imagePath
     * @return string Path to optimized image
     */
    protected function optimizeImage(string $imagePath): string
    {
        try {
            $manager = new ImageManager(new Driver());
            $image = $manager->read($imagePath);
            
            // Get original dimensions
            $width = $image->width();
            $height = $image->height();
            
            // Resize if too large (max 1500px on longest side)
            $maxDimension = 1500;
            if ($width > $maxDimension || $height > $maxDimension) {
                if ($width > $height) {
                    $image->scale(width: $maxDimension);
                } else {
                    $image->scale(height: $maxDimension);
                }
            }
            
            // Save optimized image
            $outputPath = $this->tempPath . '/optimized_' . uniqid() . '.jpg';
            $image->toJpeg(quality: 85)->save($outputPath);
            
            return $outputPath;
            
        } catch (\Exception $e) {
            Log::error('Image optimization error: ' . $e->getMessage());
            return $imagePath; // Return original if optimization fails
        }
    }

    /**
     * Convert DOCX to images (requires LibreOffice)
     * Note: This is a placeholder - actual implementation requires LibreOffice/unoconv
     *
     * @param string $docxPath
     * @return array Array of image file paths
     * @throws \Exception
     */
    public function convertDocxToImages(string $docxPath): array
    {
        // Check if LibreOffice is available
        $libreOfficePath = $this->findLibreOffice();
        
        if (!$libreOfficePath) {
            throw new \Exception('LibreOffice is not installed. Please install LibreOffice to convert DOCX files.');
        }

        try {
            // Convert DOCX to PDF first using LibreOffice
            $pdfPath = $this->tempPath . '/converted_' . uniqid() . '.pdf';
            
            $command = sprintf(
                '"%s" --headless --convert-to pdf --outdir "%s" "%s"',
                $libreOfficePath,
                dirname($pdfPath),
                $docxPath
            );
            
            exec($command, $output, $returnCode);
            
            if ($returnCode !== 0) {
                throw new \Exception('Failed to convert DOCX to PDF');
            }
            
            // Find the generated PDF (LibreOffice uses original filename)
            $baseName = pathinfo($docxPath, PATHINFO_FILENAME);
            $generatedPdf = dirname($pdfPath) . '/' . $baseName . '.pdf';
            
            if (!file_exists($generatedPdf)) {
                throw new \Exception('PDF conversion completed but file not found');
            }
            
            // Rename to our expected path
            rename($generatedPdf, $pdfPath);
            
            // Convert PDF to images
            $imagePaths = $this->convertPdfToImages($pdfPath);
            
            // Clean up PDF
            if (file_exists($pdfPath)) {
                unlink($pdfPath);
            }
            
            return $imagePaths;
            
        } catch (\Exception $e) {
            Log::error('DOCX conversion error: ' . $e->getMessage());
            throw new \Exception('Failed to convert DOCX to images: ' . $e->getMessage());
        }
    }

    /**
     * Find LibreOffice installation path
     *
     * @return string|null
     */
    protected function findLibreOffice(): ?string
    {
        $possiblePaths = [
            'C:\\Program Files\\LibreOffice\\program\\soffice.exe',
            'C:\\Program Files (x86)\\LibreOffice\\program\\soffice.exe',
            '/usr/bin/libreoffice',
            '/usr/bin/soffice',
            '/Applications/LibreOffice.app/Contents/MacOS/soffice',
        ];

        foreach ($possiblePaths as $path) {
            if (file_exists($path)) {
                return $path;
            }
        }

        // Try to find it in PATH
        if (strtoupper(substr(PHP_OS, 0, 3)) === 'WIN') {
            exec('where soffice.exe', $output, $returnCode);
        } else {
            exec('which soffice', $output, $returnCode);
        }

        if ($returnCode === 0 && !empty($output[0])) {
            return $output[0];
        }

        return null;
    }

    /**
     * Clean up temporary files
     *
     * @param array $filePaths
     */
    public function cleanupTempFiles(array $filePaths): void
    {
        foreach ($filePaths as $path) {
            if (file_exists($path)) {
                try {
                    unlink($path);
                } catch (\Exception $e) {
                    Log::warning('Failed to delete temp file: ' . $path);
                }
            }
        }
    }

    /**
     * Clean up all old temp files (older than 1 hour)
     */
    public function cleanupOldTempFiles(): void
    {
        if (!is_dir($this->tempPath)) {
            return;
        }

        $files = glob($this->tempPath . '/*');
        $now = time();

        foreach ($files as $file) {
            if (is_file($file)) {
                if ($now - filemtime($file) >= 3600) { // 1 hour
                    try {
                        unlink($file);
                    } catch (\Exception $e) {
                        Log::warning('Failed to delete old temp file: ' . $file);
                    }
                }
            }
        }
    }
}
