@extends('layouts.app')

@section('header')
    <div class="flex justify-between items-center">
        <h2 class="font-semibold text-xl text-gray-800 leading-tight">
            {{ __('Preview Resume') }}
        </h2>
        <div class="flex space-x-3">
            <a href="{{ route('resumes.edit', $resume) }}" class="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md font-semibold text-xs text-gray-700 uppercase tracking-widest shadow-sm hover:bg-gray-50 transition">
                Back to Editor
            </a>
            <a href="{{ route('resumes.download-pdf', $resume) }}" class="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700 transition">
                Download PDF
            </a>
        </div>
    </div>
@endsection

@section('content')
<div class="py-12 bg-gray-100 min-h-screen">
    <div class="max-w-5xl mx-auto sm:px-6 lg:px-8">
        <div class="bg-white shadow-xl overflow-hidden sm:rounded-lg">
            <div class="p-0">
                @include($resume->template->blade_view, [
                    'resume' => $resume, 
                    'user' => $user,
                    'userDetail' => $userDetail,
                    'educations' => $educations,
                    'experiences' => $experiences,
                    'skills' => $skills,
                    'certifications' => $certifications,
                    'languages' => $languages
                ])
            </div>
        </div>
    </div>
</div>
@endsection
