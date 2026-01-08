<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ResumeController;
use App\Http\Controllers\Api\TemplateController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\AiController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::middleware(['auth:sanctum'])->name('api.')->group(function () {
    // Profile Management
    Route::get('/profile', [ProfileController::class, 'show'])->name('profile.show');
    Route::post('/profile', [ProfileController::class, 'update'])->name('profile.update');

    // Template Management
    Route::get('/templates', [TemplateController::class, 'index'])->name('templates.index');
    Route::get('/templates/{template}', [TemplateController::class, 'show'])->name('templates.show');

    // Resume Management
    Route::apiResource('resumes', ResumeController::class);
    
    // AI Features
    Route::post('/ai/parse-resume', [AiController::class, 'parseResume'])->name('ai.parse');
    Route::post('/ai/improve-text', [AiController::class, 'improveText'])->name('ai.improve');
});
