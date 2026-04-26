<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePublicationRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => 'required|string|max:255',
            'publisher' => 'nullable|string|max:255',
            'date' => 'nullable|string|max:100',
            'url' => 'nullable|url|max:255',
            'description' => 'nullable|string',
        ];
    }
}
