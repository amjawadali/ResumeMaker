<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Resume;
use App\Models\Template;
use App\Models\User;

class DashboardController extends Controller
{
    public function index()
    {
        $stats = [
            'total_users' => User::count(),
            'total_resumes' => Resume::count(),
            'total_templates' => Template::count(),
            'active_templates' => Template::active()->count(),
        ];

        $recentUsers = User::latest()->take(5)->get();
        $recentResumes = Resume::with(['user', 'template'])->latest()->take(10)->get();
        $popularTemplates = Template::withCount('resumes')->orderBy('resumes_count', 'desc')->take(5)->get();

        return \Inertia\Inertia::render('Admin/Dashboard', [
            'stats' => array_merge($stats, [
                'recent_users' => $recentUsers,
                'recent_resumes' => $recentResumes,
                'popular_templates' => $popularTemplates
            ])
        ]);
    }
}
