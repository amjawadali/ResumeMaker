<?php

namespace App\Services;

use GuzzleHttp\Client;
use GuzzleHttp\Exception\GuzzleException;
use Illuminate\Support\Facades\Log;

class OpenRouterService
{
    protected Client $client;
    protected string $apiKey;
    protected string $model;
    protected string $apiUrl;

    public function __construct()
    {
        $this->client = new Client();
        $this->apiKey = config('services.openrouter.api_key');
        $this->model = config('services.openrouter.model');
        $this->apiUrl = config('services.openrouter.api_url');
    }

    /**
     * Extract structured profile data from an image
     *
     * @param string $imagePath Path to the image file
     * @return array Extracted profile data
     * @throws \Exception
     */
    public function extractProfileDataFromImage(string $imagePath): array
    {
        try {
            // Read and encode image to base64
            $imageData = file_get_contents($imagePath);
            $base64Image = base64_encode($imageData);
            $mimeType = mime_content_type($imagePath);
            
            // Create the structured prompt for profile extraction
            $prompt = $this->buildExtractionPrompt();
            
            // Prepare the API request
            $response = $this->client->post($this->apiUrl, [
                'headers' => [
                    'Authorization' => 'Bearer ' . $this->apiKey,
                    'Content-Type' => 'application/json',
                    'HTTP-Referer' => config('app.url'),
                    'X-Title' => config('app.name'),
                ],
                'json' => [
                    'model' => $this->model,
                    'messages' => [
                        [
                            'role' => 'user',
                            'content' => [
                                [
                                    'type' => 'text',
                                    'text' => $prompt
                                ],
                                [
                                    'type' => 'image_url',
                                    'image_url' => [
                                        'url' => "data:{$mimeType};base64,{$base64Image}"
                                    ]
                                ]
                            ]
                        ]
                    ],
                    'temperature' => 0.3, // Lower temperature for more consistent extraction
                    'max_tokens' => 2000,
                ]
            ]);

            $body = json_decode($response->getBody()->getContents(), true);
            
            // Extract the response text
            $extractedText = $body['choices'][0]['message']['content'] ?? '';
            
            // Parse the JSON response from the AI
            return $this->parseExtractedData($extractedText);
            
        } catch (GuzzleException $e) {
            Log::error('OpenRouter API Error: ' . $e->getMessage());
            throw new \Exception('Failed to extract data from image: ' . $e->getMessage());
        } catch (\Exception $e) {
            Log::error('Profile extraction error: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Build the extraction prompt for the AI model
     *
     * @return string
     */
    protected function buildExtractionPrompt(): string
    {
        return <<<PROMPT
You are an AI assistant that extracts structured profile information from resume/CV images.

Analyze the provided image and extract ALL available information in the following JSON format. If any field is not found in the image, use null for that field.

Return ONLY valid JSON with this exact structure:

{
  "personal_info": {
    "full_name": "string or null",
    "email": "string or null",
    "phone": "string or null",
    "address": "string or null",
    "city": "string or null",
    "state": "string or null",
    "zip_code": "string or null",
    "country": "string or null",
    "website": "string or null",
    "professional_summary": "string or null"
  },
  "education": [
    {
      "institution": "string",
      "degree": "string",
      "start_date": "YYYY-MM-DD or YYYY-MM or YYYY",
      "end_date": "YYYY-MM-DD or YYYY-MM or YYYY or null if currently studying",
      "currently_studying": boolean,
      "description": "string or null"
    }
  ],
  "experience": [
    {
      "company": "string",
      "position": "string",
      "location": "string or null",
      "start_date": "YYYY-MM-DD or YYYY-MM or YYYY",
      "end_date": "YYYY-MM-DD or YYYY-MM or YYYY or null if currently working",
      "currently_working": boolean,
      "responsibilities": "string or null"
    }
  ],
  "skills": [
    {
      "name": "string",
      "level": "Beginner|Intermediate|Advanced|Expert"
    }
  ],
  "certifications": [
    {
      "name": "string",
      "issuing_organization": "string",
      "issue_date": "YYYY-MM-DD or YYYY-MM or YYYY",
      "expiration_date": "YYYY-MM-DD or YYYY-MM or YYYY or null",
      "credential_id": "string or null",
      "credential_url": "string or null"
    }
  ],
  "languages": [
    {
      "name": "string",
      "proficiency": "Native|Fluent|Intermediate|Basic"
    }
  ]
}

Important guidelines:
1. Extract ALL text you can see in the image
2. For dates, try to format as YYYY-MM-DD if possible, otherwise YYYY-MM or just YYYY
3. For skill levels, estimate based on context (years of experience, proficiency indicators)
4. For language proficiency, use the closest match from: Native, Fluent, Intermediate, Basic
5. If a section is not present in the resume, return an empty array for that section
6. Ensure all JSON is properly formatted and valid
7. Do not include any explanatory text, ONLY return the JSON object

Now analyze the image and extract the profile data.
PROMPT;
    }

    /**
     * Parse the extracted data from AI response
     *
     * @param string $extractedText
     * @return array
     */
    protected function parseExtractedData(string $extractedText): array
    {
        // Try to extract JSON from the response
        // Sometimes the AI might include extra text, so we need to find the JSON part
        $jsonStart = strpos($extractedText, '{');
        $jsonEnd = strrpos($extractedText, '}');
        
        if ($jsonStart === false || $jsonEnd === false) {
            throw new \Exception('No valid JSON found in AI response');
        }
        
        $jsonString = substr($extractedText, $jsonStart, $jsonEnd - $jsonStart + 1);
        $data = json_decode($jsonString, true);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            Log::error('JSON parsing error: ' . json_last_error_msg());
            Log::error('Extracted text: ' . $extractedText);
            throw new \Exception('Failed to parse AI response as JSON: ' . json_last_error_msg());
        }
        
        return $data;
    }

    /**
     * Merge data from multiple pages/images
     *
     * @param array $existingData
     * @param array $newData
     * @return array
     */
    public function mergeExtractedData(array $existingData, array $newData): array
    {
        // Merge personal info (prefer non-null values)
        $mergedPersonalInfo = array_merge(
            $existingData['personal_info'] ?? [],
            array_filter($newData['personal_info'] ?? [], fn($value) => $value !== null)
        );

        // Merge arrays (education, experience, skills, etc.)
        $mergedEducation = array_merge(
            $existingData['education'] ?? [],
            $newData['education'] ?? []
        );

        $mergedExperience = array_merge(
            $existingData['experience'] ?? [],
            $newData['experience'] ?? []
        );

        $mergedSkills = array_merge(
            $existingData['skills'] ?? [],
            $newData['skills'] ?? []
        );

        $mergedCertifications = array_merge(
            $existingData['certifications'] ?? [],
            $newData['certifications'] ?? []
        );

        $mergedLanguages = array_merge(
            $existingData['languages'] ?? [],
            $newData['languages'] ?? []
        );

        return [
            'personal_info' => $mergedPersonalInfo,
            'education' => $mergedEducation,
            'experience' => $mergedExperience,
            'skills' => $mergedSkills,
            'certifications' => $mergedCertifications,
            'languages' => $mergedLanguages,
        ];
    }
}
