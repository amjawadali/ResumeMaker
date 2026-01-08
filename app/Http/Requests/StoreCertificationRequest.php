<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreCertificationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'issuing_organization' => ['required', 'string', 'max:255'],
            'issue_date' => ['required', 'date'],
            'expiry_date' => ['nullable', 'date', 'after:issue_date'],
            'credential_id' => ['nullable', 'string', 'max:255'],
            'credential_url' => ['nullable', 'url', 'max:255'],
        ];
    }
}
