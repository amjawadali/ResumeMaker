<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class AiController extends Controller
{
    public function parseResume(Request $request)
    {
        // Mock response for now
        // In real impl: Upload PDF -> Spatie PdfToText -> OpenAI -> JSON
        
        return response()->json([
            'data' => [
                'user' => [
                    'name' => 'John Doe',
                    'email' => 'john@example.com',
                ],
                'details' => [
                    'summary' => 'Experienced developer with 5 years...',
                    'phone' => '123-456-7890',
                ],
                'experience' => [
                    [
                        'company' => 'Tech Corp',
                        'role' => 'Senior Dev',
                        'start_date' => '2020-01-01',
                        'description' => 'Built amazing things.'
                    ]
                ],
                'education' => [
                    [
                        'institution' => 'University of Code',
                        'degree' => 'BS Computer Science',
                        'start_date' => '2016-01-01',
                        'end_date' => '2020-01-01',
                    ]
                ],
                'skills' => [
                    ['name' => 'Laravel', 'level' => 'Expert'],
                    ['name' => 'React', 'level' => 'Advanced'],
                ]
            ]
        ]);
    }

    public function improveText(Request $request)
    {
        $text = $request->input('text');
        
        // Mock response
        return response()->json([
            'original' => $text,
            'improved' => "Improved: " . $text . " (Professional Tone)",
            'suggestions' => ['Use active voice', 'Quantify results']
        ]);
    }
}
