<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\UserDetailsController;
use App\Http\Controllers\ResumeController;
use App\Http\Controllers\ResumeSyncController;
use App\Http\Controllers\TemplateController;
use App\Http\Controllers\TelemetryController;
use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\TemplateController as AdminTemplateController;
use App\Http\Controllers\Admin\UserController as AdminUserController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

// Public Template Routes
Route::get('/templates', [TemplateController::class, 'index'])->name('templates.index');
Route::get('/templates/{template}', [TemplateController::class, 'show'])->name('templates.show');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', [ResumeController::class, 'index'])->name('dashboard');

    // User Profile / Details Management
    Route::prefix('user-details')->name('user-details.')->group(function () {
        Route::get('/', [UserDetailsController::class, 'index'])->name('index');
        Route::post('/personal-info', [UserDetailsController::class, 'updatePersonalInfo'])->name('update-personal-info');
        
        Route::post('/education', [UserDetailsController::class, 'storeEducation'])->name('education.store');
        Route::put('/education/{education}', [UserDetailsController::class, 'updateEducation'])->name('education.update');
        Route::delete('/education/{education}', [UserDetailsController::class, 'deleteEducation'])->name('education.destroy');

        Route::post('/experience', [UserDetailsController::class, 'storeExperience'])->name('experience.store');
        Route::put('/experience/{experience}', [UserDetailsController::class, 'updateExperience'])->name('experience.update');
        Route::delete('/experience/{experience}', [UserDetailsController::class, 'deleteExperience'])->name('experience.destroy');

        Route::post('/skill', [UserDetailsController::class, 'storeSkill'])->name('skill.store');
        Route::put('/skill/{skill}', [UserDetailsController::class, 'updateSkill'])->name('skill.update');
        Route::delete('/skill/{skill}', [UserDetailsController::class, 'deleteSkill'])->name('skill.destroy');

        Route::post('/certification', [UserDetailsController::class, 'storeCertification'])->name('certification.store');
        Route::put('/certification/{certification}', [UserDetailsController::class, 'updateCertification'])->name('certification.update');
        Route::delete('/certification/{certification}', [UserDetailsController::class, 'deleteCertification'])->name('certification.destroy');

        Route::post('/language', [UserDetailsController::class, 'storeLanguage'])->name('language.store');
        Route::put('/language/{language}', [UserDetailsController::class, 'updateLanguage'])->name('language.update');
        Route::delete('/language/{language}', [UserDetailsController::class, 'deleteLanguage'])->name('language.destroy');

        Route::post('/project', [UserDetailsController::class, 'storeProject'])->name('project.store');
        Route::put('/project/{project}', [UserDetailsController::class, 'updateProject'])->name('project.update');
        Route::delete('/project/{project}', [UserDetailsController::class, 'deleteProject'])->name('project.destroy');

        Route::post('/award', [UserDetailsController::class, 'storeAward'])->name('award.store');
        Route::put('/award/{award}', [UserDetailsController::class, 'updateAward'])->name('award.update');
        Route::delete('/award/{award}', [UserDetailsController::class, 'deleteAward'])->name('award.destroy');

        Route::post('/volunteer-work', [UserDetailsController::class, 'storeVolunteerWork'])->name('volunteer-work.store');
        Route::put('/volunteer-work/{volunteerWork}', [UserDetailsController::class, 'updateVolunteerWork'])->name('volunteer-work.update');
        Route::delete('/volunteer-work/{volunteerWork}', [UserDetailsController::class, 'deleteVolunteerWork'])->name('volunteer-work.destroy');

        Route::post('/publication', [UserDetailsController::class, 'storePublication'])->name('publication.store');
        Route::put('/publication/{publication}', [UserDetailsController::class, 'updatePublication'])->name('publication.update');
        Route::delete('/publication/{publication}', [UserDetailsController::class, 'deletePublication'])->name('publication.destroy');

        Route::post('/upload-image', [UserDetailsController::class, 'uploadImage'])->name('upload-image');
        Route::delete('/delete-image', [UserDetailsController::class, 'deleteImage'])->name('delete-image');
        

    });

    Route::resource('resumes', ResumeController::class);
    Route::get('resumes/{resume}/preview', [ResumeController::class, 'preview'])->name('resumes.preview');
    Route::get('resumes/{resume}/export-canvas', [ResumeController::class, 'exportCanvas'])->name('resumes.export-canvas');
    Route::post('resumes/{resume}/duplicate', [ResumeController::class, 'duplicate'])->name('resumes.duplicate');
    Route::get('resumes/{resume}/generate-pdf', [ResumeController::class, 'generatePdf'])->name('resumes.generate-pdf');
    Route::get('resumes/{resume}/download-pdf', [ResumeController::class, 'downloadPdf'])->name('resumes.download-pdf');
    
    // Versions History
    Route::get('resumes/{resume}/versions', [ResumeController::class, 'getVersions'])->name('resumes.versions.index');
    Route::post('resumes/{resume}/versions', [ResumeController::class, 'saveVersion'])->name('resumes.versions.store');
    Route::post('resumes/versions/{version}/restore', [ResumeController::class, 'restoreVersion'])->name('resumes.versions.restore');
    Route::delete('resumes/versions/{version}', [ResumeController::class, 'destroyVersion'])->name('resumes.versions.destroy');

    // Sync Bridge Routes (LaTeX <-> Canvas)
    Route::post('resumes/{resume}/sync', [ResumeSyncController::class, 'sync'])->name('resumes.sync');
    Route::post('resumes/{resume}/pull-latex', [ResumeSyncController::class, 'pullFromLatex'])->name('resumes.pull-latex');

    // Templates Publishing & Preview
    Route::post('/templates/publish', [TemplateController::class, 'publish'])->name('templates.publish');
    Route::get('/templates/{template}/preview', [TemplateController::class, 'preview'])->name('templates.preview');

    // Admin Section
    Route::middleware(['role:admin|super-admin'])->prefix('admin')->name('admin.')->group(function () {
        Route::get('/dashboard', [AdminDashboardController::class, 'index'])->name('dashboard');
        Route::get('/analytics', [\App\Http\Controllers\Admin\AnalyticsController::class, 'index'])->name('analytics.index');
        
        // Template Management & Moderation
        Route::get('/moderation', [AdminTemplateController::class, 'moderationIndex'])->name('moderation.index');
        Route::post('/templates/{template}/approve', [AdminTemplateController::class, 'approve'])->name('templates.approve');
        Route::post('/templates/{template}/reject', [AdminTemplateController::class, 'reject'])->name('templates.reject');
        Route::post('/templates/{template}/approve-deletion', [AdminTemplateController::class, 'approveDeletion'])->name('templates.approve_deletion');
        
        Route::resource('templates', AdminTemplateController::class);
        Route::post('templates/{template}/toggle-active', [AdminTemplateController::class, 'toggleActive'])->name('templates.toggle-active');
        
        Route::get('/users', [AdminUserController::class, 'index'])->name('users.index');
        Route::post('/users', [AdminUserController::class, 'store'])->name('users.store');
        Route::get('/users/{user}', [AdminUserController::class, 'show'])->name('users.show');
        Route::post('/users/{user}/assign-role', [AdminUserController::class, 'assignRole'])->name('users.assign-role');
        Route::post('/users/{user}/permissions', [AdminUserController::class, 'syncPermissions'])->name('users.sync-permissions');
        Route::delete('/users/{user}', [AdminUserController::class, 'destroy'])->name('users.destroy');

        // Roles & Permissions Management
        Route::get('/roles', [\App\Http\Controllers\Admin\RoleController::class, 'index'])->name('roles.index');
        Route::post('/roles', [\App\Http\Controllers\Admin\RoleController::class, 'store'])->name('roles.store');
        Route::post('/roles/{role}/permissions', [\App\Http\Controllers\Admin\RoleController::class, 'syncPermissions'])->name('roles.sync-permissions');
        Route::delete('/roles/{role}', [\App\Http\Controllers\Admin\RoleController::class, 'destroy'])->name('roles.destroy');
    });

    // Creator Studio
    Route::prefix('creator')->name('creator.')->group(function () {
        Route::get('/dashboard', [TemplateController::class, 'creatorDashboard'])->name('dashboard');
        Route::get('/templates/create', [TemplateController::class, 'createForDeveloper'])->name('templates.create');
        Route::get('/templates/{template}/edit', [TemplateController::class, 'editForDeveloper'])->name('templates.edit');
        Route::post('/templates/{template}/request-deletion', [TemplateController::class, 'requestDeletion'])->name('templates.request_deletion');
    });

    // Telemetry Ingestion
    Route::post('/telemetry', [TelemetryController::class, 'store'])->name('telemetry.store');

    // Default Laravel Profile Routes
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
