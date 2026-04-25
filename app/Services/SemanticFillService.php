<?php

namespace App\Services;

use Illuminate\Support\Arr;

class SemanticFillService
{
    /**
     * Map profile data into canvas elements based on semantic tags.
     */
    public function fill(?array $canvasData, array $profileData): array
    {
        if (!$canvasData || !isset($canvasData['pages'])) {
            return $canvasData ?? [];
        }

        foreach ($canvasData['pages'] as &$page) {
            foreach ($page['elements'] as &$element) {
                if (isset($element['semantic'])) {
                    $this->fillElement($element, $profileData);
                }
            }
        }

        return $canvasData;
    }

    /**
     * Fill a single element based on its semantic tag.
     */
    protected function fillElement(array &$element, array $profileData): void
    {
        $tag = $element['semantic'];

        // Map simple fields
        $mapping = [
            'full_name' => 'userDetail.full_name',
            'email' => 'userDetail.email',
            'phone' => 'userDetail.phone',
            'position' => 'userDetail.job_title', // or first experience position
            'summary' => 'userDetail.professional_summary',
            'location' => 'userDetail.address',
            'linkedin' => 'userDetail.linkedin',
            'website' => 'userDetail.website',
        ];

        if (isset($mapping[$tag])) {
            $value = Arr::get($profileData, $mapping[$tag]);
            if ($value) {
                $element['text'] = $value;
            }
        }

        // Special case for position if userDetail.job_title is empty
        if ($tag === 'position' && empty($element['text'])) {
            $element['text'] = Arr::get($profileData, 'experiences.0.position', 'Web Developer');
        }

        // Special case for profile photo
        if ($tag === 'profile_photo') {
            $photoUrl = Arr::get($profileData, 'userDetail.profile_photo_url');
            if ($photoUrl) {
                $element['src'] = $photoUrl;
            }
        }
    }

    /**
     * Calculate how well a template fills from a profile.
     */
    public function score(?array $canvasData, array $profileData): array
    {
        $tags = [];
        if ($canvasData && isset($canvasData['pages'])) {
            foreach ($canvasData['pages'] as $page) {
                foreach ($page['elements'] as $element) {
                    if (isset($element['semantic'])) {
                        $tags[] = $element['semantic'];
                    }
                }
            }
        }

        if (empty($tags)) {
            return ['pct' => 0, 'filled' => 0, 'total' => 0, 'missing' => []];
        }

        $filled = 0;
        $missing = [];
        $uniqueTags = array_unique($tags);
        
        foreach ($uniqueTags as $tag) {
            // Simplified check matching the fill logic
            $hasData = false;
            // Check mapping
            if (in_array($tag, ['full_name', 'email', 'phone', 'summary', 'location', 'linkedin', 'website', 'profile_photo'])) {
                $hasData = !empty(Arr::get($profileData, 'userDetail.' . ($tag === 'position' ? 'job_title' : $tag)));
            }
            
            if ($hasData) {
                $filled++;
            } else {
                $missing[] = $tag;
            }
        }

        return [
            'pct' => ($filled / count($uniqueTags)) * 100,
            'filled' => $filled,
            'total' => count($uniqueTags),
            'missing' => $missing
        ];
    }
}
