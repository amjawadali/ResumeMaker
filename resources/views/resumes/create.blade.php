@extends('layouts.app')

@section('header')
    <h2 class="font-semibold text-xl text-gray-800 leading-tight">
        {{ __('Choose a Template') }}
    </h2>
@endsection

@section('content')
<div class="relative min-h-screen bg-[#0f172a] overflow-hidden py-12">
    <!-- Background Gradients -->
    <div class="absolute inset-0 pointer-events-none">
        <div class="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600/20 rounded-full blur-[120px]"></div>
        <div class="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[120px]"></div>
    </div>

    <div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Page Header -->
        <div class="mb-12 text-center">
            <h2 class="text-4xl font-black text-white tracking-tight mb-4">
                Choose Your <span class="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Template</span>
            </h2>
            <p class="text-slate-400 text-base font-medium max-w-xl mx-auto">
                Select a professional design for your resume. Hover to start building.
            </p>
            </p>
        </div>

        @if ($errors->any())
            <div class="mb-8 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                <strong class="font-bold">Whoops!</strong>
                <span class="block sm:inline">Something went wrong.</span>
                <ul class="mt-2 list-disc list-inside text-sm">
                    @foreach ($errors->all() as $error)
                        <li>{{ $error }}</li>
                    @endforeach
                </ul>
            </div>
        @endif

        <!-- Templates Grid - Matching Dashboard Style -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            @foreach ($templates as $template)
                <div class="group relative flex flex-col h-full">
                    <!-- Compact Resume Card (Same as Dashboard) -->
                    <div class="template-card relative w-full aspect-[1/1.414] rounded-[1.5rem] overflow-hidden bg-slate-800 border-2 border-slate-700/50 shadow-2xl transition-all duration-300 hover:shadow-purple-500/20 hover:border-purple-500/30">
                        
                        <!-- The "Live" Template Preview -->
                        <div class="absolute inset-0 overflow-hidden bg-white">
                             <div class="template-preview-container w-full h-full">
                                <iframe 
                                    src="{{ route('templates.preview', $template) }}" 
                                    class="template-iframe border-none pointer-events-none" 
                                    scrolling="no"
                                    style="width: 840px; height: 1188px; transform-origin: top left;"
                                ></iframe>
                             </div>
                        </div>

                        <!-- Loading State -->
                        <div class="template-loading absolute inset-0 bg-slate-900 flex items-center justify-center z-5">
                            <div class="flex flex-col items-center">
                                <div class="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
                                <span class="text-xs text-slate-500 mt-3 font-medium">Loading...</span>
                            </div>
                        </div>

                        <!-- Category Badge -->
                        <div class="absolute top-4 left-4 z-20">
                            <span class="px-3 py-1 bg-black/50 backdrop-blur-md border border-white/10 rounded-full text-[9px] font-black uppercase text-purple-300 tracking-widest">
                                {{ $template->category }}
                            </span>
                        </div>

                        <!-- Gradient Overlay for Bottom Text -->
                        <div class="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-slate-900 via-slate-900/95 to-transparent pointer-events-none z-10"></div>

                        <!-- Card Footer Content -->
                        <div class="absolute bottom-0 inset-x-0 p-5 z-20">
                            <h4 class="text-base font-bold text-white mb-1 truncate">{{ $template->name }}</h4>
                            <p class="text-[11px] text-slate-400 line-clamp-1">{{ $template->description }}</p>
                        </div>

                        <!-- Action Overlay (On Hover) - Same as Dashboard -->
                        <div class="absolute inset-0 bg-slate-900/85 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 z-30 flex flex-col items-center justify-center p-6">
                            <div class="text-center mb-6">
                                <h4 class="text-xl font-bold text-white mb-2">{{ $template->name }}</h4>
                                <p class="text-xs text-slate-400 max-w-[200px] mx-auto line-clamp-2">{{ $template->description }}</p>
                            </div>
                            
                            <form action="{{ route('resumes.store') }}" method="POST" class="w-full max-w-[200px]">
                                @csrf
                                <input type="hidden" name="template_id" value="{{ $template->id }}">
                                <input type="hidden" name="title" value="My {{ $template->name }} Resume">
                                <button type="submit" class="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-bold text-sm tracking-wide hover:shadow-lg hover:shadow-purple-500/30 transition-all flex items-center justify-center transform hover:scale-105">
                                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                                    Start Building
                                </button>
                            </form>
                            
                            <a href="{{ route('templates.preview', $template) }}" target="_blank" class="mt-3 text-xs text-slate-400 hover:text-purple-400 transition-colors flex items-center">
                                <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                                Full Preview
                            </a>
                        </div>
                    </div>
                </div>
            @endforeach
        </div>

        <!-- Back to Dashboard -->
        <div class="mt-12 text-center">
            <a href="{{ route('resumes.index') }}" class="inline-flex items-center text-slate-500 hover:text-purple-400 font-medium text-sm transition-colors">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                Back to Dashboard
            </a>
        </div>
    </div>
</div>
@endsection

@push('scripts')
<script>
    document.addEventListener('DOMContentLoaded', function() {
        const IFRAME_WIDTH = 840;
        const IFRAME_HEIGHT = 1188;
        
        function scaleTemplateIframes() {
            document.querySelectorAll('.template-card').forEach(card => {
                const container = card.querySelector('.template-preview-container');
                const iframe = card.querySelector('.template-iframe');
                const loading = card.querySelector('.template-loading');
                
                if (!container || !iframe) return;
                
                const containerWidth = container.offsetWidth;
                const containerHeight = container.offsetHeight;
                
                const scaleX = containerWidth / IFRAME_WIDTH;
                const scaleY = containerHeight / IFRAME_HEIGHT;
                const scale = Math.min(scaleX, scaleY);
                
                iframe.style.transform = `scale(${scale})`;
                
                iframe.onload = () => {
                    if (loading) {
                        loading.style.opacity = '0';
                        setTimeout(() => loading.style.display = 'none', 300);
                    }
                };
            });
        }
        
        scaleTemplateIframes();
        
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(scaleTemplateIframes, 100);
        });
    });
</script>
@endpush
