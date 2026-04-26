<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreVolunteerWorkRequest extends FormRequest
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
            'organization' => 'required|string|max:255',
            'role' => 'required|string|max:255',
            'start_date' => 'nullable|string|max:100',
            'end_date' => 'nullable|string|max:100',
            'currently_volunteering' => 'boolean',
            'description' => 'nullable|string',
        ];
    }
}
