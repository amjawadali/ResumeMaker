@php
    $isEditMode = $mode === 'edit';
    $canvas = $resume->canvas_state ?? [];
    
    // Dynamic values from canvas state
    $nameStyle = $canvas['name_style'] ?? [];
    $nameText = $canvas['name_text'] ?? ($userDetail->full_name ?? auth()->user()->name);
    
    $positionStyle = $canvas['position_style'] ?? [];
    $positionText = $canvas['position_text'] ?? ($experiences->first()->position ?? 'Professional Title');
    
    $photoStyle = $canvas['photo_style'] ?? [];
@endphp
<div class="resume-wrapper bg-white font-sans text-slate-900" x-ref="canvas" @click="handleCanvasClick($event)">
    <style>
        .editable-active { outline: 2px solid #6366f1 !important; outline-offset: 4px; border-radius: 4px; }
        .hover-outline:hover { outline: 1px dashed rgba(99, 102, 241, 0.5); cursor: pointer; }
        .canvas-image-wrap { position: relative; display: inline-block; transition: all 0.2s; }
        .canvas-image-wrap.selected { outline: 3px solid #6366f1; }
        .resize-handle { position: absolute; width: 10px; height: 10px; background: white; border: 2px solid #6366f1; bottom: -5px; right: -5px; cursor: nwse-resize; z-index: 10; }
    </style>

    <!-- Modern Template -->
    <div class="flex flex-col md:flex-row min-h-[297mm]">
        <!-- Sidebar -->
        <div class="w-full md:w-[35%] bg-slate-900 text-white p-10 flex flex-col">
            <div class="text-center mb-12">
                @if($userDetail->profile_photo && ($resume->sections_visibility['personal_info'] ?? true))
                    @php
                        $photoUrl = Str::startsWith($userDetail->profile_photo, 'http') 
                            ? $userDetail->profile_photo 
                            : Storage::url($userDetail->profile_photo);
                    @endphp
                    <div class="canvas-image-wrap mb-6 {{ $isEditMode ? 'hover-outline' : '' }}" 
                         id="profile-photo-wrap"
                         :class="selectedElement === 'profile-photo' ? 'selected' : ''"
                         @click.stop="selectElement('profile-photo', $event)"
                         style="{{ $photoStyle['css'] ?? '' }}">
                        <img src="{{ $photoUrl }}" alt="Profile" 
                             class="relative rounded-2xl mx-auto border-2 border-indigo-500/30 object-cover shadow-2xl"
                             style="width: {{ $photoStyle['width'] ?? '144px' }}; height: {{ $photoStyle['height'] ?? '144px' }}; border-radius: {{ $photoStyle['radius'] ?? '1rem' }};">
                        @if($isEditMode)
                            <div class="resize-handle" @mousedown.prevent="startResizing('profile-photo', $event)"></div>
                        @endif
                    </div>
                @endif
                <h1 class="text-3xl font-black uppercase tracking-tight text-white mb-2 leading-tight {{ $isEditMode ? 'hover-outline' : '' }}"
                    contenteditable="{{ $isEditMode ? 'true' : 'false' }}"
                    data-field="name_text"
                    @blur="syncContent('name_text', $event)"
                    style="{{ $nameStyle['css'] ?? '' }}">
                    {!! $nameText !!}
                </h1>
                <div class="h-1 w-12 bg-indigo-500 mx-auto rounded-full mb-4"></div>
                <p class="text-slate-400 uppercase text-[10px] font-black tracking-[0.3em] {{ $isEditMode ? 'hover-outline' : '' }}"
                   contenteditable="{{ $isEditMode ? 'true' : 'false' }}"
                   data-field="position_text"
                   @blur="syncContent('position_text', $event)"
                   style="{{ $positionStyle['css'] ?? '' }}">
                    {!! $positionText !!}
                </p>
            </div>

            <div class="space-y-10 flex-grow">
                @if($resume->sections_visibility['personal_info'] ?? true)
                <section>
                    <h2 class="text-slate-500 font-black uppercase text-[10px] tracking-[0.4em] mb-6 flex items-center">
                        Contact
                        <div class="flex-grow h-px bg-white/10 ml-4"></div>
                    </h2>
                    <ul class="space-y-5 text-sm">
                        @if($userDetail->phone)
                            <li class="flex items-start group">
                                <div class="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center mr-4 text-indigo-400">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                                </div>
                                <span class="text-slate-300 font-medium pt-1 {{ $isEditMode ? 'hover-outline' : '' }}"
                                      contenteditable="{{ $isEditMode ? 'true' : 'false' }}"
                                      data-field="phone_text"
                                      @blur="syncContent('phone_text', $event)"
                                      style="{{ $canvas['phone_style']['css'] ?? '' }}">
                                    {!! $canvas['phone_text'] ?? $userDetail->phone !!}
                                </span>
                            </li>
                        @endif
                        @if($userDetail->email)
                            <li class="flex items-start group">
                                <div class="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center mr-4 text-indigo-400">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                                </div>
                                <span class="text-slate-300 font-medium pt-1 break-all {{ $isEditMode ? 'hover-outline' : '' }}"
                                      contenteditable="{{ $isEditMode ? 'true' : 'false' }}"
                                      data-field="email_text"
                                      @blur="syncContent('email_text', $event)"
                                      style="{{ $canvas['email_style']['css'] ?? '' }}">
                                    {!! $canvas['email_text'] ?? $userDetail->email !!}
                                </span>
                            </li>
                        @endif
                    </ul>
                </section>
                @endif

                @if(($resume->sections_visibility['skills'] ?? true) && $skills->count() > 0)
                <section>
                    <h2 class="text-slate-500 font-black uppercase text-[10px] tracking-[0.4em] mb-6 flex items-center">
                        Skills & Expertise
                        <div class="flex-grow h-px bg-white/10 ml-4"></div>
                    </h2>
                    <div class="space-y-6">
                        @foreach($skills->groupBy('category') as $category => $categorySkills)
                            <div>
                                <h3 class="text-[10px] text-indigo-400 uppercase font-black mb-3 tracking-widest">
                                    {{ $category === 'Language' ? 'Programming Languages' : $category }}
                                </h3>
                                <div class="flex flex-wrap gap-2">
                                    @foreach($categorySkills as $skill)
                                        <span class="bg-white/5 text-slate-300 text-[10px] font-bold px-3 py-1.5 rounded-lg border border-white/5">{{ $skill->name }}</span>
                                    @endforeach
                                </div>
                            </div>
                        @endforeach
                    </div>
                </section>
                @endif

                @if(($resume->sections_visibility['languages'] ?? true) && isset($languages) && $languages->count() > 0)
                <section>
                    <h2 class="text-slate-500 font-black uppercase text-[10px] tracking-[0.4em] mb-6 flex items-center">
                        Spoken Languages
                        <div class="flex-grow h-px bg-white/10 ml-4"></div>
                    </h2>
                    <div class="grid grid-cols-1 gap-4 text-sm">
                        @foreach($languages as $language)
                            <div class="flex justify-between items-center group">
                                <span class="text-slate-300 font-bold tracking-tight">{{ $language->name }}</span>
                                <div class="flex gap-1">
                                    @for($i = 1; $i <= 5; $i++)
                                        <div class="w-1.5 h-1.5 rounded-full {{ $i <= ($language->proficiency == 'Native' ? 5 : ($language->proficiency == 'Fluent' ? 4 : ($language->proficiency == 'Intermediate' ? 3 : 2))) ? 'bg-indigo-500' : 'bg-slate-800' }}"></div>
                                    @endfor
                                </div>
                            </div>
                        @endforeach
                    </div>
                </section>
                @endif
            </div>

            <div class="mt-auto pt-10 border-t border-white/5 text-[9px] text-slate-600 font-bold uppercase tracking-widest text-center">
                Generated via ResumeMaker Professional
            </div>
        </div>

        <!-- Main Content -->
        <div class="flex-grow p-12 bg-white flex flex-col">
            @if(($resume->sections_visibility['summary'] ?? true) && $userDetail->professional_summary)
            <section class="mb-12">
                <div class="flex items-center mb-6">
                    <div class="w-1 h-8 bg-indigo-500 rounded-full mr-4"></div>
                    <h2 class="text-2xl font-black text-slate-900 uppercase tracking-tight">Professional Profile</h2>
                </div>
                <div class="text-slate-600 leading-relaxed text-base font-medium {{ $isEditMode ? 'hover-outline' : '' }}"
                     contenteditable="{{ $isEditMode ? 'true' : 'false' }}"
                     data-field="summary_text"
                     @blur="syncContent('summary_text', $event)"
                     style="{{ $canvas['summary_style']['css'] ?? '' }}">
                    {!! $canvas['summary_text'] ?? $userDetail->professional_summary !!}
                </div>
            </section>
            @endif

            @if(($resume->sections_visibility['experience'] ?? true) && $experiences->count() > 0)
            <section class="mb-12">
                <div class="flex items-center mb-8">
                    <div class="w-1 h-8 bg-indigo-500 rounded-full mr-4"></div>
                    <h2 class="text-2xl font-black text-slate-900 uppercase tracking-tight">Work Experience</h2>
                </div>
                <div class="space-y-10">
                    @foreach($experiences as $exp)
                    <div class="relative group">
                        <div class="flex flex-col md:flex-row md:justify-between md:items-start mb-2">
                            <div>
                                <h3 class="text-lg font-black text-slate-900 leading-tight group-hover:text-indigo-600 transition-colors">{{ $exp->position }}</h3>
                                <p class="text-sm font-bold text-indigo-500 uppercase tracking-widest mt-1">{{ $exp->company }} <span class="text-slate-400 mx-2">|</span> {{ $exp->location }}</p>
                            </div>
                            <div class="mt-2 md:mt-0 px-4 py-1.5 bg-slate-50 border border-slate-100 rounded-full text-[10px] font-black text-slate-600 uppercase tracking-widest whitespace-nowrap">
                                {{ $exp->start_date->format('M Y') }} — {{ $exp->currently_working ? 'PRESENT' : ($exp->end_date ? $exp->end_date->format('M Y') : '') }}
                            </div>
                        </div>
                        <div class="text-sm text-slate-600 leading-relaxed font-medium mt-4 space-y-2">
                            {!! nl2br(e($exp->responsibilities)) !!}
                        </div>
                    </div>
                    @endforeach
                </div>
            </section>
            @endif

            @if(($resume->sections_visibility['education'] ?? true) && $educations->count() > 0)
            <section class="mb-12">
                <div class="flex items-center mb-8">
                    <div class="w-1 h-8 bg-indigo-500 rounded-full mr-4"></div>
                    <h2 class="text-2xl font-black text-slate-900 uppercase tracking-tight">Educational History</h2>
                </div>
                <div class="grid grid-cols-1 gap-8">
                    @foreach($educations as $edu)
                    <div class="flex justify-between items-start border-b border-slate-50 pb-6 last:border-0">
                        <div>
                            <h3 class="text-lg font-black text-slate-900">{{ $edu->degree }}</h3>
                            <p class="text-sm font-bold text-slate-500 mt-1 uppercase tracking-widest">{{ $edu->institution }}</p>
                        </div>
                        <span class="px-4 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase tracking-widest whitespace-nowrap">
                            {{ $edu->start_date->format('Y') }} — {{ $edu->currently_studying ? 'PRESENT' : ($edu->end_date ? $edu->end_date->format('Y') : '') }}
                        </span>
                    </div>
                    @endforeach
                </div>
            </section>
            @endif

            @if(($resume->sections_visibility['certifications'] ?? true) && $certifications->count() > 0)
            <section>
                <div class="flex items-center mb-8">
                    <div class="w-1 h-8 bg-indigo-500 rounded-full mr-4"></div>
                    <h2 class="text-2xl font-black text-slate-900 uppercase tracking-tight">Certifications</h2>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    @foreach($certifications as $cert)
                    <div class="p-5 bg-slate-50 border border-slate-100 rounded-2xl group hover:border-indigo-200 transition-all">
                        <h3 class="text-sm font-black text-slate-900 group-hover:text-indigo-600 transition-colors">{{ $cert->name }}</h3>
                        <p class="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2">{{ $cert->issuing_organization }} <span class="text-indigo-300 mx-1">•</span> {{ $cert->issue_date->format('Y') }}</p>
                    </div>
                    @endforeach
                </div>
            </section>
            @endif
        </div>
    </div>
</div>
