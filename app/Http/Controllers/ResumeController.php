<?php

namespace App\Http\Controllers;

use App\Models\Resume;
use App\Models\Template;
use App\Models\UserDetail;
use App\Http\Requests\StoreResumeRequest;
use App\Http\Requests\UpdateResumeRequest;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class ResumeController extends Controller
{
    use AuthorizesRequests;
    public function index()
    {
        $user = auth()->user()->loadCount(['resumes', 'educations', 'experiences', 'skills', 'certifications']);
        $resumes = $user->resumes()->with('template')->latest()->get();
        
        // Calculate profile completion percentage
        $completion = 0;
        if ($user->userDetail()->exists()) $completion += 20;
        if ($user->educations_count > 0) $completion += 20;
        if ($user->experiences_count > 0) $completion += 20;
        if ($user->skills_count > 0) $completion += 20;
        if ($user->certifications_count > 0) $completion += 20;

        return view('resumes.index', compact('resumes', 'user', 'completion'));
    }

    public function create()
    {
        $templates = Template::active()->get();
        return view('resumes.create', compact('templates'));
    }

    public function store(StoreResumeRequest $request)
    {
        \Illuminate\Support\Facades\Log::info('Resume store request:', $request->all());
        
        $validated = $request->validated();
        
        \Illuminate\Support\Facades\Log::info('Validated data:', $validated);

        $validated['user_id'] = auth()->id();
        $validated['sections_visibility'] = $validated['sections_visibility'] ?? [
            'personal_info' => true,
            'summary' => true,
            'experience' => true,
            'education' => true,
            'skills' => true,
            'certifications' => true,
        ];

        // Initialize new React-frontend fields to avoid null issues
        $validated['custom_styling'] = [];
        $validated['sections_order'] = [];
        $validated['content_override'] = [];

        try {
            $resume = Resume::create($validated);
            \Illuminate\Support\Facades\Log::info('Resume created:', ['id' => $resume->id]);
            return redirect()->route('resumes.edit', $resume)->with('success', 'Resume created successfully! Now start designing.');
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Resume creation failed:', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return back()->withErrors(['error' => 'Failed to create resume: ' . $e->getMessage()]);
        }
    }

    public function show(Resume $resume)
    {
        $this->authorize('view', $resume);
        
        $resume->load('template');
        $user = auth()->user()->load(['userDetail', 'educations', 'experiences', 'skills', 'certifications', 'languages']);

        // Extract data for views
        $userDetail = $user->userDetail ?? new UserDetail();
        $educations = $user->educations;
        $experiences = $user->experiences;
        $skills = $user->skills;
        $certifications = $user->certifications;
        $languages = $user->languages;
        
        return view('resumes.show', compact('resume', 'user', 'userDetail', 'educations', 'experiences', 'skills', 'certifications', 'languages'));
    }

    public function preview(Resume $resume)
    {
        $this->authorize('view', $resume);
        
        $resume->load('template');
        $user = auth()->user()->load(['userDetail', 'educations', 'experiences', 'skills', 'certifications', 'languages']);

        return view('resumes.preview-layout', [
            'template_view' => $resume->template->blade_view,
            'data' => [
                'resume' => $resume,
                'user' => $user,
                'userDetail' => $user->userDetail ?? new UserDetail(),
                'educations' => $user->educations,
                'experiences' => $user->experiences,
                'skills' => $user->skills,
                'certifications' => $user->certifications,
                'languages' => $user->languages,
                'mode' => 'preview'
            ]
        ]);
    }

    public function edit(Resume $resume)
    {
        $this->authorize('update', $resume);
        
        $resume->load('template');
        $user = auth()->user()->load(['userDetail', 'educations', 'experiences', 'skills', 'certifications', 'languages']);

        return view('resumes.edit', [
            'resume' => $resume,
            'user' => $user,
            'userDetail' => $user->userDetail ?? new UserDetail(),
            'educations' => $user->educations,
            'experiences' => $user->experiences,
            'skills' => $user->skills,
            'certifications' => $user->certifications,
            'languages' => $user->languages
        ]);
    }

    public function exportCanvas(Resume $resume)
    {
        $this->authorize('view', $resume);
        return view('resumes.export-canvas', compact('resume'));
    }

    public function update(UpdateResumeRequest $request, Resume $resume)
    {
        $this->authorize('update', $resume);

        $resume->update($request->validated());

        if ($request->wantsJson()) {
            return response()->json([
                'message' => 'Resume updated successfully!',
                'resume' => $resume
            ]);
        }

        return redirect()->route('resumes.show', $resume)->with('success', 'Resume updated successfully!');
    }

    public function destroy(Resume $resume)
    {
        $this->authorize('delete', $resume);

        // Delete PDF if exists
        if ($resume->pdf_path) {
            Storage::disk('public')->delete($resume->pdf_path);
        }

        $resume->delete();

        return redirect()->route('resumes.index')->with('success', 'Resume deleted successfully!');
    }

    public function duplicate(Resume $resume)
    {
        $this->authorize('view', $resume);

        $newResume = $resume->replicate();
        $newResume->title = $resume->title . ' (Copy)';
        $newResume->pdf_path = null;
        $newResume->last_generated_at = null;
        $newResume->save();

        return redirect()->route('resumes.edit', $newResume)->with('success', 'Resume duplicated successfully!');
    }

    public function generatePdf(Resume $resume)
    {
        $this->authorize('download', $resume);

        $resume->load('template');

        // For Konva canvas resumes, we use the expert-canvas route
        $url = route('resumes.export-canvas', $resume);
        
        // Generate filename
        $filename = 'resumes/' . $resume->id . '_' . time() . '.pdf';
        $fullPath = storage_path('app/public/' . $filename);
        
        // Ensure directory exists
        if (!file_exists(dirname($fullPath))) {
            mkdir(dirname($fullPath), 0755, true);
        }

        // Use Browsershot to capture the page as PDF
        \Spatie\Browsershot\Browsershot::url($url)
            ->noSandbox()
            ->windowSize(794, 1123)
            ->format('A4')
            ->margins(0, 0, 0, 0)
            ->showBackground()
            ->waitUntilNetworkIdle()
            ->save($fullPath);

        // Delete old PDF if exists
        if ($resume->pdf_path && Storage::disk('public')->exists($resume->pdf_path)) {
            Storage::disk('public')->delete($resume->pdf_path);
        }

        // Update resume
        $resume->update([
            'pdf_path' => $filename,
            'last_generated_at' => now(),
        ]);

        return response()->download($fullPath);
    }

    public function downloadPdf(Resume $resume)
    {
        $this->authorize('download', $resume);

        if (!$resume->pdf_path || !Storage::disk('public')->exists($resume->pdf_path)) {
            return $this->generatePdf($resume);
        }

        return response()->download(storage_path('app/public/' . $resume->pdf_path));
    }
}
