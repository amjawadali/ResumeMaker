<div class="resume-wrapper bg-white font-serif text-gray-900 min-h-[297mm] p-16">
    <!-- Classic Template -->
    <header class="text-center border-b-2 border-gray-900 pb-6 mb-8">
        @if($resume->sections_visibility['personal_info'] ?? true)
            <h1 class="text-4xl font-bold uppercase tracking-widest mb-2">{{ $userDetail->full_name ?? auth()->user()->name }}</h1>
            <div class="flex flex-wrap justify-center gap-x-6 gap-y-1 text-sm italic">
                @if($userDetail->email) <span>{{ $userDetail->email }}</span> @endif
                @if($userDetail->phone) <span>{{ $userDetail->phone }}</span> @endif
                @if($userDetail->address) <span>{{ $userDetail->address }}</span> @endif
                @if($userDetail->website) <span>{{ Str::replace(['http://', 'https://'], '', $userDetail->website) }}</span> @endif
            </div>
        @endif
    </header>

    @if(($resume->sections_visibility['summary'] ?? true) && $userDetail->professional_summary)
    <section class="mb-8">
        <h2 class="text-lg font-bold uppercase tracking-wider border-b border-gray-300 mb-3">Professional Summary</h2>
        <p class="leading-relaxed indent-8">
            {{ $userDetail->professional_summary }}
        </p>
    </section>
    @endif

    @if(($resume->sections_visibility['experience'] ?? true) && $experiences->count() > 0)
    <section class="mb-8">
        <h2 class="text-lg font-bold uppercase tracking-wider border-b border-gray-300 mb-3">Professional Experience</h2>
        <div class="space-y-6">
            @foreach($experiences as $exp)
            <div>
                <div class="flex justify-between items-baseline mb-1">
                    <h3 class="text-base font-bold">{{ $exp->company }}</h3>
                    <span class="text-sm italic font-medium">
                        {{ $exp->start_date->format('M Y') }} – {{ $exp->currently_working ? 'Present' : ($exp->end_date ? $exp->end_date->format('M Y') : '') }}
                    </span>
                </div>
                <div class="flex justify-between items-baseline mb-2">
                    <span class="text-sm font-bold italic">{{ $exp->position }}</span>
                    <span class="text-sm">{{ $exp->location }}</span>
                </div>
                <div class="text-sm leading-relaxed whitespace-pre-line pl-4 border-l-2 border-gray-100">
                    {!! nl2br(e($exp->responsibilities)) !!}
                </div>
            </div>
            @endforeach
        </div>
    </section>
    @endif

    @if(($resume->sections_visibility['education'] ?? true) && $educations->count() > 0)
    <section class="mb-8">
        <h2 class="text-lg font-bold uppercase tracking-wider border-b border-gray-300 mb-3">Education</h2>
        <div class="space-y-4">
            @foreach($educations as $edu)
            <div class="flex justify-between items-baseline">
                <div>
                    <span class="font-bold text-base">{{ $edu->institution }}</span>, 
                    <span class="italic">{{ $edu->degree }}</span>
                    @if($edu->gpa) <span class="text-sm font-medium ml-2">(GPA: {{ $edu->gpa }})</span> @endif
                </div>
                <span class="text-sm italic">
                    {{ $edu->start_date->format('Y') }} – {{ $edu->currently_studying ? 'Present' : ($edu->end_date ? $edu->end_date->format('Y') : '') }}
                </span>
            </div>
            @endforeach
        </div>
    </section>
    @endif

    <div class="grid grid-cols-2 gap-8">
        @if(($resume->sections_visibility['skills'] ?? true) && $skills->count() > 0)
        <section>
            <h2 class="text-lg font-bold uppercase tracking-wider border-b border-gray-300 mb-3">Skills & Expertise</h2>
            <div class="text-sm">
                @foreach($skills->groupBy('category') as $category => $categorySkills)
                    <p class="mb-1">
                        <span class="font-bold underline">{{ $category === 'Language' ? 'Programming Languages' : ucfirst($category) }}:</span>
                        {{ $categorySkills->pluck('name')->implode(', ') }}
                    </p>
                @endforeach
            </div>
        </section>
        @endif

        <div class="space-y-8">
            @if(($resume->sections_visibility['certifications'] ?? true) && $certifications->count() > 0)
            <section>
                <h2 class="text-lg font-bold uppercase tracking-wider border-b border-gray-300 mb-3">Certifications</h2>
                <ul class="list-disc list-inside text-sm space-y-1">
                    @foreach($certifications as $cert)
                        <li><span class="font-bold">{{ $cert->name }}</span> - {{ $cert->issuing_organization }}</li>
                    @endforeach
                </ul>
            </section>
            @endif

            @if(($resume->sections_visibility['languages'] ?? true) && isset($languages) && $languages->count() > 0)
            <section>
                <h2 class="text-lg font-bold uppercase tracking-wider border-b border-gray-300 mb-3">Languages</h2>
                <ul class="list-disc list-inside text-sm space-y-1">
                    @foreach($languages as $language)
                        <li><span class="font-bold">{{ $language->name }}</span> - <span class="italic text-gray-600">{{ $language->proficiency }}</span></li>
                    @endforeach
                </ul>
            </section>
            @endif
        </div>
    </div>
</div>
