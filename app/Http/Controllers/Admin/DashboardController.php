<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Resume;
use App\Models\Template;
use App\Models\User;
use Spatie\Activitylog\Models\Activity;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index()
    {
        // 1. Basic Stats with Growth Calculation
        $now = Carbon::now();
        $thirtyDaysAgo = (clone $now)->subDays(30);
        $sixtyDaysAgo = (clone $now)->subDays(60);

        $totalUsers = User::count();
        $prevUsers = User::where('created_at', '<', $thirtyDaysAgo)->where('created_at', '>=', $sixtyDaysAgo)->count();
        $userGrowth = $prevUsers > 0 ? (($totalUsers - $prevUsers) / $prevUsers) * 100 : 100;

        $totalResumes = Resume::count();
        $prevResumes = Resume::where('created_at', '<', $thirtyDaysAgo)->where('created_at', '>=', $sixtyDaysAgo)->count();
        $resumeGrowth = $prevResumes > 0 ? (($totalResumes - $prevResumes) / $prevResumes) * 100 : 100;

        $stats = [
            'total_users' => [
                'value' => $totalUsers,
                'growth' => round($userGrowth, 1)
            ],
            'total_resumes' => [
                'value' => $totalResumes,
                'growth' => round($resumeGrowth, 1)
            ],
            'total_templates' => Template::count(),
            'active_templates' => Template::active()->count(),
            'pending_templates' => Template::where('status', 'pending')->count(),
        ];

        // 2. Trend Data (Last 14 Days)
        $trends = $this->getTrendData();

        // 3. Activity Feed
        $activityLogs = Activity::with('causer')
            ->latest()
            ->take(10)
            ->get()
            ->map(function($activity) {
                return [
                    'id' => $activity->id,
                    'description' => $activity->description,
                    'subject_type' => basename($activity->subject_type),
                    'causer_name' => $activity->causer ? $activity->causer->name : 'System',
                    'event' => $activity->event,
                    'time' => $activity->created_at->diffForHumans(),
                    'properties' => $activity->properties
                ];
            });

        $recentUsers = User::latest()->take(5)->get();
        $recentResumes = Resume::with(['user', 'template'])->latest()->take(5)->get();
        $popularTemplates = Template::withCount('resumes')->orderBy('resumes_count', 'desc')->take(5)->get();

        return \Inertia\Inertia::render('Admin/Dashboard', [
            'stats' => $stats,
            'trends' => $trends,
            'activities' => $activityLogs,
            'recent_users' => $recentUsers,
            'recent_resumes' => $recentResumes,
            'popular_templates' => $popularTemplates
        ]);
    }

    private function getTrendData()
    {
        $days = [];
        for ($i = 13; $i >= 0; $i--) {
            $date = Carbon::now()->subDays($i)->format('Y-m-d');
            $days[$date] = [
                'date' => Carbon::parse($date)->format('M d'),
                'users' => 0,
                'resumes' => 0
            ];
        }

        $userTrends = User::where('created_at', '>=', Carbon::now()->subDays(14))
            ->select(DB::raw('DATE(created_at) as date'), DB::raw('count(*) as aggregate'))
            ->groupBy('date')
            ->get();

        foreach ($userTrends as $trend) {
            if (isset($days[$trend->date])) {
                $days[$trend->date]['users'] = $trend->aggregate;
            }
        }

        $resumeTrends = Resume::where('created_at', '>=', Carbon::now()->subDays(14))
            ->select(DB::raw('DATE(created_at) as date'), DB::raw('count(*) as aggregate'))
            ->groupBy('date')
            ->get();

        foreach ($resumeTrends as $trend) {
            if (isset($days[$trend->date])) {
                $days[$trend->date]['resumes'] = $trend->aggregate;
            }
        }

        return array_values($days);
    }
}
