<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreResumeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'template_id' => ['required', 'exists:templates,id'],
            'title' => ['required', 'string', 'max:255'],
            'sections_visibility' => ['nullable', 'array'],
        ];
    }
}
