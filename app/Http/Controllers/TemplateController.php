<?php

namespace App\Http\Controllers;

use App\Models\Template;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class TemplateController extends Controller
{
    use AuthorizesRequests;
    public function index(\Illuminate\Http\Request $request)
    {
        $isAdmin = auth()->user() && auth()->user()->hasAnyRole(['admin', 'super-admin']);
        $category = $request->query('category', 'All');
        $search = $request->query('search');
        $sort = $request->query('sort', 'popular');

        $query = Template::query();
        
        if (!$isAdmin) {
            $query->publicApproved();
        }

        $templates = $query->with(['user', 'tags'])
            ->withCount('resumes')
            ->search($search)
            ->inCategory($category)
            ->sortBy($sort)
            ->paginate(12)
            ->withQueryString();

        $user = auth()->user();
        if ($user) {
            $user->load(['userDetail', 'educations', 'experiences', 'skills']);
        }

        return \Inertia\Inertia::render('Templates/Index', [
            'templates' => $templates,
            'filters' => [
                'category' => $category,
                'search' => $search,
                'sort' => $sort,
            ],
            'categories' => Template::active()->distinct('category')->pluck('category'),
            'profile' => $user ? [
                'userDetail' => $user->userDetail,
                'experiences' => $user->experiences,
                'educations' => $user->educations,
                'skills' => $user->skills,
            ] : null
        ]);
    }

    public function publish(\Illuminate\Http\Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'category' => 'required|string',
            'canvas_data' => 'required|array',
            'preview_image' => 'required|string', // Base64 from Konva
        ]);

        $isAdmin = auth()->user() && auth()->user()->hasAnyRole(['admin', 'super-admin']);

        // 1. Create template with placeholder image
        $template = Template::create([
            'user_id' => auth()->id(),
            'name' => $request->title,
            'slug' => \Illuminate\Support\Str::slug($request->title) . '-' . rand(1000, 9999),
            'description' => $request->description,
            'category' => $request->category,
            'preview_image' => '/assets/placeholder-preview.png', // Temporary placeholder
            'canvas_data' => $request->canvas_data,
            'type' => 'user_content',
            'is_public' => $request->is_public ?? true,
            'status' => $isAdmin ? 'approved' : 'pending',
            'is_active' => $isAdmin,
        ]);

        // 2. Dispatch background job for high-quality snapshot
        \App\Jobs\ProcessSnapshot::dispatch(
            $template, 
            $request->preview_image, 
            'preview_image', 
            'templates/previews'
        );

        // 3. Create the first version record
        $template->versions()->create([
            'version' => '1.0.0',
            'canvas_data' => $request->canvas_data,
            'changelog' => 'Initial publication'
        ]);

        return response()->json([
            'message' => $isAdmin ? 'Template published successfully' : 'Template submitted for moderation',
            'template' => $template
        ]);
    }

    public function requestDeletion(Template $template)
    {
        $this->authorize('delete', $template);

        $template->update(['is_deletion_requested' => true]);

        return redirect()->back()->with('success', 'Deletion requested. An admin will review your request.');
    }

    public function creatorDashboard()
    {
        $isAdmin = auth()->user() && auth()->user()->hasAnyRole(['admin', 'super-admin']);

        $query = Template::query();
        
        if (!$isAdmin) {
            $query->where('user_id', auth()->id());
        }

        $templates = $query->withCount('resumes')
            ->latest()
            ->get();

        return \Inertia\Inertia::render('Creator/Dashboard', [
            'templates' => $templates
        ]);
    }

    public function createForDeveloper(\Illuminate\Http\Request $request)
    {
        // Initialize a blank canvas for the developer
        $blankTemplate = [
            'title' => 'New Template Design',
            'pages' => [
                [
                    'id' => 'page-1',
                    'title' => 'Page 1',
                    'elements' => []
                ]
            ]
        ];

        $user = auth()->user()->load(['userDetail', 'educations', 'experiences', 'skills', 'certifications', 'languages']);
        
        return \Inertia\Inertia::render('Editor/TemplateStudio', [
            'initialData' => $blankTemplate,
            'mode' => 'developer',
            'profile' => [
                'userDetail' => $user->userDetail ?? new \App\Models\UserDetail(),
                'educations' => $user->educations,
                'experiences' => $user->experiences,
                'skills' => $user->skills,
                'certifications' => $user->certifications,
                'languages' => $user->languages
            ]
        ]);
    }

    public function editForDeveloper(Template $template)
    {
        $this->authorize('update', $template);

        $user = auth()->user()->load(['userDetail', 'educations', 'experiences', 'skills', 'certifications', 'languages']);

        return \Inertia\Inertia::render('Editor/TemplateStudio', [
            'initialData' => $template->canvas_data,
            'template' => $template,
            'mode' => 'developer',
            'profile' => [
                'userDetail' => $user->userDetail ?? new \App\Models\UserDetail(),
                'educations' => $user->educations,
                'experiences' => $user->experiences,
                'skills' => $user->skills,
                'certifications' => $user->certifications,
                'languages' => $user->languages
            ]
        ]);
    }

    public function show(Template $template)
    {
        $this->authorize('view', $template);
        return \Inertia\Inertia::render('Templates/Show', compact('template'));
    }

    public function preview(Template $template)
    {
        $this->authorize('view', $template);
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
