<?php

namespace App\Http\Controllers;

use App\Models\Template;

class TemplateController extends Controller
{
    public function index()
    {
        $templates = Template::active()->get();
        return \Inertia\Inertia::render('Templates/Index', compact('templates'));
    }

    public function show(Template $template)
    {
        return \Inertia\Inertia::render('Templates/Show', compact('template'));
    }

    public function preview(Template $template)
    {
        $user = auth()->user()->load(['userDetail', 'educations', 'experiences', 'skills', 'certifications', 'languages']);
        
        // Mock a resume object for the template
        $resume = (object) [
            'id' => 0,
            'title' => 'Sample Resume',
            'sections_visibility' => [
                'personal_info' => true,
                'summary' => true,
                'experience' => true,
                'education' => true,
                'skills' => true,
                'certifications' => true,
                'languages' => true,
            ]
        ];

        return \Inertia\Inertia::render('Resumes/Preview', [
            'resume' => $resume,
            'template_view' => $template->blade_view,
            'mode' => 'preview',
            'data' => [
                'user' => $user,
                'userDetail' => $user->userDetail ?? new \App\Models\UserDetail(),
                'educations' => $user->educations,
                'experiences' => $user->experiences,
                'skills' => $user->skills,
                'certifications' => $user->certifications,
                'languages' => $user->languages
            ]
        ]);
    }
}
