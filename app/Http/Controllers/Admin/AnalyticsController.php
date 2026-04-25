<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\TelemetryEvent;
use App\Models\Template;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class AnalyticsController extends Controller
{
    /**
     * Display the analytics dashboard.
     */
    public function index()
    {
        // 1. Overview Stats (Total counts)
        $stats = [
            'total_impressions' => TelemetryEvent::where('event_type', 'impression')->count(),
            'total_engagements' => TelemetryEvent::where('event_type', 'engagement')->count(),
            'total_usage' => TelemetryEvent::where('event_type', 'usage')->count(),
            'total_exports' => TelemetryEvent::where('event_type', 'export_png')->count() + TelemetryEvent::where('event_type', 'export_pdf')->count(),
        ];

        // 2. Conversion Funnel Data (Daily)
        $funnel = TelemetryEvent::select(
                DB::raw('DATE(created_at) as date'),
                DB::raw("COUNT(CASE WHEN event_type = 'impression' THEN 1 END) as impressions"),
                DB::raw("COUNT(CASE WHEN event_type = 'engagement' THEN 1 END) as engagements"),
                DB::raw("COUNT(CASE WHEN event_type = 'usage' THEN 1 END) as usage"),
            )
            ->where('created_at', '>=', now()->subDays(30))
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        // 3. Top Templates by Conversion Rate
        $topTemplates = Template::with(['user'])
            ->select('templates.*')
            ->addSelect([
                'impressions_count' => TelemetryEvent::selectRaw('count(*)')
                    ->whereColumn('model_id', 'templates.id')
                    ->where('model_type', 'Template')
                    ->where('event_type', 'impression'),
                'usage_count_real' => TelemetryEvent::selectRaw('count(*)')
                    ->whereColumn('model_id', 'templates.id')
                    ->where('model_type', 'Template')
                    ->where('event_type', 'usage')
            ])
            ->get()
            ->map(function($template) {
                $template->conversion_rate = $template->impressions_count > 0 
                    ? ($template->usage_count_real / $template->impressions_count) * 100 
                    : 0;
                return $template;
            })
            ->sortByDesc('conversion_rate')
            ->take(10);

        return Inertia::render('Admin/Analytics/Index', [
            'stats' => $stats,
            'funnelData' => $funnel,
            'topTemplates' => $topTemplates->values(), // values() to reset keys for JSON array
        ]);
    }
}
