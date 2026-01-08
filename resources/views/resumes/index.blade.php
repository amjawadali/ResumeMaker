@extends('layouts.app')

@section('header')
    <div class="flex justify-between items-center py-2 relative z-20">
        <h2 class="font-bold text-2xl text-white leading-tight">
            Dashboard
        </h2>
        <div class="flex items-center space-x-4">
            <span class="text-sm text-slate-400 hidden md:block">Welcome back, <span class="font-bold text-purple-400">{{ auth()->user()->name }}</span></span>
            <a href="{{ route('resumes.create') }}" class="inline-flex items-center px-6 py-2.5 bg-purple-600 border border-transparent rounded-xl font-bold text-xs text-white uppercase tracking-widest hover:bg-purple-500 active:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-900 transition ease-in-out duration-150 shadow-lg shadow-purple-500/20">
                <svg class="w-4 h-4 mr-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
                Create New Resume
            </a>
        </div>
    </div>
@endsection

@section('content')
<div class="relative min-h-screen bg-[#0f172a] overflow-hidden font-sans">
    <!-- Background Gradients -->
    <div class="absolute inset-0 pointer-events-none">
        <div class="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600/30 rounded-full blur-[120px] animate-pulse-slow"></div>
        <div class="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/30 rounded-full blur-[120px] animate-pulse-slow delay-1000"></div>
        <div class="absolute top-[20%] right-[20%] w-[30%] h-[30%] bg-pink-600/20 rounded-full blur-[100px] animate-pulse-slow delay-2000"></div>
    </div>

    <div class="relative z-10 max-w-7xl mx-auto sm:px-6 lg:px-8 py-12">
        <!-- Dashboard Header -->
        <div class="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div>
                <h2 class="text-4xl font-black text-white tracking-tight leading-tight">
                    Welcome back, <span class="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">{{ auth()->user()->name }}</span>
                </h2>
                <p class="mt-2 text-slate-400 font-medium text-lg">Manage your career assets and track your progress.</p>
            </div>
            
            <a href="{{ route('resumes.create') }}" class="group relative px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-2xl border border-white/10 transition-all duration-300 hover:scale-[1.02]">
                <div class="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <span class="relative flex items-center font-bold text-white uppercase tracking-widest text-xs">
                    <svg class="w-5 h-5 mr-3 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
                    Create New Resume
                </span>
            </a>
        </div>

        <!-- Quick Stats & Actions Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-16">
            <!-- Profile Completion Card -->
            <div class="lg:col-span-8 relative overflow-hidden bg-white/5 backdrop-blur-xl rounded-[2.5rem] border border-white/10 p-10 group">
                <div class="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                
                <div class="relative z-10 flex flex-col md:flex-row items-center gap-10">
                    <div class="relative w-32 h-32 flex-shrink-0">
                        <!-- Circular Progress -->
                        <svg class="w-full h-full transform -rotate-90">
                            <circle cx="64" cy="64" r="58" stroke="currentColor" stroke-width="8" fill="transparent" class="text-white/5" />
                            <circle cx="64" cy="64" r="58" stroke="currentColor" stroke-width="8" fill="transparent" stroke-dasharray="364.4" stroke-dashoffset="{{ 364.4 - (364.4 * $completion) / 100 }}" class="text-purple-500 transition-all duration-1000 ease-out" />
                        </svg>
                        <div class="absolute inset-0 flex items-center justify-center flex-col">
                            <span class="text-2xl font-black text-white">{{ $completion }}%</span>
                        </div>
                    </div>

                    <div class="flex-grow text-center md:text-left">
                        <h3 class="text-2xl font-bold text-white mb-2">Profile Status</h3>
                        @if($completion < 100)
                            <p class="text-slate-400 mb-6 font-light leading-relaxed">Your profile is incomplete. Add more details to unlock the full potential of your resumes.</p>
                            <a href="{{ route('user-details.index') }}" class="inline-flex items-center text-purple-400 hover:text-purple-300 font-bold uppercase text-xs tracking-widest transition-colors">
                                Complete Profile <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                            </a>
                        @else
                            <p class="text-slate-400 font-light leading-relaxed">Excellent! Your profile is fully optimized and ready for job applications.</p>
                        @endif
                    </div>
                </div>
            </div>

            <!-- Stats Column -->
            <div class="lg:col-span-4 grid grid-cols-1 gap-6">
                <!-- Stat Item -->
                <div class="bg-white/5 backdrop-blur-lg rounded-[2rem] p-6 border border-white/5 hover:bg-white/10 transition-colors group cursor-default">
                    <div class="flex items-center justify-between mb-2">
                        <span class="text-xs font-bold text-slate-500 uppercase tracking-widest">Total Resumes</span>
                        <svg class="w-5 h-5 text-pink-500 opacity-50 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                    </div>
                    <span class="text-3xl font-black text-white">{{ $user->resumes_count }}</span>
                </div>
                <!-- Stat Item -->
                <div class="bg-white/5 backdrop-blur-lg rounded-[2rem] p-6 border border-white/5 hover:bg-white/10 transition-colors group cursor-default">
                    <div class="flex items-center justify-between mb-2">
                        <span class="text-xs font-bold text-slate-500 uppercase tracking-widest">Skills Logged</span>
                        <svg class="w-5 h-5 text-purple-500 opacity-50 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                    </div>
                    <span class="text-3xl font-black text-white">{{ $user->skills_count }}</span>
                </div>
            </div>
        </div>

        <!-- Start New Section Area (Quick Links) -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
            <a href="{{ route('user-details.index') }}" class="group p-6 bg-white/5 hover:bg-white/10 backdrop-blur-md rounded-3xl border border-white/5 hover:border-purple-500/30 transition-all duration-300">
                <div class="w-12 h-12 bg-purple-500/20 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <svg class="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                </div>
                <h3 class="text-white font-bold mb-1">Personal Info</h3>
                <p class="text-[10px] text-slate-400 uppercase tracking-wider">Update Details</p>
            </a>
            <a href="{{ route('templates.index') }}" class="group p-6 bg-white/5 hover:bg-white/10 backdrop-blur-md rounded-3xl border border-white/5 hover:border-pink-500/30 transition-all duration-300">
                <div class="w-12 h-12 bg-pink-500/20 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <svg class="w-6 h-6 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                </div>
                <h3 class="text-white font-bold mb-1">Templates</h3>
                <p class="text-[10px] text-slate-400 uppercase tracking-wider">Explore Designs</p>
            </a>
        </div>

        <!-- Resumes Grid -->
        <h3 class="text-2xl font-black text-white mb-8 flex items-center">
            Your Resumes 
            <span class="ml-4 text-xs font-bold bg-white/10 text-slate-300 px-3 py-1 rounded-full border border-white/5">{{ $resumes->count() }}</span>
        </h3>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            @forelse ($resumes as $resume)
                <div class="group relative flex flex-col h-full">
                    <!-- Premium Resume Card -->
                    <div class="resume-card relative w-full aspect-[1/1.414] rounded-[1.5rem] overflow-hidden bg-slate-800 border-2 border-slate-700/50 shadow-2xl transition-all duration-300 hover:shadow-purple-500/20 hover:border-purple-500/30">
                        
                        <!-- The "Live" Resume Preview -->
                        <div class="absolute inset-0 overflow-hidden bg-white">
                             <div class="resume-preview-container w-full h-full">
                                <iframe 
                                    src="{{ route('resumes.preview', $resume) }}" 
                                    class="resume-iframe border-none pointer-events-none" 
                                    scrolling="no"
                                    style="width: 840px; height: 1188px; transform-origin: top left;"
                                ></iframe>
                             </div>
                        </div>

                        <!-- Loading State -->
                        <div class="resume-loading absolute inset-0 bg-slate-900 flex items-center justify-center z-5">
                            <div class="flex flex-col items-center">
                                <div class="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
                                <span class="text-xs text-slate-500 mt-3 font-medium">Loading preview...</span>
                            </div>
                        </div>

                        <!-- Gradient Overlay for Bottom Text -->
                        <div class="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-slate-900 via-slate-900/95 to-transparent pointer-events-none z-10"></div>

                        <!-- Card Footer Content -->
                        <div class="absolute bottom-0 inset-x-0 p-5 z-20">
                            <h4 class="text-base font-bold text-white mb-1.5 truncate drop-shadow-md">{{ $resume->title }}</h4>
                            <div class="flex items-center justify-between">
                                <span class="text-[10px] text-slate-300 font-medium uppercase tracking-wider flex items-center gap-1.5 opacity-90">
                                    <div class="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse"></div>
                                    {{ $resume->updated_at->diffForHumans() }}
                                </span>
                                <span class="text-[9px] font-black uppercase text-slate-400 tracking-widest bg-black/40 backdrop-blur px-2.5 py-1 rounded-md">
                                    {{ $resume->template->name }}
                                </span>
                            </div>
                        </div>

                        <!-- Action Overlay (On Hover) -->
                        <div class="absolute inset-0 bg-slate-900/85 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 z-30 flex flex-col items-center justify-center p-6 gap-2.5">
                            <a href="{{ route('resumes.edit', $resume) }}" class="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-bold text-sm tracking-wide hover:shadow-lg hover:shadow-purple-500/30 transition-all flex items-center justify-center transform hover:scale-105">
                                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                                Edit Resume
                            </a>
                            
                            <a href="{{ route('resumes.show', $resume) }}" target="_blank" class="w-full py-3 bg-white text-slate-900 rounded-xl font-bold text-sm tracking-wide hover:bg-slate-100 transition-colors flex items-center justify-center">
                                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                                Preview
                            </a>

                            <div class="flex w-full gap-2 mt-1">
                                <a href="{{ route('resumes.download-pdf', $resume) }}" class="flex-1 h-10 flex items-center justify-center rounded-lg border border-white/20 text-white hover:bg-white/10 transition-colors" title="Download PDF">
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                                </a>
                                <form action="{{ route('resumes.duplicate', $resume) }}" method="POST" class="flex-1">
                                    @csrf
                                    <button type="submit" class="w-full h-10 flex items-center justify-center rounded-lg border border-white/20 text-white hover:bg-white/10 transition-colors" title="Duplicate">
                                       <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 01-2-2V5a2 2 0 012-2h4.586"></path></svg>
                                    </button>
                                </form>
                                <form action="{{ route('resumes.destroy', $resume) }}" method="POST" class="flex-1">
                                    @csrf @method('DELETE')
                                    <button type="submit" onclick="return confirm('Delete this resume?')" class="w-full h-10 flex items-center justify-center rounded-lg border border-red-500/30 text-red-500 hover:bg-red-500/20 transition-colors" title="Delete">
                                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            @empty
                <div class="col-span-full py-32 flex flex-col items-center justify-center text-center">
                    <div class="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6 animate-bounce-slow">
                        <svg class="w-10 h-10 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                    </div>
                    <h3 class="text-2xl font-black text-white mb-2">No resumes yet</h3>
                    <p class="text-slate-400 max-w-sm mb-8">Start building your professional identity today.</p>
                    <a href="{{ route('resumes.create') }}" class="px-10 py-4 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl font-bold uppercase tracking-widest shadow-lg shadow-purple-900/20 hover:scale-105 transition-all">
                        Create Resume
                    </a>
                </div>
            @endforelse
        </div>
    </div>
</div>
@endsection

@push('scripts')
<script>
    document.addEventListener('DOMContentLoaded', function() {
        // Resume iframe dimensions (A4 at 96 DPI)
        const IFRAME_WIDTH = 840;
        const IFRAME_HEIGHT = 1188;
        
        function scaleResumeIframes() {
            document.querySelectorAll('.resume-card').forEach(card => {
                const container = card.querySelector('.resume-preview-container');
                const iframe = card.querySelector('.resume-iframe');
                const loading = card.querySelector('.resume-loading');
                
                if (!container || !iframe) return;
                
                const containerWidth = container.offsetWidth;
                const containerHeight = container.offsetHeight;
                
                // Calculate scale to fit both width and height
                const scaleX = containerWidth / IFRAME_WIDTH;
                const scaleY = containerHeight / IFRAME_HEIGHT;
                const scale = Math.min(scaleX, scaleY);
                
                iframe.style.transform = `scale(${scale})`;
                
                // Hide loading when iframe loads
                iframe.onload = () => {
                    if (loading) {
                        loading.style.opacity = '0';
                        setTimeout(() => loading.style.display = 'none', 300);
                    }
                };
            });
        }
        
        // Initial scale
        scaleResumeIframes();
        
        // Re-scale on resize
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(scaleResumeIframes, 100);
        });
    });
</script>
@endpush
