<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Template;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class TemplateController extends Controller
{
    public function index()
    {
        $templates = Template::latest()->get();
        return view('admin.templates.index', compact('templates'));
    }

    public function create()
    {
        return view('admin.templates.create');
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
        return view('admin.templates.edit', compact('template'));
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
