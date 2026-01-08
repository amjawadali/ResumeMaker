<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateResumeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'sidebar_width' => 'integer|min:20|max:50',
            'font_weight' => 'string',
            'custom_sections' => 'nullable|array',
            'sections_visibility' => 'nullable|array',
            'canvas_state' => 'nullable|array',
            // Allow new schema fields too just in case
            'custom_styling' => 'nullable|array',
            'content_override' => 'nullable|array',
            'sections_order' => 'nullable|array',
        ];
    }
}
