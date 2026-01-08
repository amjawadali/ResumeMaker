@extends('layouts.app')

@section('header')
    <div class="flex justify-between items-center py-2 relative z-20">
        <h2 class="font-black text-2xl text-white leading-tight tracking-tight">
            Profile Builder
        </h2>
        <a href="{{ route('dashboard') }}" class="inline-flex items-center px-4 py-2 bg-white/10 border border-white/10 rounded-xl font-bold text-xs text-white uppercase tracking-widest hover:bg-white/20 transition shadow-lg backdrop-blur-md">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            Dashboard
        </a>
    </div>
@endsection

@section('content')
<div class="relative py-10 bg-[#0f172a] min-h-screen text-slate-300" x-data="{ 
    activeTab: '{{ session('active_tab', 'personal') }}',
    showSuccess: true,
    init() {
        setTimeout(() => this.showSuccess = false, 5000);
    }
}">
    <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
        <!-- Success Notification -->
        @if (session('success'))
            <div x-show="showSuccess" x-transition:enter="transition ease-out duration-300" x-transition:enter-start="opacity-0 -translate-y-4" x-transition:leave="transition ease-in duration-200" x-transition:leave-end="opacity-0 -translate-y-4" class="mb-8 flex items-center p-5 bg-emerald-500/10 border border-emerald-500/20 rounded-[2rem] text-emerald-400 shadow-sm backdrop-blur-md">
                <div class="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center mr-4 shrink-0">
                    <svg class="w-5 h-5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>
                </div>
                <span class="font-bold text-sm">{{ session('success') }}</span>
            </div>
        @endif

        @if ($errors->any())
            <div class="mb-8 p-6 bg-red-50 border border-red-100 rounded-[2rem] text-red-800 shadow-sm animate-shake">
                <div class="flex items-center mb-4">
                    <div class="w-8 h-8 rounded-xl bg-red-100 flex items-center justify-center mr-4 shrink-0">
                        <svg class="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path></svg>
                    </div>
                    <span class="font-black text-sm uppercase tracking-widest">Action Required</span>
                </div>
                <ul class="list-disc list-inside text-xs font-bold pl-12 space-y-1">
                    @foreach ($errors->all() as $error)
                        <li>{{ $error }}</li>
                    @endforeach
                </ul>
            </div>
        @endif

        <div class="grid grid-cols-1 lg:grid-cols-4 gap-10">
            <!-- Professional Sidebar -->
            <div class="lg:col-span-1">
                <div class="glass-panel rounded-[2.5rem] shadow-2xl overflow-hidden sticky top-8">
                    <div class="p-8 border-b border-white/5 bg-white/5 relative overflow-hidden group">
                        <div class="absolute top-0 right-0 w-32 h-32 bg-purple-600/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-purple-600/20 transition-all duration-700"></div>
                        <h3 class="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-2">Workspace</h3>
                        <p class="text-2xl font-black text-white leading-tight tracking-tight">Profile Builder</p>
                    </div>
                    <nav class="p-4 space-y-2">
                        @foreach([
                            'personal' => ['label' => 'Personal Info', 'icon' => 'user'],
                            'education' => ['label' => 'Education', 'icon' => 'graduation-cap'],
                            'experience' => ['label' => 'Experience', 'icon' => 'briefcase'],
                            'skills' => ['label' => 'Skills', 'icon' => 'zap'],
                            'certifications' => ['label' => 'Certifications', 'icon' => 'award'],
                            'languages' => ['label' => 'Languages', 'icon' => 'languages']
                        ] as $tab => $data)
                            <button @click="activeTab = '{{ $tab }}'; $nextTick(() => lucide.createIcons())" 
                                :class="activeTab === '{{ $tab }}' ? 'premium-gradient text-white shadow-xl shadow-purple-900/40 scale-105' : 'text-slate-400 hover:bg-white/5 hover:text-white'"
                                class="w-full flex items-center px-6 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all duration-300 group">
                                <div :class="activeTab === '{{ $tab }}' ? 'bg-white/20' : 'bg-slate-800'" class="w-10 h-10 rounded-xl flex items-center justify-center mr-4 transition-all group-hover:scale-110">
                                    <i data-lucide="{{ $data['icon'] }}" class="w-5 h-5"></i>
                                </div>
                                <span class="font-black tracking-widest" x-text="'{{ $data['label'] }}'"></span>
                                <i data-lucide="chevron-right" x-show="activeTab === '{{ $tab }}'" class="ml-auto w-4 h-4 opacity-50"></i>
                            </button>
                        @endforeach
                    </nav>
                </div>
            </div>

            <!-- Main Content Area -->
            <div class="lg:col-span-3 space-y-10">
                <!-- Personal Info -->
                <!-- Personal Info -->
                <div x-show="activeTab === 'personal'" x-transition:enter="transition ease-out duration-300" x-transition:enter-start="opacity-0 translate-x-10">
                    <div class="bg-white/5 backdrop-blur-xl rounded-[2.5rem] shadow-xl border border-white/10 p-10">
                        <div class="flex items-center justify-between mb-10 pb-6 border-b border-white/10">
                            <div>
                                <h3 class="text-2xl font-black text-white">Personal Information</h3>
                                <p class="text-sm font-medium text-slate-400 mt-1">Foundational data for all your resumes.</p>
                            </div>
                            <div class="w-14 h-14 bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-400 shrink-0">
                                <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            </div>
                        </div>

                        <form action="{{ route('user-details.update-personal-info') }}" method="POST" enctype="multipart/form-data" class="space-y-10">
                            @csrf
                            <div class="flex flex-col md:flex-row gap-10 items-center md:items-start p-6 bg-white/5 rounded-3xl border border-white/5">
                                <div class="relative shrink-0 group">
                                    <div class="w-40 h-40 rounded-[2rem] overflow-hidden border-4 border-white/20 shadow-xl group-hover:shadow-purple-500/20 transition duration-500">
                                        @if($userDetail && $userDetail->profile_photo)
                                            <img src="{{ Storage::url($userDetail->profile_photo) }}" alt="Profile" class="w-full h-full object-cover">
                                        @else
                                            <div class="w-full h-full bg-white/10 flex items-center justify-center text-slate-500">
                                                <svg class="w-20 h-20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                                            </div>
                                        @endif
                                    </div>
                                    <label for="profile_photo" class="absolute -bottom-3 -right-3 w-12 h-12 bg-purple-600 rounded-2xl text-white flex items-center justify-center cursor-pointer shadow-lg hover:bg-purple-500 transition active:scale-95 z-20">
                                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                                        <input type="file" id="profile_photo" name="profile_photo" class="hidden" accept="image/*">
                                    </label>
                                </div>

                                <div class="flex-grow grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
                                    <div class="md:col-span-2">
                                        <x-input-label for="full_name" value="Full Name" class="font-black text-[10px] uppercase tracking-widest text-slate-400 mb-2" />
                                        <x-text-input id="full_name" name="full_name" type="text" class="block w-full rounded-2xl border-white/10 bg-white/5 min-h-[56px] px-6 text-sm font-bold text-white focus:border-purple-500 focus:bg-white/10 transition placeholder-slate-600" :value="old('full_name', $userDetail->full_name)" required placeholder="Johnathan Doe" />
                                    </div>
                                    <div>
                                        <x-input-label for="email" value="Email" class="font-black text-[10px] uppercase tracking-widest text-slate-400 mb-2" />
                                        <x-text-input id="email" name="email" type="email" class="block w-full rounded-2xl border-white/10 bg-white/5 min-h-[56px] px-6 text-sm font-bold text-white focus:border-purple-500 focus:bg-white/10 transition placeholder-slate-600" :value="old('email', $userDetail->email)" required placeholder="john@domain.com" />
                                    </div>
                                    <div>
                                        <x-input-label for="phone" value="Phone" class="font-black text-[10px] uppercase tracking-widest text-slate-400 mb-2" />
                                        <x-text-input id="phone" name="phone" type="text" class="block w-full rounded-2xl border-white/10 bg-white/5 min-h-[56px] px-6 text-sm font-bold text-white focus:border-purple-500 focus:bg-white/10 transition placeholder-slate-600" :value="old('phone', $userDetail->phone)" placeholder="+1 (555) 000-0000" />
                                    </div>
                                </div>
                            </div>

                            <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div class="md:col-span-2">
                                    <x-input-label for="address" value="Professional Address / City" class="font-black text-[10px] uppercase tracking-widest text-slate-400 mb-2" />
                                    <x-text-input id="address" name="address" type="text" class="block w-full rounded-2xl border-white/10 bg-white/5 min-h-[56px] px-6 text-sm font-bold text-white focus:border-purple-500 focus:bg-white/10 transition placeholder-slate-600" :value="old('address', $userDetail->address)" placeholder="San Francisco, California, USA" />
                                </div>
                                <div>
                                    <x-input-label for="website" value="Portfolio / Website" class="font-black text-[10px] uppercase tracking-widest text-slate-400 mb-2" />
                                    <x-text-input id="website" name="website" type="url" class="block w-full rounded-2xl border-white/10 bg-white/5 min-h-[56px] px-6 text-sm font-bold text-white focus:border-purple-500 focus:bg-white/10 transition placeholder-slate-600" :value="old('website', $userDetail->website)" placeholder="https://johndoe.com" />
                                </div>
                            </div>

                            <!-- Social Links (Dynamic) -->
                            <div class="col-span-full space-y-6" x-data="{
                                socialLinks: {{ json_encode($userDetail->social_links ?? []) }},
                                searchIcons: '',
                                allIcons: [
                                    'github', 'linkedin', 'twitter', 'facebook', 'instagram', 'youtube', 'globe', 'mail', 'phone', 'briefcase', 'user', 'star', 'heart', 'code', 'book', 'terminal', 'cpu', 'database', 'cloud', 'message-square', 'link', 'hash', 'at-sign', 'calendar', 'map-pin', 'award', 'target', 'zap', 'shield', 'flag'
                                ],
                                addLink() {
                                    this.socialLinks.push({ name: '', icon: 'globe', url: '' });
                                    this.$nextTick(() => lucide.createIcons());
                                },
                                removeLink(index) {
                                    this.socialLinks.splice(index, 1);
                                },
                                filteredIcons() {
                                    if (!this.searchIcons) return this.allIcons;
                                    return this.allIcons.filter(i => i.includes(this.searchIcons.toLowerCase()));
                                }
                            }">
                                <div class="flex items-center justify-between mb-2">
                                    <h4 class="font-black text-[10px] uppercase tracking-widest text-slate-400">Social Profiles</h4>
                                    <button type="button" @click="addLink()" class="text-xs font-bold text-purple-400 hover:text-purple-300 transition-colors flex items-center bg-purple-500/10 px-4 py-2 rounded-xl border border-purple-500/20 hover:scale-105 transition-all">
                                        <i data-lucide="plus" class="w-4 h-4 mr-1"></i>
                                        Add Custom Link
                                    </button>
                                </div>
                                
                                <template x-for="(link, index) in socialLinks" :key='"social-link-" + index'>
                                    <div class="glass-panel rounded-3xl p-5 flex flex-col md:flex-row gap-5 items-start md:items-center group hover:bg-white/5 transition-all duration-300 mb-4">
                                        <!-- Icon Picker -->
                                        <div class="relative w-full md:w-auto shrink-0" x-data="{ open: false }">
                                            <input type="hidden" :name="'social_links[' + index + '][icon]'" x-model="link.icon">
                                            <button type="button" @click="open = !open" @click.outside="open = false" class="w-full md:w-[160px] h-[64px] rounded-2xl bg-[#0f172a] border border-white/10 flex items-center justify-between px-4 hover:border-purple-500/50 transition shadow-inner">
                                                <div class="flex items-center gap-3">
                                                    <div class="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400 shadow-lg shadow-purple-500/10 active:scale-95 transition-transform">
                                                       <i :data-lucide="link.icon" class="w-5 h-5"></i>
                                                    </div>
                                                    <span class="text-xs font-bold text-slate-300 capitalize" x-text="link.icon"></span>
                                                </div>
                                                <i data-lucide="chevron-down" class="w-4 h-4 text-slate-500"></i>
                                            </button>

                                            <!-- Dropdown with Search -->
                                            <div x-show="open" x-cloak x-transition:enter="transition ease-out duration-200" x-transition:enter-start="opacity-0 scale-95" 
                                                 class="absolute top-full left-0 mt-3 w-72 bg-[#161e2e] border border-white/10 rounded-2xl shadow-2xl p-4 z-[100] glass-panel backdrop-blur-2xl">
                                                <div class="relative mb-4">
                                                    <input type="text" x-model="searchIcons" placeholder="Search icons..." class="w-full bg-[#0f172a] border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:border-purple-500 transition placeholder-slate-600 focus:ring-0">
                                                    <div class="absolute right-3 top-2 text-slate-600">
                                                        <i data-lucide="search" class="w-4 h-4"></i>
                                                    </div>
                                                </div>
                                                <div class="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                                                    <template x-for="icon in filteredIcons()" :key="icon">
                                                        <button type="button" @click="link.icon = icon; open = false; $nextTick(() => lucide.createIcons())" 
                                                                class="w-12 h-12 rounded-xl flex items-center justify-center hover:bg-purple-600 hover:text-white transition group/icon" 
                                                                :class="link.icon === icon ? 'bg-purple-600 text-white' : 'bg-white/5 text-slate-400'">
                                                            <i :data-lucide="icon" class="w-5 h-5 group-hover/icon:scale-110 transition-transform"></i>
                                                        </button>
                                                    </template>
                                                </div>
                                            </div>
                                        </div>

                                        <!-- Inputs -->
                                        <div class="flex-grow grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                                            <div class="relative group/input">
                                                <label class="absolute -top-2.5 left-4 px-2 bg-[#1a2235] text-[10px] font-black uppercase text-purple-400 tracking-widest transition-all group-focus-within/input:text-purple-300 z-10 transition-all">Platform Name</label>
                                                <input type="text" :name="'social_links[' + index + '][name]'" x-model="link.name" placeholder="e.g. Portfolio" class="block w-full rounded-2xl border border-white/10 bg-[#0f172a] h-[64px] px-6 text-sm font-bold text-white focus:border-purple-500 transition placeholder-slate-700 focus:ring-1 focus:ring-purple-500/20">
                                            </div>
                                            <div class="relative group/input">
                                                <label class="absolute -top-2.5 left-4 px-2 bg-[#1a2235] text-[10px] font-black uppercase text-purple-400 tracking-widest transition-all group-focus-within/input:text-purple-300 z-10 transition-all">URL Address</label>
                                                <input type="url" :name="'social_links[' + index + '][url]'" x-model="link.url" placeholder="https://..." class="block w-full rounded-2xl border border-white/10 bg-[#0f172a] h-[64px] px-6 text-sm font-bold text-white focus:border-purple-500 transition placeholder-slate-700 focus:ring-1 focus:ring-purple-500/20">
                                            </div>
                                        </div>

                                        <!-- Remove -->
                                        <button type="button" @click="removeLink(index)" class="p-4 text-slate-500 hover:text-red-400 transition-all hover:bg-red-500/10 rounded-2xl group/del">
                                            <i data-lucide="trash-2" class="w-5 h-5 group-hover/del:animate-shake"></i>
                                        </button>
                                    </div>
                                </template>
                                
                                <div x-show="socialLinks.length === 0" class="py-12 text-center bg-white/5 border border-dashed border-white/10 rounded-[2.5rem]">
                                    <div class="mb-3 text-slate-600 flex justify-center">
                                        <i data-lucide="share-2" class="w-8 h-8 opacity-40"></i>
                                    </div>
                                    <p class="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Connect your digital presence</p>
                                </div>
                            </div>

                            <script>
                                document.addEventListener('DOMContentLoaded', () => {
                                    lucide.createIcons();
                                });
                            </script>

                            <div>
                                <x-input-label for="professional_summary" value="Impactful Professional Summary" class="font-black text-[10px] uppercase tracking-widest text-slate-400 mb-3" />
                                <div class="bg-purple-500/10 rounded-[2rem] p-4 border border-purple-500/20">
                                    <textarea id="professional_summary" name="professional_summary" class="block w-full rounded-2xl border-none bg-transparent focus:ring-0 min-h-[180px] p-4 text-sm font-medium leading-relaxed text-white placeholder-slate-500" placeholder="Summarize your career goals and achievements in 3-4 sentences...">{{ old('professional_summary', $userDetail->professional_summary) }}</textarea>
                                </div>
                            </div>

                            <div class="flex justify-end pt-6">
                                <button type="submit" class="px-12 py-5 bg-purple-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-purple-500 hover:scale-[1.02] transition-all shadow-xl shadow-purple-900/20 active:translate-y-1">
                                    Save Profile Data
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                <!-- Education -->
                <!-- Education -->
                <div x-show="activeTab === 'education'" x-transition:enter="transition ease-out duration-300" x-transition:enter-start="opacity-0 translate-x-10">
                    <div class="bg-white/5 backdrop-blur-xl rounded-[2.5rem] shadow-xl border border-white/10 p-10">
                        <div class="flex items-center justify-between mb-12">
                            <div>
                                <h3 class="text-2xl font-black text-white leading-tight">Academic History</h3>
                                <p class="text-sm font-medium text-slate-400 mt-1">Manage your degrees and qualifications.</p>
                            </div>
                            <button @click="$dispatch('open-modal', 'add-education')" class="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-purple-500/30 hover:scale-110 active:scale-95 transition-all shrink-0 hover:rotate-3">
                                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
                            </button>
                        </div>

                        <div class="space-y-6">
                            @forelse ($educations as $edu)
                                <div class="group relative bg-white/5 border border-white/5 rounded-[2rem] p-8 hover:shadow-2xl hover:shadow-purple-500/10 hover:border-purple-500/30 transition-all duration-300">
                                    <div class="flex gap-8 items-start">
                                        <div class="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-purple-600 group-hover:text-white transition-all duration-500 shrink-0">
                                            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"></path></svg>
                                        </div>
                                        <div class="flex-grow">
                                            <div class="flex justify-between items-start mb-2">
                                                <div>
                                                    <h4 class="font-black text-xl text-white group-hover:text-purple-400 transition-colors">{{ $edu->degree }}</h4>
                                                    <p class="font-bold text-slate-400 text-lg">{{ $edu->institution }}</p>
                                                </div>
                                                <form action="{{ route('user-details.education.destroy', $edu) }}" method="POST">
                                                    @csrf @method('DELETE')
                                                    <button type="submit" onclick="return confirm('Remove education?')" class="p-3 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all opacity-0 group-hover:opacity-100">
                                                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                                    </button>
                                                </form>
                                            </div>
                                            <div class="flex items-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 group-hover:text-purple-300 transition-colors">
                                                {{ Carbon\Carbon::parse($edu->start_date)->format('M Y') }} — {{ $edu->currently_studying ? 'Present' : (Carbon\Carbon::parse($edu->end_date)->format('M Y')) }}
                                                @if($edu->field_of_study)
                                                    <span class="mx-3 text-white/20">|</span>
                                                    {{ $edu->field_of_study }}
                                                @endif
                                            </div>
                                            @if($edu->description)
                                                <p class="mt-5 text-sm font-medium text-slate-400 italic leading-relaxed">{{ $edu->description }}</p>
                                            @endif
                                        </div>
                                    </div>
                                </div>
                            @empty
                                <div class="py-20 text-center bg-white/5 border-2 border-dashed border-white/10 rounded-[2.5rem]">
                                    <p class="text-xs font-black uppercase tracking-[0.3em] text-slate-500">No education entries yet</p>
                                    <button @click="$dispatch('open-modal', 'add-education')" class="mt-6 font-black text-purple-400 hover:text-purple-300 uppercase tracking-widest text-[10px] scale-100 hover:scale-105 transition-transform">Add Academic Record</button>
                                </div>
                            @endforelse
                        </div>
                    </div>
                </div>

                <!-- Experience -->
                <!-- Experience -->
                <div x-show="activeTab === 'experience'" x-transition:enter="transition ease-out duration-300" x-transition:enter-start="opacity-0 translate-x-10">
                    <div class="bg-white/5 backdrop-blur-xl rounded-[2.5rem] shadow-xl border border-white/10 p-10">
                        <div class="flex items-center justify-between mb-12">
                            <div>
                                <h3 class="text-2xl font-black text-white leading-tight">Work History</h3>
                                <p class="text-sm font-medium text-slate-400 mt-1">Chronicle your professional journey.</p>
                            </div>
                            <button @click="$dispatch('open-modal', 'add-experience')" class="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-purple-500/30 hover:scale-110 active:scale-95 transition-all shrink-0 hover:rotate-3">
                                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
                            </button>
                        </div>

                        <div class="space-y-8">
                            @forelse ($experiences as $exp)
                                <div class="group relative bg-white/5 border border-white/5 rounded-[2rem] p-8 hover:shadow-2xl hover:shadow-purple-500/10 hover:border-purple-500/30 transition-all duration-300">
                                    <div class="flex justify-between items-start mb-6">
                                        <div class="flex-grow">
                                            <h4 class="font-black text-2xl text-white tracking-tight group-hover:text-purple-400 transition-colors">{{ $exp->position }}</h4>
                                            <div class="flex items-center mt-2 group-hover:translate-x-1 transition-transform">
                                                <span class="font-black text-lg text-purple-400 bg-purple-500/10 px-3 py-1 rounded-lg">{{ $exp->company }}</span>
                                                <span class="mx-4 text-white/20 font-light">/</span>
                                                <span class="text-slate-500 font-black text-xs uppercase tracking-widest">{{ $exp->location }}</span>
                                            </div>
                                        </div>
                                        <div class="flex items-center space-x-2">
                                            <form action="{{ route('user-details.experience.destroy', $exp) }}" method="POST">
                                                @csrf @method('DELETE')
                                                <button type="submit" onclick="return confirm('Remove work entry?')" class="p-3 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-2xl transition-all opacity-0 group-hover:opacity-100">
                                                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                                </button>
                                            </form>
                                        </div>
                                    </div>
                                    
                                    <div class="flex items-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-6 bg-white/5 inline-flex px-4 py-2 rounded-xl group-hover:bg-purple-500/10 group-hover:text-purple-300 transition-colors">
                                        {{ Carbon\Carbon::parse($exp->start_date)->format('M Y') }} — {{ $exp->currently_working ? 'Present' : (Carbon\Carbon::parse($exp->end_date)->format('M Y')) }}
                                    </div>

                                    @if($exp->responsibilities)
                                        <div class="text-sm font-medium text-slate-400 leading-relaxed prose prose-invert max-w-none">
                                            {!! nl2br(e($exp->responsibilities)) !!}
                                        </div>
                                    @endif
                                </div>
                            @empty
                                <div class="py-20 text-center bg-white/5 border-2 border-dashed border-white/10 rounded-[2.5rem]">
                                    <p class="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Work record empty</p>
                                    <button @click="$dispatch('open-modal', 'add-experience')" class="mt-6 font-black text-purple-400 hover:text-purple-300 uppercase tracking-[0.2em] text-[10px] transition-all">Introduce Your Expertise</button>
                                </div>
                            @endforelse
                        </div>
                    </div>
                </div>

                <!-- Skills -->
                <!-- Skills -->
                <div x-show="activeTab === 'skills'" x-transition:enter="transition ease-out duration-300" x-transition:enter-start="opacity-0 translate-x-10">
                    <div class="bg-white/5 backdrop-blur-xl rounded-[2.5rem] shadow-xl border border-white/10 p-10">
                        <div class="flex items-center justify-between mb-12">
                            <div>
                                <h3 class="text-2xl font-black text-white leading-tight">Skills & Mastery</h3>
                                <p class="text-sm font-medium text-slate-400 mt-1">Quantify your professional capabilities.</p>
                            </div>
                            <button @click="$dispatch('open-modal', 'add-skill')" class="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-purple-500/30 hover:scale-110 active:scale-95 transition-all shrink-0 hover:rotate-3">
                                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
                            </button>
                        </div>

                        <div class="flex flex-wrap gap-5">
                            @forelse ($skills as $skill)
                                <div class="relative group">
                                    <div class="px-8 py-5 bg-white/5 rounded-[1.5rem] border border-white/5 flex items-center shadow-lg group-hover:bg-purple-600 group-hover:border-purple-500 transition-all duration-300 min-w-[200px]">
                                        <div class="flex-grow">
                                            <span class="block font-black text-white group-hover:text-white transition-colors">{{ $skill->name }}</span>
                                            <span class="block text-[9px] font-black uppercase tracking-widest text-purple-400 group-hover:text-purple-200 transition-colors mt-1">{{ $skill->proficiency }}</span>
                                        </div>
                                        <form action="{{ route('user-details.skill.destroy', $skill) }}" method="POST" class="ml-4 opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100">
                                            @csrf @method('DELETE')
                                            <button type="submit" class="w-8 h-8 rounded-lg bg-white/20 text-white flex items-center justify-center hover:bg-red-500 transition-colors">
                                                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            @empty
                                <div class="w-full py-20 text-center bg-white/5 border border-white/10 rounded-[2.5rem]">
                                    <p class="text-[10px] font-black uppercase tracking-widest text-slate-500">Add technical and soft skills</p>
                                </div>
                            @endforelse
                        </div>
                    </div>
                </div>

                <!-- Certifications -->
                <!-- Certifications -->
                <div x-show="activeTab === 'certifications'" x-transition:enter="transition ease-out duration-300" x-transition:enter-start="opacity-0 translate-x-10">
                    <div class="bg-white/5 backdrop-blur-xl rounded-[2.5rem] shadow-xl border border-white/10 p-10">
                        <div class="flex items-center justify-between mb-12">
                            <div>
                                <h3 class="text-2xl font-black text-white leading-tight">Certifications</h3>
                                <p class="text-sm font-medium text-slate-400 mt-1">Official validations of your expertise.</p>
                            </div>
                            <button @click="$dispatch('open-modal', 'add-certification')" class="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-purple-500/30 hover:scale-110 active:scale-95 transition-all shrink-0 hover:rotate-3">
                                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
                            </button>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                            @forelse ($certifications as $cert)
                                <div class="p-8 bg-white/5 rounded-[2rem] border border-white/5 hover:shadow-2xl hover:shadow-purple-500/10 hover:border-purple-500/30 transition-all duration-500 group">
                                    <div class="flex justify-between items-start">
                                        <div>
                                            <div class="w-12 h-12 bg-white/10 rounded-xl mb-6 flex items-center justify-center text-purple-400 group-hover:bg-purple-600 group-hover:text-white transition-all">
                                                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path></svg>
                                            </div>
                                            <h4 class="font-black text-xl text-white leading-tight mb-2 uppercase tracking-tight">{{ $cert->name }}</h4>
                                            <p class="font-bold text-slate-400 text-sm">{{ $cert->issuing_organization }}</p>
                                            <p class="text-[9px] font-black text-purple-400 uppercase tracking-[0.2em] mt-6">{{ Carbon\Carbon::parse($cert->issue_date)->format('M Y') }}</p>
                                        </div>
                                        <form action="{{ route('user-details.certification.destroy', $cert) }}" method="POST">
                                            @csrf @method('DELETE')
                                            <button type="submit" class="p-3 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-2xl transition-all opacity-0 group-hover:opacity-100">
                                                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            @empty
                                <div class="col-span-full py-20 text-center bg-white/5 border border-white/10 rounded-[2.5rem]">
                                    <p class="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">No credentials added</p>
                                </div>
                            @endforelse
                        </div>
                    </div>
                </div>

                <!-- Languages -->
                <!-- Languages -->
                <div x-show="activeTab === 'languages'" x-transition:enter="transition ease-out duration-300" x-transition:enter-start="opacity-0 translate-x-10">
                    <div class="bg-white/5 backdrop-blur-xl rounded-[2.5rem] shadow-xl border border-white/10 p-10">
                        <div class="flex items-center justify-between mb-12">
                            <div>
                                <h3 class="text-2xl font-black text-white leading-tight">Languages</h3>
                                <p class="text-sm font-medium text-slate-400 mt-1">Showcase your global communication skills.</p>
                            </div>
                            <button @click="$dispatch('open-modal', 'add-language')" class="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-purple-500/30 hover:scale-110 active:scale-95 transition-all shrink-0 hover:rotate-3">
                                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
                            </button>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            @forelse ($languages as $language)
                                <div class="relative group bg-white/5 border border-white/5 rounded-[2rem] p-6 hover:shadow-xl hover:shadow-purple-500/10 hover:border-purple-500/30 transition-all duration-300">
                                    <div class="flex items-center justify-between mb-2">
                                        <h4 class="font-black text-lg text-white group-hover:text-purple-400 transition-colors">{{ $language->name }}</h4>
                                        <form action="{{ route('user-details.language.destroy', $language) }}" method="POST">
                                            @csrf @method('DELETE')
                                            <button type="submit" class="text-slate-500 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100">
                                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                            </button>
                                        </form>
                                    </div>
                                    <div class="inline-flex items-center px-3 py-1 bg-purple-500/10 rounded-lg text-[10px] font-black uppercase tracking-widest text-purple-400">
                                        {{ $language->proficiency }}
                                    </div>
                                </div>
                            @empty
                                <div class="col-span-full py-20 text-center bg-white/5 border-2 border-dashed border-white/10 rounded-[2.5rem]">
                                    <p class="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">No languages added</p>
                                    <button @click="$dispatch('open-modal', 'add-language')" class="mt-6 font-black text-purple-400 hover:text-purple-300 uppercase tracking-[0.2em] text-[10px] transition-all">Add Language</button>
                                </div>
                            @endforelse
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Modals (Precision Iconic Control) -->
    
    <!-- Education Modal -->
    <x-modal name="add-education" :show="false">
        <div class="p-12 bg-[#1e293b] border border-white/10 rounded-[3rem]">
            <div class="flex items-center space-x-6 mb-10 pb-6 border-b border-white/10">
                <div class="w-14 h-14 bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-400 shrink-0">
                    <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"></path></svg>
                </div>
                <h2 class="text-3xl font-black text-white">Add Academic Entry</h2>
            </div>

            <form action="{{ route('user-details.education.store') }}" method="POST" class="space-y-8" @submit="$dispatch('close')">
                @csrf
                <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div class="md:col-span-2">
                        <x-input-label value="Institution / University" class="font-black text-[10px] uppercase tracking-widest text-slate-400 mb-2" />
                        <x-text-input name="institution" class="block w-full min-h-[56px] rounded-2xl border-white/10 bg-[#0f172a] px-6 font-bold text-white focus:border-purple-500 focus:ring-purple-500" required placeholder="MIT" />
                    </div>
                    <div class="md:col-span-2">
                        <x-input-label value="Degree / Specialization" class="font-black text-[10px] uppercase tracking-widest text-slate-400 mb-2" />
                        <x-text-input name="degree" class="block w-full min-h-[56px] rounded-2xl border-white/10 bg-[#0f172a] px-6 font-bold text-white focus:border-purple-500 focus:ring-purple-500" required placeholder="B.S. Software Engineering" />
                    </div>
                    <div>
                        <x-input-label value="Start Date" class="font-black text-[10px] uppercase tracking-widest text-slate-400 mb-2" />
                        <x-text-input name="start_date" type="date" class="block w-full min-h-[56px] rounded-2xl border-white/10 bg-[#0f172a] px-6 text-white text-sm font-bold focus:border-purple-500 focus:ring-purple-500" required />
                    </div>
                    <div>
                        <x-input-label value="End Date" class="font-black text-[10px] uppercase tracking-widest text-slate-400 mb-2" />
                        <x-text-input name="end_date" type="date" class="block w-full min-h-[56px] rounded-2xl border-white/10 bg-[#0f172a] px-6 text-white text-sm font-bold focus:border-purple-500 focus:ring-purple-500" />
                    </div>
                </div>

                <div class="flex items-center space-x-4 bg-purple-500/5 p-6 rounded-[2rem] border border-white/5">
                    <input type="checkbox" name="currently_studying" value="1" id="edu_current_modal" class="w-6 h-6 rounded-lg border-white/10 bg-[#0f172a] text-purple-600 focus:ring-purple-500 focus:ring-offset-0">
                    <label for="edu_current_modal" class="text-sm font-black text-purple-300 cursor-pointer">I am currently enrolled here</label>
                </div>

                <div>
                    <x-input-label value="Achievement / Details" class="font-black text-[10px] uppercase tracking-widest text-slate-400 mb-2" />
                    <textarea name="description" class="block w-full rounded-2xl border-white/10 bg-[#0f172a] px-6 py-4 min-h-[120px] font-medium resize-none shadow-inner text-white focus:border-purple-500 focus:ring-purple-500 placeholder-slate-600" placeholder="GPA 3.9, Honors, Relevant courses..."></textarea>
                </div>

                <div class="flex justify-end space-x-4 pt-6 border-t border-white/10">
                    <button type="button" x-on:click="$dispatch('close')" class="px-8 py-4 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors">Abort</button>
                    <button type="submit" class="px-10 py-4 bg-purple-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-purple-900/20 hover:scale-[1.02] transition">Commit Record</button>
                </div>
            </form>
        </div>
    </x-modal>

    <!-- Experience Modal -->
    <x-modal name="add-experience" :show="false">
        <div class="p-12 bg-[#1e293b] border border-white/10 rounded-[3rem]">
            <div class="flex items-center space-x-6 mb-10 pb-6 border-b border-white/10">
                <div class="w-14 h-14 bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-400 shrink-0">
                    <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                </div>
                <h2 class="text-3xl font-black text-white">Add Professional Role</h2>
            </div>

            <form action="{{ route('user-details.experience.store') }}" method="POST" class="space-y-8" @submit="$dispatch('close')">
                @csrf
                <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div class="md:col-span-2">
                        <x-input-label value="Organization / Company" class="font-black text-[10px] uppercase tracking-widest text-slate-400 mb-2" />
                        <x-text-input name="company" class="block w-full min-h-[56px] rounded-2xl border-white/10 bg-[#0f172a] px-6 font-bold text-white focus:border-purple-500 focus:ring-purple-500" required placeholder="SpaceX" />
                    </div>
                    <div class="md:col-span-2">
                        <x-input-label value="Position / Designation" class="font-black text-[10px] uppercase tracking-widest text-slate-400 mb-2" />
                        <x-text-input name="position" class="block w-full min-h-[56px] rounded-2xl border-white/10 bg-[#0f172a] px-6 font-bold text-white focus:border-purple-500 focus:ring-purple-500" required placeholder="Senior Infrastructure Lead" />
                    </div>
                    <div>
                        <x-input-label value="Work Location" class="font-black text-[10px] uppercase tracking-widest text-slate-400 mb-2" />
                        <x-text-input name="location" class="block w-full min-h-[56px] rounded-2xl border-white/10 bg-[#0f172a] px-6 font-bold text-white focus:border-purple-500 focus:ring-purple-500" placeholder="Austin, TX / Remote" />
                    </div>
                    <div>
                        <x-input-label value="Start Date" class="font-black text-[10px] uppercase tracking-widest text-slate-400 mb-2" />
                        <x-text-input name="start_date" type="date" class="block w-full min-h-[56px] rounded-2xl border-white/10 bg-[#0f172a] px-6 text-white text-sm font-bold focus:border-purple-500 focus:ring-purple-500" required />
                    </div>
                    <div>
                        <x-input-label value="End Date" class="font-black text-[10px] uppercase tracking-widest text-slate-400 mb-2" />
                        <x-text-input name="end_date" type="date" class="block w-full min-h-[56px] rounded-2xl border-white/10 bg-[#0f172a] px-6 text-white text-sm font-bold focus:border-purple-500 focus:ring-purple-500" />
                    </div>
                </div>

                <div class="flex items-center space-x-4 bg-purple-500/5 p-6 rounded-[2rem] border border-white/5">
                    <input type="checkbox" name="currently_working" value="1" id="exp_current_modal" class="w-6 h-6 rounded-lg border-white/10 bg-[#0f172a] text-purple-600 focus:ring-purple-500 focus:ring-offset-0">
                    <label for="exp_current_modal" class="text-sm font-black text-purple-300 cursor-pointer">I am currently employed in this role</label>
                </div>

                <div>
                    <x-input-label value="Core Responsibilities & Impact" class="font-black text-[10px] uppercase tracking-widest text-slate-400 mb-2" />
                    <textarea name="responsibilities" class="block w-full rounded-2xl border-white/10 bg-[#0f172a] px-6 py-4 min-h-[200px] font-medium resize-none shadow-inner text-white focus:border-purple-500 focus:ring-purple-500 placeholder-slate-600" placeholder="• Redesigned cloud architecture...&#10;• Orchestrated deployment of 50+ services..."></textarea>
                </div>

                <div class="flex justify-end space-x-4 pt-6 border-t border-white/10">
                    <button type="button" x-on:click="$dispatch('close')" class="px-8 py-4 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors">Abort</button>
                    <button type="submit" class="px-10 py-4 bg-purple-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-purple-900/20 hover:scale-[1.02] transition">Commit Experience</button>
                </div>
            </form>
        </div>
    </x-modal>

    <!-- Skill Modal -->
    <x-modal name="add-skill" :show="false">
        <div class="p-12 bg-[#1e293b] border border-white/10 rounded-[3rem]">
            <div class="flex items-center space-x-6 mb-10 pb-6 border-b border-white/10">
                <div class="w-14 h-14 bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-400 shrink-0">
                    <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                </div>
                <h2 class="text-3xl font-black text-white">Add Skillset</h2>
            </div>

            <form action="{{ route('user-details.skill.store') }}" method="POST" class="space-y-8" @submit="$dispatch('close')">
                @csrf
                <div>
                    <x-input-label value="Skill Name / Technology" class="font-black text-[10px] uppercase tracking-widest text-slate-400 mb-2" />
                    <x-text-input name="name" class="block w-full min-h-[56px] rounded-2xl border-white/10 bg-[#0f172a] px-6 font-bold text-white focus:border-purple-500 focus:ring-purple-500" required placeholder="Kubernetes, Leadership, Figma..." />
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <x-input-label value="Classification" class="font-black text-[10px] uppercase tracking-widest text-slate-400 mb-2" />
                        <select name="category" class="block w-full min-h-[56px] rounded-2xl border-white/10 bg-[#0f172a] px-6 font-bold text-white focus:ring-purple-500 focus:border-purple-500">
                            <option value="technical">Technical Mastery</option>
                            <option value="soft">Soft / Interpersonal</option>
                            <option value="language">Linguistic Skill</option>
                            <option value="other">Miscellaneous</option>
                        </select>
                    </div>
                    <div>
                        <x-input-label value="Proficiency" class="font-black text-[10px] uppercase tracking-widest text-slate-400 mb-2" />
                        <select name="proficiency" class="block w-full min-h-[56px] rounded-2xl border-white/10 bg-[#0f172a] px-6 font-bold text-white focus:ring-purple-500 focus:border-purple-500">
                            <option value="beginner">Beginner / Learner</option>
                            <option value="intermediate">Intermediate / Competent</option>
                            <option value="advanced">Advanced / Proficient</option>
                            <option value="expert">Expert / Subject Master</option>
                        </select>
                    </div>
                </div>

                <div class="flex justify-end space-x-4 pt-6 border-t border-white/10">
                    <button type="button" x-on:click="$dispatch('close')" class="px-8 py-4 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors">Abort</button>
                    <button type="submit" class="px-10 py-4 bg-purple-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-purple-900/20 hover:scale-[1.02] transition">Add to Mastery</button>
                </div>
            </form>
        </div>
    </x-modal>

    <!-- Certification Modal -->
    <x-modal name="add-certification" :show="false">
        <div class="p-12 bg-[#1e293b] border border-white/10 rounded-[3rem]">
            <div class="flex items-center space-x-6 mb-10 pb-6 border-b border-white/10">
                <div class="w-14 h-14 bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-400 shrink-0">
                    <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path></svg>
                </div>
                <h2 class="text-3xl font-black text-white">Add Credential</h2>
            </div>

            <form action="{{ route('user-details.certification.store') }}" method="POST" class="space-y-8" @submit="$dispatch('close')">
                @csrf
                <div class="space-y-8">
                    <div>
                        <x-input-label value="Certification Title" class="font-black text-[10px] uppercase tracking-widest text-slate-400 mb-2" />
                        <x-text-input name="name" class="block w-full min-h-[56px] rounded-2xl border-white/10 bg-[#0f172a] px-6 font-bold text-white focus:border-purple-500 focus:ring-purple-500" required placeholder="Google Certified Architect" />
                    </div>
                    <div>
                        <x-input-label value="Issuing Agency / Authority" class="font-black text-[10px] uppercase tracking-widest text-slate-400 mb-2" />
                        <x-text-input name="issuing_organization" class="block w-full min-h-[56px] rounded-2xl border-white/10 bg-[#0f172a] px-6 font-bold text-white focus:border-purple-500 focus:ring-purple-500" required placeholder="Google Cloud" />
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <x-input-label value="Date of Issue" class="font-black text-[10px] uppercase tracking-widest text-slate-400 mb-2" />
                            <x-text-input name="issue_date" type="date" class="block w-full min-h-[56px] rounded-2xl border-white/10 bg-[#0f172a] px-6 text-white text-sm font-bold focus:border-purple-500 focus:ring-purple-500" required />
                        </div>
                    </div>
                </div>

                <div class="flex justify-end space-x-4 pt-6 border-t border-white/10">
                    <button type="button" x-on:click="$dispatch('close')" class="px-8 py-4 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors">Abort</button>
                    <button type="submit" class="px-10 py-4 bg-purple-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-purple-900/20 hover:scale-[1.02] transition">Confirm Credential</button>
                </div>
            </form>
        </div>
    </x-modal>

    <!-- Language Modal -->
    <x-modal name="add-language" :show="false">
        <div class="p-12 bg-[#1e293b] border border-white/10 rounded-[3rem]">
            <div class="flex items-center space-x-6 mb-10 pb-6 border-b border-white/10">
                <div class="w-14 h-14 bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-400 shrink-0">
                    <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"></path></svg>
                </div>
                <h2 class="text-3xl font-black text-white">Add Language</h2>
            </div>

            <form action="{{ route('user-details.language.store') }}" method="POST" class="space-y-8" @submit="$dispatch('close')">
                @csrf
                <div>
                    <x-input-label value="Language Name" class="font-black text-[10px] uppercase tracking-widest text-slate-400 mb-2" />
                    <x-text-input name="name" class="block w-full min-h-[56px] rounded-2xl border-white/10 bg-[#0f172a] px-6 font-bold text-white focus:border-purple-500 focus:ring-purple-500" required placeholder="English, Spanish, Mandarin..." />
                </div>
                <div>
                    <x-input-label value="Proficiency Level" class="font-black text-[10px] uppercase tracking-widest text-slate-400 mb-2" />
                    <select name="proficiency" class="block w-full min-h-[56px] rounded-2xl border-white/10 bg-[#0f172a] px-6 font-bold text-white focus:ring-purple-500 focus:border-purple-500">
                        <option value="Native">Native</option>
                        <option value="Fluent">Fluent</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Beginner">Beginner</option>
                    </select>
                </div>

                <div class="flex justify-end space-x-4 pt-6 border-t border-white/10">
                    <button type="button" x-on:click="$dispatch('close')" class="px-8 py-4 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors">Abort</button>
                    <button type="submit" class="px-10 py-4 bg-purple-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-purple-900/20 hover:scale-[1.02] transition">Add Language</button>
                </div>
            </form>
        </div>
    </x-modal>
</div>
@endsection
