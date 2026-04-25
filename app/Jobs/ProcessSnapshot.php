<?php

namespace App\Jobs;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Database\Eloquent\Model;

class ProcessSnapshot implements ShouldQueue
{
    use Queueable;

    protected $model;
    protected $base64Data;
    protected $field;
    protected $folder;

    /**
     * Create a new job instance.
     *
     * @param Model $model The Eloquent model to update
     * @param string $base64Data The raw base64 data URL
     * @param string $field The field name on the model to update
     * @param string $folder The subfolder in standard storage
     */
    public function __construct(Model $model, string $base64Data, string $field = 'preview_image', string $folder = 'snapshots')
    {
        $this->model = $model;
        $this->base64Data = $base64Data;
        $this->field = $field;
        $this->folder = $folder;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        try {
            if (empty($this->base64Data)) {
                return;
            }

            $imageData = $this->base64Data;
            
            // Handle Data URL format (e.g., data:image/png;base64,...)
            if (preg_match('/^data:image\/(\w+);base64,/', $imageData, $type)) {
                $imageData = substr($imageData, strpos($imageData, ',') + 1);
                $extension = strtolower($type[1]);
            } else {
                $extension = 'png';
            }

            $decodedData = base64_decode($imageData);
            if (!$decodedData) {
                return;
            }

            $fileName = $this->folder . '/' . Str::random(40) . '.' . $extension;
            
            // Ensure directory exists
            if (!Storage::disk('public')->exists($this->folder)) {
                Storage::disk('public')->makeDirectory($this->folder);
            }

            // Save the file
            Storage::disk('public')->put($fileName, $decodedData);

            // Update the model (optionally delete old image if exists)
            $oldPath = $this->model->{$this->field};
            if ($oldPath && strpos($oldPath, 'storage/') !== false) {
                $cleanOldPath = str_replace('/storage/', '', $oldPath);
                if (Storage::disk('public')->exists($cleanOldPath)) {
                    Storage::disk('public')->delete($cleanOldPath);
                }
            }

            $this->model->update([
                $this->field => '/storage/' . $fileName
            ]);

        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('ProcessSnapshot Job Failed: ' . $e->getMessage());
            throw $e;
        }
    }
}
