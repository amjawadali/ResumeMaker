<div class="resume-wrapper bg-white font-sans text-gray-700 p-16 min-h-[297mm]">
    <!-- Minimal Template -->
    <div class="max-w-4xl mx-auto">
        <header class="mb-16">
            @if($resume->sections_visibility['personal_info'] ?? true)
                <h1 class="text-4xl font-light text-gray-900 tracking-tight mb-2">{{ $userDetail->full_name ?? auth()->user()->name }}</h1>
                <p class="text-gray-400 tracking-[0.2em] uppercase text-xs mb-6">{{ $experiences->first()->position ?? '' }}</p>
                <div class="flex space-x-6 text-[11px] uppercase tracking-widest text-gray-500 border-t pt-6">
                    @if($userDetail->email) <span>{{ $userDetail->email }}</span> @endif
                    @if($userDetail->phone) <span>{{ $userDetail->phone }}</span> @endif
                    @if($userDetail->city) <span>{{ $userDetail->city }}</span> @endif
                    @if($userDetail->website) <span>{{ Str::replace(['http://', 'https://'], '', $userDetail->website) }}</span> @endif
                </div>
            @endif
        </header>

        <div class="space-y-16">
            @if(($resume->sections_visibility['summary'] ?? true) && $userDetail->professional_summary)
            <section class="max-w-2xl">
                <p class="text-lg leading-relaxed text-gray-600">
                    {{ $userDetail->professional_summary }}
                </p>
            </section>
            @endif

            @if(($resume->sections_visibility['experience'] ?? true) && $experiences->count() > 0)
            <section>
                <h2 class="text-[10px] uppercase tracking-[0.3em] text-gray-400 mb-8 border-b pb-2">Experience</h2>
                <div class="space-y-12">
                    @foreach($experiences as $exp)
                    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div class="text-[11px] uppercase tracking-widest text-gray-400">
                            {{ $exp->start_date->format('Y') }} — {{ $exp->currently_working ? 'Present' : ($exp->end_date ? $exp->end_date->format('Y') : '') }}
                        </div>
                        <div class="md:col-span-3">
                            <h3 class="text-base font-bold text-gray-900 mb-1">{{ $exp->position }}</h3>
                            <p class="text-sm font-medium text-gray-500 mb-3">{{ $exp->company }}</p>
                            <div class="text-sm leading-relaxed max-w-xl">
                                {!! nl2br(e($exp->responsibilities)) !!}
                            </div>
                        </div>
                    </div>
                    @endforeach
                </div>
            </section>
            @endif

            <div class="grid grid-cols-1 md:grid-cols-2 gap-16">
                @if(($resume->sections_visibility['education'] ?? true) && $educations->count() > 0)
                <section>
                    <h2 class="text-[10px] uppercase tracking-[0.3em] text-gray-400 mb-6 border-b pb-2">Education</h2>
                    <div class="space-y-6">
                        @foreach($educations as $edu)
                        <div>
                            <h3 class="text-sm font-bold text-gray-900">{{ $edu->degree }}</h3>
                            <p class="text-xs text-gray-500 mt-1">{{ $edu->institution }}</p>
                            <p class="text-[10px] text-gray-400 mt-1">{{ $edu->start_date->format('Y') }}</p>
                        </div>
                        @endforeach
                    </div>
                </section>
                @endif

                @if(($resume->sections_visibility['skills'] ?? true) && $skills->count() > 0)
                <section>
                    <h2 class="text-[10px] uppercase tracking-[0.3em] text-gray-400 mb-6 border-b pb-2">Skills & Expertise</h2>
                    <div class="flex flex-wrap gap-x-6 gap-y-3">
                        @foreach($skills as $skill)
                            <span class="text-sm text-gray-600">{{ $skill->name }}</span>
                        @endforeach
                    </div>
                </section>
                @endif

                @if(($resume->sections_visibility['languages'] ?? true) && isset($languages) && $languages->count() > 0)
                <section>
                    <h2 class="text-[10px] uppercase tracking-[0.3em] text-gray-400 mb-6 border-b pb-2">Languages</h2>
                    <div class="space-y-2">
                        @foreach($languages as $language)
                        <div class="flex justify-between items-baseline">
                             <span class="text-sm font-bold text-gray-900">{{ $language->name }}</span>
                             <span class="text-xs text-gray-500 italic">{{ $language->proficiency }}</span>
                        </div>
                        @endforeach
                    </div>
                </section>
                @endif
            </div>
        </div>
    </div>
</div>
