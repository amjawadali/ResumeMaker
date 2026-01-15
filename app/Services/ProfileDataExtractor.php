<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class ProfileDataExtractor
{
    /**
     * Sanitize and validate extracted profile data
     *
     * @param array $extractedData
     * @return array
     */
    public function sanitizeAndValidate(array $extractedData): array
    {
        return [
            'personal_info' => $this->sanitizePersonalInfo($extractedData['personal_info'] ?? []),
            'education' => $this->sanitizeEducation($extractedData['education'] ?? []),
            'experience' => $this->sanitizeExperience($extractedData['experience'] ?? []),
            'skills' => $this->sanitizeSkills($extractedData['skills'] ?? []),
            'certifications' => $this->sanitizeCertifications($extractedData['certifications'] ?? []),
            'languages' => $this->sanitizeLanguages($extractedData['languages'] ?? []),
        ];
    }

    /**
     * Sanitize personal information
     *
     * @param array $data
     * @return array
     */
    protected function sanitizePersonalInfo(array $data): array
    {
        return [
            'full_name' => $this->sanitizeString($data['full_name'] ?? null, 255),
            'email' => $this->sanitizeEmail($data['email'] ?? null),
            'phone' => $this->sanitizeString($data['phone'] ?? null, 20),
            'address' => $this->sanitizeString($data['address'] ?? null, 255),
            'city' => $this->sanitizeString($data['city'] ?? null, 100),
            'state' => $this->sanitizeString($data['state'] ?? null, 100),
            'zip_code' => $this->sanitizeString($data['zip_code'] ?? null, 20),
            'country' => $this->sanitizeString($data['country'] ?? null, 100),
            'website' => $this->sanitizeUrl($data['website'] ?? null),
            'professional_summary' => $this->sanitizeText($data['professional_summary'] ?? null),
        ];
    }

    /**
     * Sanitize education entries
     *
     * @param array $educationList
     * @return array
     */
    protected function sanitizeEducation(array $educationList): array
    {
        $sanitized = [];

        foreach ($educationList as $education) {
            if (empty($education['institution']) || empty($education['degree'])) {
                continue; // Skip invalid entries
            }

            $sanitized[] = [
                'institution' => $this->sanitizeString($education['institution'], 255),
                'degree' => $this->sanitizeString($education['degree'], 255),
                'start_date' => $this->sanitizeDate($education['start_date'] ?? null),
                'end_date' => $this->sanitizeDate($education['end_date'] ?? null),
                'currently_studying' => (bool)($education['currently_studying'] ?? false),
                'description' => $this->sanitizeText($education['description'] ?? null),
            ];
        }

        return $sanitized;
    }

    /**
     * Sanitize experience entries
     *
     * @param array $experienceList
     * @return array
     */
    protected function sanitizeExperience(array $experienceList): array
    {
        $sanitized = [];

        foreach ($experienceList as $experience) {
            if (empty($experience['company']) || empty($experience['position'])) {
                continue; // Skip invalid entries
            }

            $sanitized[] = [
                'company' => $this->sanitizeString($experience['company'], 255),
                'position' => $this->sanitizeString($experience['position'], 255),
                'location' => $this->sanitizeString($experience['location'] ?? null, 255),
                'start_date' => $this->sanitizeDate($experience['start_date'] ?? null),
                'end_date' => $this->sanitizeDate($experience['end_date'] ?? null),
                'currently_working' => (bool)($experience['currently_working'] ?? false),
                'responsibilities' => $this->sanitizeText($experience['responsibilities'] ?? null),
            ];
        }

        return $sanitized;
    }

    /**
     * Sanitize skills
     *
     * @param array $skillsList
     * @return array
     */
    protected function sanitizeSkills(array $skillsList): array
    {
        $sanitized = [];
        $validLevels = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];

        foreach ($skillsList as $skill) {
            if (empty($skill['name'])) {
                continue;
            }

            $level = $skill['level'] ?? 'Intermediate';
            if (!in_array($level, $validLevels)) {
                $level = 'Intermediate';
            }

            $sanitized[] = [
                'name' => $this->sanitizeString($skill['name'], 100),
                'level' => $level,
            ];
        }

        return $sanitized;
    }

    /**
     * Sanitize certifications
     *
     * @param array $certificationsList
     * @return array
     */
    protected function sanitizeCertifications(array $certificationsList): array
    {
        $sanitized = [];

        foreach ($certificationsList as $cert) {
            if (empty($cert['name']) || empty($cert['issuing_organization'])) {
                continue;
            }

            $sanitized[] = [
                'name' => $this->sanitizeString($cert['name'], 255),
                'issuing_organization' => $this->sanitizeString($cert['issuing_organization'], 255),
                'issue_date' => $this->sanitizeDate($cert['issue_date'] ?? null),
                'expiration_date' => $this->sanitizeDate($cert['expiration_date'] ?? null),
                'credential_id' => $this->sanitizeString($cert['credential_id'] ?? null, 100),
                'credential_url' => $this->sanitizeUrl($cert['credential_url'] ?? null),
            ];
        }

        return $sanitized;
    }

    /**
     * Sanitize languages
     *
     * @param array $languagesList
     * @return array
     */
    protected function sanitizeLanguages(array $languagesList): array
    {
        $sanitized = [];
        $validProficiencies = ['Native', 'Fluent', 'Intermediate', 'Basic'];

        foreach ($languagesList as $language) {
            if (empty($language['name'])) {
                continue;
            }

            $proficiency = $language['proficiency'] ?? 'Intermediate';
            if (!in_array($proficiency, $validProficiencies)) {
                $proficiency = 'Intermediate';
            }

            $sanitized[] = [
                'name' => $this->sanitizeString($language['name'], 100),
                'proficiency' => $proficiency,
            ];
        }

        return $sanitized;
    }

    /**
     * Sanitize a string field
     *
     * @param mixed $value
     * @param int $maxLength
     * @return string|null
     */
    protected function sanitizeString($value, int $maxLength = 255): ?string
    {
        if ($value === null || $value === '') {
            return null;
        }

        $value = strip_tags((string)$value);
        $value = trim($value);
        
        if ($value === '') {
            return null;
        }

        return Str::limit($value, $maxLength, '');
    }

    /**
     * Sanitize a text field (allows longer content)
     *
     * @param mixed $value
     * @return string|null
     */
    protected function sanitizeText($value): ?string
    {
        if ($value === null || $value === '') {
            return null;
        }

        $value = strip_tags((string)$value);
        $value = trim($value);
        
        if ($value === '') {
            return null;
        }

        return $value;
    }

    /**
     * Sanitize email address
     *
     * @param mixed $value
     * @return string|null
     */
    protected function sanitizeEmail($value): ?string
    {
        if ($value === null || $value === '') {
            return null;
        }

        $value = filter_var($value, FILTER_SANITIZE_EMAIL);
        
        if (!filter_var($value, FILTER_VALIDATE_EMAIL)) {
            return null;
        }

        return $value;
    }

    /**
     * Sanitize URL
     *
     * @param mixed $value
     * @return string|null
     */
    protected function sanitizeUrl($value): ?string
    {
        if ($value === null || $value === '') {
            return null;
        }

        $value = filter_var($value, FILTER_SANITIZE_URL);
        
        if (!filter_var($value, FILTER_VALIDATE_URL)) {
            return null;
        }

        return Str::limit($value, 255, '');
    }

    /**
     * Sanitize and normalize date
     *
     * @param mixed $value
     * @return string|null
     */
    protected function sanitizeDate($value): ?string
    {
        if ($value === null || $value === '') {
            return null;
        }

        try {
            // Try to parse the date
            $date = new \DateTime($value);
            
            // Return in Y-m-d format
            return $date->format('Y-m-d');
        } catch (\Exception $e) {
            // If parsing fails, try to extract year at minimum
            if (preg_match('/(\d{4})/', $value, $matches)) {
                return $matches[1] . '-01-01';
            }
            
            Log::warning('Failed to parse date: ' . $value);
            return null;
        }
    }
}
