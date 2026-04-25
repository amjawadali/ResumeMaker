<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Template;
use App\Services\ModerationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class TemplateController extends Controller
{
    protected $moderation;

    public function __construct(ModerationService $moderation)
    {
        $this->moderation = $moderation;
    }

    public function index()
    {
        $templates = Template::where('status', '!=', 'pending')->latest()->get();
        return \Inertia\Inertia::render('Admin/Templates/Index', compact('templates'));
    }

    public function moderationIndex()
    {
        $templates = Template::where('status', 'pending')
            ->orWhere('is_deletion_requested', true)
            ->latest()
            ->get();
        $user = auth()->user()->load(['userDetail', 'educations', 'experiences', 'skills', 'certifications', 'languages']);

        return \Inertia\Inertia::render('Admin/Templates/Moderation', [
            'templates' => $templates,
            'adminProfile' => [
                'userDetail' => $user->userDetail ?? new \App\Models\UserDetail(),
                'educations' => $user->educations,
                'experiences' => $user->experiences,
                'skills' => $user->skills,
                'certifications' => $user->certifications,
                'languages' => $user->languages
            ]
        ]);
    }

    public function approve(Template $template)
    {
        $this->moderation->approve($template);
        return back()->with('success', 'Template approved and published!');
    }

    public function reject(Template $template, Request $request)
    {
        $request->validate(['reason' => 'required|string']);
        $this->moderation->reject($template, $request->reason);
        return back()->with('success', 'Template rejected.');
    }

    public function approveDeletion(Template $template)
    {
        // Actually soft delete the template
        $template->delete();
        
        return back()->with('success', 'Template systematically un-published/soft-deleted.');
    }

    public function create()
    {
        return \Inertia\Inertia::render('Admin/Templates/Form');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category' => 'required|string|in:modern,classic,creative,minimal,executive',
            'blade_view' => 'required|string|max:255',
            'preview_image' => 'nullable|image|max:2048',
            'is_active' => 'boolean',
        ]);

        $validated['slug'] = Str::slug($validated['name']);

        if ($request->hasFile('preview_image')) {
            $path = $request->file('preview_image')->store('template_previews', 'public');
            $validated['preview_image'] = $path;
        }

        Template::create($validated);

        return redirect()->route('admin.templates.index')->with('success', 'Template created successfully!');
    }

    public function edit(Template $template)
    {
        return \Inertia\Inertia::render('Admin/Templates/Form', compact('template'));
    }

    public function update(Request $request, Template $template)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category' => 'required|string|in:modern,classic,creative,minimal,executive',
            'blade_view' => 'required|string|max:255',
            'preview_image' => 'nullable|image|max:2048',
            'is_active' => 'boolean',
        ]);

        $validated['slug'] = Str::slug($validated['name']);

        if ($request->hasFile('preview_image')) {
            if ($template->preview_image) {
                Storage::disk('public')->delete($template->preview_image);
            }
            $path = $request->file('preview_image')->store('template_previews', 'public');
            $validated['preview_image'] = $path;
        }

        $template->update($validated);

        return redirect()->route('admin.templates.index')->with('success', 'Template updated successfully!');
    }

    public function destroy(Template $template)
    {
        if ($template->resumes()->count() > 0) {
            return redirect()->route('admin.templates.index')->with('error', 'Cannot delete template with existing resumes!');
        }

        if ($template->preview_image) {
            Storage::disk('public')->delete($template->preview_image);
        }

        $template->delete();

        return redirect()->route('admin.templates.index')->with('success', 'Template deleted successfully!');
    }

    public function toggleActive(Template $template)
    {
        $template->update(['is_active' => !$template->is_active]);

        return redirect()->route('admin.templates.index')->with('success', 'Template status updated successfully!');
    }
}
