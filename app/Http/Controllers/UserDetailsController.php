<?php

namespace App\Http\Controllers;

use App\Models\Certification;
use App\Models\Education;
use App\Models\Experience;
use App\Models\Skill;
use App\Models\Language;
use App\Models\UserDetail;
use App\Models\Project;
use App\Models\Award;
use App\Models\VolunteerWork;
use App\Models\Publication;
use App\Http\Requests\StoreEducationRequest;
use App\Http\Requests\StoreExperienceRequest;
use App\Http\Requests\StoreSkillRequest;
use App\Http\Requests\StoreLanguageRequest;
use App\Http\Requests\StoreCertificationRequest;
use App\Http\Requests\StoreProjectRequest;
use App\Http\Requests\StoreAwardRequest;
use App\Http\Requests\StoreVolunteerWorkRequest;
use App\Http\Requests\StorePublicationRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class UserDetailsController extends Controller
{
    use AuthorizesRequests;
    public function index()
    {
        $user = auth()->user();
        $userDetail = $user->userDetail ?? new UserDetail();
        $educations = $user->educations;
        $experiences = $user->experiences;
        $skills = $user->skills;
        $languages = $user->languages;
        $certifications = $user->certifications;
        $projects = $user->projects;
        $awards = $user->awards;
        $volunteerWorks = $user->volunteerWorks;
        $publications = $user->publications;

        return \Inertia\Inertia::render('UserDetails/Index', compact(
            'userDetail',
            'educations',
            'experiences',
            'skills',
            'languages',
            'certifications',
            'projects',
            'awards',
            'volunteerWorks',
            'publications'
        ));
    }

    public function updatePersonalInfo(Request $request)
    {
        $validated = $request->validate([
            'full_name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:100',
            'zip_code' => 'nullable|string|max:20',
            'country' => 'nullable|string|max:100',
            'website' => 'nullable|url|max:255',
            'social_links' => 'nullable|array',
            'social_links.*.name' => 'required|string|max:50',
            'social_links.*.icon' => 'required|string|max:50',
            'social_links.*.url' => 'required|url',
            'professional_summary' => 'nullable|string',
            'profile_photo' => 'nullable|image|max:2048',
        ]);

        $user = auth()->user();
        $userDetail = $user->userDetail ?? new UserDetail(['user_id' => $user->id]);

        if ($request->hasFile('profile_photo')) {
            if ($userDetail->profile_photo) {
                Storage::disk('public')->delete($userDetail->profile_photo);
            }

            $image = $request->file('profile_photo');
            $filename = time() . '.' . $image->getClientOriginalExtension();
            $path = 'profile_photos/' . $filename;

            // Resize image using Intervention Image v3
            $manager = new ImageManager(new Driver());
            $processedImage = $manager->read($image);
            $processedImage->cover(400, 400); // Circular/Square cropping

            Storage::disk('public')->put($path, $processedImage->toJpeg()->toString());
            $validated['profile_photo'] = $path;
        }

        $userDetail->fill($validated);
        $userDetail->save();

        return redirect()->route('user-details.index')->with('success', 'Personal information updated successfully!')->with('active_tab', 'personal');
    }

    // Education CRUD
    public function storeEducation(StoreEducationRequest $request)
    {
        $validated = $request->validated();
        $validated['user_id'] = auth()->id();
        $validated['currently_studying'] = $request->boolean('currently_studying');
        $validated['order'] = auth()->user()->educations()->max('order') + 1;

        Education::create($validated);

        return redirect()->route('user-details.index')->with('success', 'Education added successfully!')->with('active_tab', 'education');
    }

    public function updateEducation(StoreEducationRequest $request, Education $education)
    {
        $this->authorize('update', $education);
        $validated = $request->validated();
        $validated['currently_studying'] = $request->boolean('currently_studying');
        $education->update($validated);

        return redirect()->route('user-details.index')->with('success', 'Education updated successfully!')->with('active_tab', 'education');
    }

    public function deleteEducation(Education $education)
    {
        $this->authorize('delete', $education);
        $education->delete();

        return redirect()->route('user-details.index')->with('success', 'Education deleted successfully!')->with('active_tab', 'education');
    }

    // Experience CRUD
    public function storeExperience(StoreExperienceRequest $request)
    {
        $validated = $request->validated();
        $validated['user_id'] = auth()->id();
        $validated['currently_working'] = $request->boolean('currently_working');
        $validated['order'] = auth()->user()->experiences()->max('order') + 1;

        Experience::create($validated);

        return redirect()->route('user-details.index')->with('success', 'Experience added successfully!')->with('active_tab', 'experience');
    }

    public function updateExperience(StoreExperienceRequest $request, Experience $experience)
    {
        $this->authorize('update', $experience);
        $validated = $request->validated();
        $validated['currently_working'] = $request->boolean('currently_working');
        $experience->update($validated);

        return redirect()->route('user-details.index')->with('success', 'Experience updated successfully!')->with('active_tab', 'experience');
    }

    public function deleteExperience(Experience $experience)
    {
        $this->authorize('delete', $experience);
        $experience->delete();

        return redirect()->route('user-details.index')->with('success', 'Experience deleted successfully!')->with('active_tab', 'experience');
    }

    // Skill CRUD
    public function storeSkill(StoreSkillRequest $request)
    {
        $validated = $request->validated();
        $validated['user_id'] = auth()->id();
        $validated['order'] = auth()->user()->skills()->max('order') + 1;

        Skill::create($validated);

        return redirect()->route('user-details.index')->with('success', 'Skill added successfully!')->with('active_tab', 'skills');
    }

    public function updateSkill(StoreSkillRequest $request, Skill $skill)
    {
        $this->authorize('update', $skill);
        $skill->update($request->validated());

        return redirect()->route('user-details.index')->with('success', 'Skill updated successfully!')->with('active_tab', 'skills');
    }

    public function deleteSkill(Skill $skill)
    {
        $this->authorize('delete', $skill);
        $skill->delete();

        return redirect()->route('user-details.index')->with('success', 'Skill deleted successfully!')->with('active_tab', 'skills');
    }

    // Certification CRUD
    public function storeCertification(StoreCertificationRequest $request)
    {
        $validated = $request->validated();
        $validated['user_id'] = auth()->id();
        $validated['order'] = auth()->user()->certifications()->max('order') + 1;

        Certification::create($validated);

        return redirect()->route('user-details.index')->with('success', 'Certification added successfully!')->with('active_tab', 'certifications');
    }

    public function updateCertification(StoreCertificationRequest $request, Certification $certification)
    {
        $this->authorize('update', $certification);
        $certification->update($request->validated());

        return redirect()->route('user-details.index')->with('success', 'Certification updated successfully!')->with('active_tab', 'certifications');
    }

    public function deleteCertification(Certification $certification)
    {
        $this->authorize('delete', $certification);
        $certification->delete();

        return redirect()->route('user-details.index')->with('success', 'Certification deleted successfully!')->with('active_tab', 'certifications');
    }

    // Language CRUD
    public function storeLanguage(StoreLanguageRequest $request)
    {
        $this->authorize('create', Language::class);

        $validated = $request->validated();
        $validated['user_id'] = auth()->id();
        $validated['order'] = auth()->user()->languages()->max('order') + 1;

        Language::create($validated);

        return redirect()->route('user-details.index')->with('success', 'Language added successfully!')->with('active_tab', 'languages');
    }

    public function updateLanguage(StoreLanguageRequest $request, Language $language)
    {
        $this->authorize('update', $language);
        $language->update($request->validated());

        return redirect()->route('user-details.index')->with('success', 'Language updated successfully!')->with('active_tab', 'languages');
    }

    public function deleteLanguage(Language $language)
    {
        $this->authorize('delete', $language);
        $language->delete();
        
        return redirect()->route('user-details.index')->with('success', 'Language deleted successfully!')->with('active_tab', 'languages');
    }

    // Project CRUD
    public function storeProject(StoreProjectRequest $request)
    {
        $validated = $request->validated();
        $validated['user_id'] = auth()->id();
        $validated['order'] = auth()->user()->projects()->max('order') + 1;

        Project::create($validated);

        return redirect()->route('user-details.index')->with('success', 'Project added successfully!')->with('active_tab', 'projects');
    }

    public function updateProject(StoreProjectRequest $request, Project $project)
    {
        $this->authorize('update', $project);
        $project->update($request->validated());

        return redirect()->route('user-details.index')->with('success', 'Project updated successfully!')->with('active_tab', 'projects');
    }

    public function deleteProject(Project $project)
    {
        $this->authorize('delete', $project);
        $project->delete();

        return redirect()->route('user-details.index')->with('success', 'Project deleted successfully!')->with('active_tab', 'projects');
    }

    // Award CRUD
    public function storeAward(StoreAwardRequest $request)
    {
        $validated = $request->validated();
        $validated['user_id'] = auth()->id();
        $validated['order'] = auth()->user()->awards()->max('order') + 1;

        Award::create($validated);

        return redirect()->route('user-details.index')->with('success', 'Award added successfully!')->with('active_tab', 'awards');
    }

    public function updateAward(StoreAwardRequest $request, Award $award)
    {
        $this->authorize('update', $award);
        $award->update($request->validated());

        return redirect()->route('user-details.index')->with('success', 'Award updated successfully!')->with('active_tab', 'awards');
    }

    public function deleteAward(Award $award)
    {
        $this->authorize('delete', $award);
        $award->delete();

        return redirect()->route('user-details.index')->with('success', 'Award deleted successfully!')->with('active_tab', 'awards');
    }

    // VolunteerWork CRUD
    public function storeVolunteerWork(StoreVolunteerWorkRequest $request)
    {
        $validated = $request->validated();
        $validated['user_id'] = auth()->id();
        $validated['currently_volunteering'] = $request->boolean('currently_volunteering');
        $validated['order'] = auth()->user()->volunteerWorks()->max('order') + 1;

        VolunteerWork::create($validated);

        return redirect()->route('user-details.index')->with('success', 'Volunteer work added successfully!')->with('active_tab', 'volunteering');
    }

    public function updateVolunteerWork(StoreVolunteerWorkRequest $request, VolunteerWork $volunteerWork)
    {
        $this->authorize('update', $volunteerWork);
        $validated = $request->validated();
        $validated['currently_volunteering'] = $request->boolean('currently_volunteering');
        $volunteerWork->update($validated);

        return redirect()->route('user-details.index')->with('success', 'Volunteer work updated successfully!')->with('active_tab', 'volunteering');
    }

    public function deleteVolunteerWork(VolunteerWork $volunteerWork)
    {
        $this->authorize('delete', $volunteerWork);
        $volunteerWork->delete();

        return redirect()->route('user-details.index')->with('success', 'Volunteer work deleted successfully!')->with('active_tab', 'volunteering');
    }

    // Publication CRUD
    public function storePublication(StorePublicationRequest $request)
    {
        $validated = $request->validated();
        $validated['user_id'] = auth()->id();
        $validated['order'] = auth()->user()->publications()->max('order') + 1;

        Publication::create($validated);

        return redirect()->route('user-details.index')->with('success', 'Publication added successfully!')->with('active_tab', 'publications');
    }

    public function updatePublication(StorePublicationRequest $request, Publication $publication)
    {
        $this->authorize('update', $publication);
        $publication->update($request->validated());

        return redirect()->route('user-details.index')->with('success', 'Publication updated successfully!')->with('active_tab', 'publications');
    }

    public function deletePublication(Publication $publication)
    {
        $this->authorize('delete', $publication);
        $publication->delete();

        return redirect()->route('user-details.index')->with('success', 'Publication deleted successfully!')->with('active_tab', 'publications');
    }

    public function uploadImage(Request $request)
    {
        $request->validate([
            'profile_image' => 'required|image|max:10240', // 10MB
        ]);

        if ($request->hasFile('profile_image')) {
            $image = $request->file('profile_image');
            $path = $image->store('uploads', 'public');
            
            return response()->json([
                'url' => asset('storage/' . $path),
                'path' => $path
            ]);
        }

        return response()->json(['error' => 'No image uploaded'], 400);
    }
    public function deleteImage(Request $request)
    {
        $request->validate([
            'path' => 'required|string',
        ]);

        $path = $request->input('path');
        $userId = auth()->id();

        // Security check: ensure the filename starts with the user's ID
        if (!\Illuminate\Support\Str::startsWith(basename($path), $userId . '_')) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        // Remove asset() / storage/ prefix if it exists to get relative path
        $relativePath = str_replace(asset('storage/'), '', $path);
        if (Storage::disk('public')->exists($relativePath)) {
            Storage::disk('public')->delete($relativePath);
            return response()->json(['success' => true]);
        }

        return response()->json(['error' => 'File not found'], 404);
    }


}

