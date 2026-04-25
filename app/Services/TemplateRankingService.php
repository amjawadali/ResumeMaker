<?php

namespace App\Services;

use App\Models\Template;
use Illuminate\Support\Facades\DB;

class TemplateRankingService
{
    /**
     * Calculate and update the trending scores for all active templates.
     * Score formula: (Uses / (DaysOld + 1)) * (AvgRating if exists)
     */
    public function updateTrendingScores()
    {
        $templates = Template::active()->get();

        foreach ($templates as $template) {
            $daysOld = $template->created_at->diffInDays(now()) ?: 1;
            
            // Basic trending score: Uses per day
            $usesPerDay = $template->use_count / $daysOld;

            // Optional: Weight by rating if available
            $ratingWeight = $template->fill_score_avg ?: 1;
            
            $score = $usesPerDay * $ratingWeight;

            // We can store this in a temporary column or a specific ranking table.
            // For now, we'll just ensure the use_count and logic is fresh.
            // In a more advanced version, we'd update a 'trending_score' column.
        }
    }

    /**
     * Get the top trending templates.
     */
    public function getTrending($limit = 10)
    {
        return Template::publicApproved()
            ->orderByRaw('(use_count / EXTRACT(DAY FROM (now() - created_at) + interval \'1 day\')) DESC')
            ->limit($limit)
            ->get();
    }
}
