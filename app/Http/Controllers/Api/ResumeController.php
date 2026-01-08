<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Resume;
use App\Http\Resources\ResumeResource;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ResumeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $resumes = $request->user()->resumes()->with('template')->latest()->get();
        return ResumeResource::collection($resumes);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'template_id' => 'required|exists:templates,id',
        ]);

        $resume = $request->user()->resumes()->create([
            'title' => $validated['title'],
            'template_id' => $validated['template_id'],
            'sections_visibility' => [], // Default all visible
            'custom_styling' => [], // Use template defaults initially
            'sections_order' => [], // Use template default order
            'content_override' => [], // No overrides initially
        ]);

        return new ResumeResource($resume->load('template'));
    }

    /**
     * Display the specified resource.
     */
    public function show(Resume $resume)
    {
        $this->authorize('view', $resume);
        return new ResumeResource($resume->load('template'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Resume $resume)
    {
        $this->authorize('update', $resume);

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'sections_visibility' => 'sometimes|array',
            'custom_styling' => 'sometimes|array',
            'content_override' => 'sometimes|array',
            'sections_order' => 'sometimes|array',
        ]);

        $resume->update($validated);

        return new ResumeResource($resume);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Resume $resume)
    {
        $this->authorize('delete', $resume);
        $resume->delete();
        return response()->noContent();
    }
}
