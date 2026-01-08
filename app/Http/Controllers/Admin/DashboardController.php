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

        return view('admin.dashboard', compact('stats', 'recentUsers', 'recentResumes', 'popularTemplates'));
    }
}
