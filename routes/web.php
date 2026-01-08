<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\UserDetailsController;
use App\Http\Controllers\ResumeController;
use App\Http\Controllers\TemplateController;
use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\TemplateController as AdminTemplateController;
use App\Http\Controllers\Admin\UserController as AdminUserController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

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
    });

    Route::resource('resumes', ResumeController::class);
    Route::get('resumes/{resume}/preview', [ResumeController::class, 'preview'])->name('resumes.preview');
    Route::get('resumes/{resume}/export-canvas', [ResumeController::class, 'exportCanvas'])->name('resumes.export-canvas');
    Route::post('resumes/{resume}/duplicate', [ResumeController::class, 'duplicate'])->name('resumes.duplicate');
    Route::get('resumes/{resume}/generate-pdf', [ResumeController::class, 'generatePdf'])->name('resumes.generate-pdf');
    Route::get('resumes/{resume}/download-pdf', [ResumeController::class, 'downloadPdf'])->name('resumes.download-pdf');

    // Templates Browsing
    Route::get('/templates', [TemplateController::class, 'index'])->name('templates.index');
    Route::get('/templates/{template}/preview', [TemplateController::class, 'preview'])->name('templates.preview');
    Route::get('/templates/{template}', [TemplateController::class, 'show'])->name('templates.show');

    // Admin Section
    Route::middleware(['role:admin'])->prefix('admin')->name('admin.')->group(function () {
        Route::get('/dashboard', [AdminDashboardController::class, 'index'])->name('dashboard');
        
        Route::resource('templates', AdminTemplateController::class);
        Route::post('templates/{template}/toggle-active', [AdminTemplateController::class, 'toggleActive'])->name('templates.toggle-active');
        
        Route::get('/users', [AdminUserController::class, 'index'])->name('users.index');
        Route::get('/users/{user}', [AdminUserController::class, 'show'])->name('users.show');
        Route::post('/users/{user}/assign-role', [AdminUserController::class, 'assignRole'])->name('users.assign-role');
        Route::delete('/users/{user}', [AdminUserController::class, 'destroy'])->name('users.destroy');
    });

    // Default Laravel Profile Routes
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
