<?php

namespace App\Services;

use GuzzleHttp\Client;
use GuzzleHttp\Exception\GuzzleException;
use Illuminate\Support\Facades\Log;

class GeminiService
{
    protected Client $client;
    protected ?string $apiKey;
    protected ?string $apiUrl;

    public function __construct()
    {
        $this->client = new Client();
        $this->apiKey = config('services.gemini.api_key');
        $this->apiUrl = config('services.gemini.api_url');
    }

    /**
     * Extract structured profile data from text using Google Gemini
     *
     * @param string $text Raw text extracted from OCR
     * @return array Extracted profile data
     * @throws \Exception
     */
    public function extractProfileDataFromText(string $text): array
    {
        if (empty($this->apiKey)) {
            Log::error('Gemini API key is missing.');
            throw new \Exception('Gemini API key is not configured. Please add GEMINI_API_KEY to your .env file.');
        }

        try {
            $prompt = $this->buildExtractionPrompt();
            
            $response = $this->client->post($this->apiUrl . '?key=' . $this->apiKey, [
                'timeout' => 120, // 2 minutes
                'headers' => [
                    'Content-Type' => 'application/json',
                ],
                'json' => [
                    'contents' => [
                        [
                            'parts' => [
                                [
                                    'text' => $prompt . "\n\nRESTORE CUT-OFF WORDS BASED ON CONTEXT.\n\nRESUME CONTENT:\n" . $text
                                ]
                            ]
                        ]
                    ],
                    'generationConfig' => [
                        'temperature' => 0.1,
                        'maxOutputTokens' => 2048,
                        'responseMimeType' => 'application/json',
                    ]
                ]
            ]);

            $body = json_decode($response->getBody()->getContents(), true);
            
            // Log::info('Gemini Full Body:', $body);
            
            $extractedText = $body['candidates'][0]['content']['parts'][0]['text'] ?? '';
            
            if (empty($extractedText)) {
                throw new \Exception('Gemini returned an empty response.');
            }

            return $this->parseExtractedData($extractedText);
            
        } catch (GuzzleException $e) {
            Log::error('Gemini API Error: ' . $e->getMessage());
            throw new \Exception('Failed to extract data from text using Gemini: ' . $e->getMessage());
        } catch (\Exception $e) {
            Log::error('Profile extraction error: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Build the extraction prompt for the AI model
     */
    protected function buildExtractionPrompt(): string
    {
        return <<<PROMPT
You are an AI assistant that extracts structured profile information from resume/CV text.

Analyze the provided text and extract ALL available information in the following JSON format. If any field is not found, use null for that field.

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
1. Extract ALL relevant info from the text
2. For dates, try to format as YYYY-MM-DD if possible
3. For skill levels, estimate based on context
4. For language proficiency, use: Native, Fluent, Intermediate, Basic
5. If a section is not present, return an empty array []
6. Return ONLY the JSON object, NO other text.
7. Ensure valid JSON format.
PROMPT;
    }

    /**
     * Parse the extracted data from AI response
     */
    protected function parseExtractedData(string $extractedText): array
    {
        // Remove markdown code blocks if present
        $jsonString = preg_replace('/^```json\s*|\s*```$/i', '', trim($extractedText));
        
        // Also look for the first { and last } just in case
        $jsonStart = strpos($jsonString, '{');
        $jsonEnd = strrpos($jsonString, '}');
        
        if ($jsonStart !== false && $jsonEnd !== false) {
            $jsonString = substr($jsonString, $jsonStart, $jsonEnd - $jsonStart + 1);
        }
        
        // Clean control characters that might break JSON
        $jsonString = preg_replace('/[\x00-\x1F\x7F]/', '', $jsonString);
        
        $data = json_decode($jsonString, true);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            Log::error('Gemini JSON parsing error: ' . json_last_error_msg());
            throw new \Exception('Failed to parse Gemini response as JSON.');
        }
        
        return $data;
    }
}
