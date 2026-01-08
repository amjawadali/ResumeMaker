<?php

namespace App\Http\Controllers;

use App\Models\Template;

class TemplateController extends Controller
{
    public function index()
    {
        $templates = Template::active()->get();
        return view('templates.index', compact('templates'));
    }

    public function show(Template $template)
    {
        return view('templates.show', compact('template'));
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

        return view('resumes.preview-layout', [
            'template_view' => $template->blade_view,
            'data' => [
                'resume' => $resume,
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
