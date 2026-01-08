@php
    $isEditMode = ($mode ?? 'preview') === 'edit';
    $canvas = $resume->canvas_state ?? [];
    
    $primaryColor = $resume->primary_color ?? '#6366f1';
    $fontFamily = match($resume->font_family ?? 'sans') {
        'serif' => "'Merriweather', serif",
        'mono' => "'Fira Code', monospace",
        'poppins' => "'Poppins', sans-serif",
        'lato' => "'Lato', sans-serif",
        'raleway' => "'Raleway', sans-serif",
        'montserrat' => "'Montserrat', sans-serif",
        'playfair' => "'Playfair Display', serif",
        'roboto_mono' => "'Roboto Mono', monospace",
        default => "'Plus Jakarta Sans', sans-serif",
    };
    $fontSize = match($resume->font_size ?? 'md') {
        'sm' => '0.8rem',
        'lg' => '1rem',
        'custom' => '1rem',
        default => '0.9rem',
    };
    $fontWeight = $resume->font_weight ?? 'normal';
    
    // Canvas overrides
    $nameText = $canvas['name_text'] ?? ($userDetail->full_name ?? auth()->user()->name);
    $positionText = $canvas['position_text'] ?? ($experiences->first()->position ?? 'Executive Leader');
    $summaryText = $canvas['summary_text'] ?? ($userDetail->professional_summary ?? '');
@endphp
<div class="resume-wrapper bg-white font-sans text-slate-800 min-h-[297mm]" x-ref="canvas" @click="handleCanvasClick($event)">
    <style>
        .editable-active { outline: 2px solid var(--primary) !important; outline-offset: 4px; border-radius: 4px; }
        .hover-outline:hover { outline: 1px dashed var(--primary); cursor: pointer; }
    </style>
    <!-- Executive Template -->
    <header class="bg-[#1e293b] text-white p-14 px-16 flex justify-between items-center relative overflow-hidden">
        <div class="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full -mr-32 -mt-32"></div>
        
        <div class="relative z-10">
            <h1 class="text-5xl font-black tracking-tight mb-2 uppercase leading-none {{ $isEditMode ? 'hover-outline' : '' }}"
                contenteditable="{{ $isEditMode ? 'true' : 'false' }}"
                data-field="name_text"
                @blur="syncContent('name_text', $event)"
                style="{{ $canvas['name_style']['css'] ?? '' }}">
                {!! $nameText !!}
            </h1>
            <p class="text-xs font-black tracking-[0.5em] text-slate-400 mt-4 uppercase border-l-2 border-primary pl-4 {{ $isEditMode ? 'hover-outline' : '' }}"
               contenteditable="{{ $isEditMode ? 'true' : 'false' }}"
               data-field="position_text"
               @blur="syncContent('position_text', $event)"
               style="{{ $canvas['position_style']['css'] ?? '' }}">
                {!! $positionText !!}
            </p>
        </div>
        
        <div class="relative z-10 text-right space-y-2 text-sm font-medium text-slate-300">
            @if($userDetail->email) <p class="flex items-center justify-end">{{ $userDetail->email }} <span class="ml-3 text-indigo-400">|</span></p> @endif
            @if($userDetail->phone) <p class="flex items-center justify-end">{{ $userDetail->phone }} <span class="ml-3 text-indigo-400">|</span></p> @endif
            @if($userDetail->city) <p class="flex items-center justify-end">{{ $userDetail->city }}, {{ $userDetail->country }} <span class="ml-3 text-indigo-400">|</span></p> @endif
        </div>
    </header>

    <div class="p-16 py-14 max-w-7xl mx-auto">
        @if(($resume->sections_visibility['summary'] ?? true) && $userDetail->professional_summary)
        <section class="mb-14">
            <h2 class="text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-6 flex items-center">
                Executive Statement
                <div class="flex-grow h-px bg-slate-100 ml-6"></div>
            </h2>
            <div class="text-xl leading-relaxed text-slate-700 font-serif italic antialiased {{ $isEditMode ? 'hover-outline' : '' }}"
                 contenteditable="{{ $isEditMode ? 'true' : 'false' }}"
                 data-field="summary_text"
                 @blur="syncContent('summary_text', $event)"
                 style="{{ $canvas['summary_style']['css'] ?? '' }}">
                "{!! $summaryText !!}"
            </div>
        </section>
        @endif

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-16">
            <div class="lg:col-span-2 space-y-14">
                @if(($resume->sections_visibility['experience'] ?? true) && $experiences->count() > 0)
                <section>
                    <h2 class="text-[10px] font-black text-indigo-600 uppercase tracking-[0.4em] mb-10 flex items-center">
                        Career Trajectory
                        <div class="flex-grow h-px bg-slate-100 ml-6"></div>
                    </h2>
                    <div class="space-y-12">
                        @foreach($experiences as $exp)
                        <div class="group">
                            <div class="flex justify-between items-start mb-2">
                                <h3 class="text-2xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors">{{ $exp->position }}</h3>
                                <span class="px-3 py-1 bg-slate-100 rounded text-[10px] font-black text-slate-500 uppercase tracking-widest">{{ $exp->start_date->format('M Y') }} — {{ $exp->currently_working ? 'Present' : ($exp->end_date ? $exp->end_date->format('M Y') : '') }}</span>
                            </div>
                            <p class="text-sm font-black text-indigo-500 uppercase tracking-widest mb-6">{{ $exp->company }} <span class="text-slate-300 mx-2">•</span> {{ $exp->location }}</p>
                            <div class="text-base leading-relaxed text-slate-600 font-medium space-y-3">
                                {!! nl2br(e($exp->responsibilities)) !!}
                            </div>
                        </div>
                        @endforeach
                    </div>
                </section>
                @endif
            </div>

            <div class="space-y-14">
                @if(($resume->sections_visibility['skills'] ?? true) && $skills->count() > 0)
                <section>
                    <h2 class="text-[10px] font-black text-indigo-600 uppercase tracking-[0.4em] mb-8">Strategic Skills & Expertise</h2>
                    <div class="space-y-8">
                        @foreach($skills->groupBy('category') as $category => $categorySkills)
                            <div>
                                <h3 class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 border-b border-slate-50 pb-2">
                                    {{ $category === 'Language' ? 'Programming Languages' : $category }}
                                </h3>
                                <div class="flex flex-wrap gap-2">
                                    @foreach($categorySkills as $skill)
                                        <span class="px-3 py-1.5 bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase rounded-lg border border-indigo-100">{{ $skill->name }}</span>
                                    @endforeach
                                </div>
                            </div>
                        @endforeach
                    </div>
                </section>
                @endif

                @if(($resume->sections_visibility['education'] ?? true) && $educations->count() > 0)
                <section>
                    <h2 class="text-[10px] font-black text-indigo-600 uppercase tracking-[0.4em] mb-8">Academic Qualifications</h2>
                    <div class="space-y-8">
                        @foreach($educations as $edu)
                        <div class="border-l-2 border-slate-100 pl-6 py-2">
                            <h3 class="text-sm font-black text-slate-900 uppercase leading-snug">{{ $edu->degree }}</h3>
                            <p class="text-sm font-bold text-indigo-500 mt-2 uppercase tracking-widest">{{ $edu->institution }}</p>
                            <p class="text-[10px] text-slate-400 mt-1 font-black">{{ $edu->start_date->format('Y') }} — {{ $edu->currently_studying ? 'Present' : ($edu->end_date ? $edu->end_date->format('Y') : '') }}</p>
                        </div>
                        @endforeach
                    </div>
                </section>
                @endif

                @if(($resume->sections_visibility['languages'] ?? true) && isset($languages) && $languages->count() > 0)
                <section>
                    <h2 class="text-[10px] font-black text-indigo-600 uppercase tracking-[0.4em] mb-8">Languages</h2>
                    <div class="space-y-8">
                        @foreach($languages as $language)
                        <div class="border-l-2 border-slate-100 pl-6 py-2">
                            <h3 class="text-sm font-black text-slate-900 uppercase leading-snug">{{ $language->name }}</h3>
                            <p class="text-[10px] font-bold text-indigo-500 mt-2 uppercase tracking-widest">{{ $language->proficiency }}</p>
                        </div>
                        @endforeach
                    </div>
                </section>
                @endif
            </div>
        </div>
    </div>
    
    <footer class="p-10 border-t border-slate-50 text-center">
        <p class="text-[10px] font-black text-slate-300 uppercase tracking-[1em]">Privileged & Confidential</p>
    </footer>
</div>
