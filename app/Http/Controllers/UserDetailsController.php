<?php

namespace App\Http\Controllers;

use App\Models\Certification;
use App\Models\Education;
use App\Models\Experience;
use App\Models\Skill;
use App\Models\Language;
use App\Models\UserDetail;
use App\Http\Requests\StoreEducationRequest;
use App\Http\Requests\StoreExperienceRequest;
use App\Http\Requests\StoreSkillRequest;
use App\Http\Requests\StoreLanguageRequest;
use App\Http\Requests\StoreCertificationRequest;
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

        return \Inertia\Inertia::render('UserDetails/Index', compact(
            'userDetail',
            'educations',
            'experiences',
            'skills',
            'languages',
            'certifications'
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

    public function uploadImage(Request $request)
    {
        $request->validate([
            'profile_image' => 'required|image|max:10240', // 10MB
        ]);

        if ($request->hasFile('profile_image')) {
            $image = $request->file('profile_image');
            $userId = auth()->id();
            $filename = $userId . '_' . time() . '_' . $image->getClientOriginalName();
            $path = 'uploads/' . $filename;

            if (!Storage::disk('public')->exists('uploads')) {
                Storage::disk('public')->makeDirectory('uploads');
            }

            Storage::disk('public')->put($path, file_get_contents($image));
            
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
