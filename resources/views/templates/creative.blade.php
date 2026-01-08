<div class="resume-wrapper bg-white font-sans text-gray-900 border-[16px] border-indigo-600 min-h-[297mm]">
    <!-- Creative Template -->
    <div class="p-12">
        <header class="mb-12 flex flex-col items-center text-center">
            @if($userDetail->profile_photo && ($resume->sections_visibility['personal_info'] ?? true))
                @php
                    $photoUrl = Str::startsWith($userDetail->profile_photo, 'http') 
                        ? $userDetail->profile_photo 
                        : Storage::url($userDetail->profile_photo);
                @endphp
                <div class="w-40 h-40 rounded-2xl rotate-3 bg-indigo-100 p-2 mb-6 shadow-xl overflow-hidden">
                    <img src="{{ $photoUrl }}" alt="Profile" class="w-full h-full object-cover rounded-xl -rotate-3">
                </div>
            @endif
            <h1 class="text-5xl font-black text-indigo-900 uppercase tracking-tighter mb-2">{{ $userDetail->full_name ?? auth()->user()->name }}</h1>
            <div class="h-2 w-24 bg-indigo-600 mb-6"></div>
            
            @if($resume->sections_visibility['personal_info'] ?? true)
                <div class="flex flex-wrap justify-center gap-x-8 text-sm font-bold text-gray-500 uppercase tracking-widest">
                    <span>{{ $userDetail->email }}</span>
                    <span>{{ $userDetail->phone }}</span>
                    <span>{{ $userDetail->city }}, {{ $userDetail->country }}</span>
                </div>
            @endif
        </header>

        <div class="grid grid-cols-1 md:grid-cols-12 gap-12">
            <div class="md:col-span-8">
                @if(($resume->sections_visibility['summary'] ?? true) && $userDetail->professional_summary)
                <section class="mb-12">
                    <h2 class="text-2xl font-black text-indigo-600 uppercase mb-4 tracking-tighter">About Me_</h2>
                    <p class="text-lg leading-relaxed text-gray-700 italic border-l-4 border-indigo-200 pl-6">
                        "{{ $userDetail->professional_summary }}"
                    </p>
                </section>
                @endif

                @if(($resume->sections_visibility['experience'] ?? true) && $experiences->count() > 0)
                <section class="mb-12">
                    <h2 class="text-2xl font-black text-indigo-600 uppercase mb-6 tracking-tighter">Experience_</h2>
                    <div class="space-y-8">
                        @foreach($experiences as $exp)
                        <div class="group">
                            <div class="flex items-center mb-2">
                                <span class="bg-indigo-900 text-white text-[10px] font-bold px-3 py-1 mr-4">
                                    {{ $exp->start_date->format('Y') }} - {{ $exp->currently_working ? 'NOW' : ($exp->end_date ? $exp->end_date->format('Y') : '') }}
                                </span>
                                <h3 class="text-xl font-black text-gray-800 uppercase">{{ $exp->position }}</h3>
                            </div>
                            <p class="text-gray-500 font-bold mb-3 pl-[76px]">{{ $exp->company }}</p>
                            <div class="pl-[76px] text-gray-600 text-sm leading-relaxed">
                                {!! nl2br(e($exp->responsibilities)) !!}
                            </div>
                        </div>
                        @endforeach
                    </div>
                </section>
                @endif
            </div>

            <div class="md:col-span-4 space-y-12">
                @if(($resume->sections_visibility['skills'] ?? true) && $skills->count() > 0)
                <section>
                    <h2 class="text-2xl font-black text-indigo-600 uppercase mb-6 tracking-tighter">Skills & Expertise_</h2>
                    <div class="flex flex-wrap gap-2">
                        @foreach($skills as $skill)
                            <span class="px-4 py-2 border-2 border-indigo-900 text-indigo-900 font-black text-xs uppercase hover:bg-indigo-900 hover:text-white transition cursor-default">
                                {{ $skill->name }}
                            </span>
                        @endforeach
                    </div>
                </section>
                @endif

                @if(($resume->sections_visibility['languages'] ?? true) && isset($languages) && $languages->count() > 0)
                <section class="mb-12">
                     <h2 class="text-2xl font-black text-indigo-600 uppercase mb-6 tracking-tighter">Languages_</h2>
                     <div class="space-y-3">
                         @foreach($languages as $language)
                         <div class="flex justify-between items-end border-b-2 border-indigo-50 pb-1">
                             <span class="text-indigo-900 font-black uppercase text-xs tracking-wider">{{ $language->name }}</span>
                             <span class="text-[10px] text-gray-400 font-bold uppercase">{{ $language->proficiency }}</span>
                         </div>
                         @endforeach
                     </div>
                </section>
                @endif

                @if(($resume->sections_visibility['education'] ?? true) && $educations->count() > 0)
                <section>
                    <h2 class="text-2xl font-black text-indigo-600 uppercase mb-6 tracking-tighter">Education_</h2>
                    <div class="space-y-4">
                        @foreach($educations as $edu)
                        <div>
                            <p class="text-indigo-900 font-black uppercase text-xs mb-1">{{ $edu->institution }}</p>
                            <p class="text-sm font-bold text-gray-700">{{ $edu->degree }}</p>
                            <p class="text-xs text-gray-400">{{ $edu->start_date->format('Y') }}</p>
                        </div>
                        @endforeach
                    </div>
                </section>
                @endif
            </div>
        </div>
    </div>
</div>
