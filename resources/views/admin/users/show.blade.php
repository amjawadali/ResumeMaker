@extends('layouts.app')

@section('header')
    <div class="flex justify-between items-center py-2 relative z-20">
        <h2 class="font-black text-2xl text-white leading-tight">
            User Details: <span class="text-purple-400 underline decoration-purple-400/30 decoration-4 underline-offset-4">{{ $user->name }}</span>
        </h2>
        <a href="{{ route('admin.users.index') }}" class="inline-flex items-center px-4 py-2 bg-white/10 border border-white/10 rounded-xl font-bold text-xs text-white uppercase tracking-widest hover:bg-white/20 transition shadow-lg">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            Back to User List
        </a>
    </div>
@endsection

@section('content')
<div class="py-10 min-h-screen">
    <div class="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-8">
        
        <!-- User Overview Card -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div class="lg:col-span-1 bg-white/5 backdrop-blur-xl rounded-[2.5rem] shadow-xl border border-white/10 p-8 flex flex-col items-center text-center">
                <div class="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-2 border-white/10 shadow-lg flex items-center justify-center text-purple-400 mb-6 shrink-0 overflow-hidden">
                    @if($user->userDetail && $user->userDetail->profile_photo)
                        <img src="{{ Storage::url($user->userDetail->profile_photo) }}" alt="Profile" class="w-full h-full object-cover">
                    @else
                        <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                    @endif
                </div>
                <h3 class="text-xl font-black text-white mb-1">{{ $user->name }}</h3>
                <p class="text-sm font-bold text-slate-400 mb-4">{{ $user->email }}</p>
                
                <div class="flex flex-wrap justify-center gap-2 mb-6">
                    @foreach($user->roles as $role)
                        <span class="px-3 py-1 bg-purple-500/10 text-purple-400 text-[10px] font-black uppercase tracking-widest rounded-lg border border-purple-500/20">
                            {{ $role->name }}
                        </span>
                    @endforeach
                </div>

                <div class="w-full pt-6 border-t border-white/5 grid grid-cols-2 gap-4">
                    <div class="text-center p-4 bg-white/5 rounded-2xl group cursor-pointer hover:bg-purple-500/20 transition-colors">
                        <span class="block text-2xl font-black text-purple-400 group-hover:scale-110 transition-transform">{{ $user->resumes->count() }}</span>
                        <span class="text-[9px] uppercase font-black text-slate-500 tracking-widest">Resumes</span>
                    </div>
                    <div class="text-center p-4 bg-white/5 rounded-2xl group cursor-pointer hover:bg-pink-500/20 transition-colors">
                        <span class="block text-2xl font-black text-pink-400 group-hover:scale-110 transition-transform">
                            {{ (int) $user->created_at->diffInDays(now()) }}
                        </span>
                        <span class="text-[9px] uppercase font-black text-slate-500 tracking-widest">Days Joined</span>
                    </div>
                </div>
            </div>

            <!-- Profile Details -->
            <div class="lg:col-span-2 space-y-8">
                <div class="bg-white/5 backdrop-blur-xl rounded-[2.5rem] shadow-xl border border-white/10 p-8">
                    <h3 class="text-[10px] font-black uppercase tracking-[0.2em] text-purple-400 mb-6">Account Details</h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <p class="text-[10px] uppercase font-black text-slate-500 tracking-widest mb-1">Full Name</p>
                            <p class="font-bold text-white">{{ $user->name }}</p>
                        </div>
                        <div>
                            <p class="text-[10px] uppercase font-black text-slate-500 tracking-widest mb-1">Email Address</p>
                            <p class="font-bold text-white">{{ $user->email }}</p>
                        </div>
                        <div>
                            <p class="text-[10px] uppercase font-black text-slate-500 tracking-widest mb-1">Joined Date</p>
                            <p class="font-bold text-white">{{ $user->created_at->format('F d, Y') }}</p>
                        </div>
                        <div>
                            <p class="text-[10px] uppercase font-black text-slate-500 tracking-widest mb-1">Account Status</p>
                            <div class="flex items-center">
                                <span class="w-2 h-2 rounded-full bg-emerald-500 mr-2 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></span>
                                <span class="font-bold text-emerald-400">Active</span>
                            </div>
                        </div>
                    </div>
                </div>

                @if($user->userDetail)
                <div class="bg-white/5 backdrop-blur-xl rounded-[2.5rem] shadow-xl border border-white/10 p-8">
                    <h3 class="text-[10px] font-black uppercase tracking-[0.2em] text-purple-400 mb-6">Professional Profile</h3>
                    <div class="space-y-6">
                        @if($user->userDetail->professional_summary)
                        <div>
                            <p class="text-[10px] uppercase font-black text-slate-500 tracking-widest mb-2">Professional Summary</p>
                            <p class="text-sm font-medium text-slate-300 leading-relaxed bg-black/20 p-6 rounded-3xl border border-white/5 italic">
                                "{{ $user->userDetail->professional_summary }}"
                            </p>
                        </div>
                        @endif
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                            @if($user->userDetail->phone)
                            <div>
                                <p class="text-[10px] uppercase font-black text-slate-500 tracking-widest mb-1">Phone</p>
                                <p class="font-bold text-white">{{ $user->userDetail->phone }}</p>
                            </div>
                            @endif
                            @if($user->userDetail->address)
                            <div>
                                <p class="text-[10px] uppercase font-black text-slate-500 tracking-widest mb-1">Location</p>
                                <p class="font-bold text-white">{{ $user->userDetail->address }}</p>
                            </div>
                            @endif
                        </div>
                    </div>
                </div>
                @endif
            </div>
        </div>

        <!-- User's Resumes -->
        <div class="bg-white/5 backdrop-blur-xl rounded-[2.5rem] shadow-xl border border-white/10 overflow-hidden">
            <div class="p-8 border-b border-white/5 flex justify-between items-center">
                <h3 class="text-xl font-black text-white">User's Resumes</h3>
                <span class="px-4 py-2 bg-purple-500/10 text-purple-400 rounded-xl font-black text-[10px] uppercase tracking-widest border border-purple-500/20">
                    Total: {{ $user->resumes->count() }}
                </span>
            </div>
            
            <div class="overflow-x-auto">
                <table class="w-full text-left">
                    <thead class="bg-black/20 border-b border-white/5">
                        <tr>
                            <th class="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Resume Title</th>
                            <th class="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Template</th>
                            <th class="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Last Updated</th>
                            <th class="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-white/5">
                        @forelse($user->resumes as $resume)
                        <tr class="hover:bg-white/5 transition duration-300">
                            <td class="px-8 py-6">
                                <div class="font-black text-white text-lg">{{ $resume->title }}</div>
                                <div class="text-[10px] font-bold text-purple-400 uppercase tracking-widest mt-1">ID: #{{ $resume->id }}</div>
                            </td>
                            <td class="px-8 py-6">
                                <span class="inline-flex items-center px-3 py-1.5 rounded-lg font-black text-[9px] bg-white/10 text-white uppercase tracking-widest border border-white/5">
                                    {{ $resume->template->name }}
                                </span>
                            </td>
                            <td class="px-8 py-6">
                                <div class="text-sm font-bold text-slate-300">{{ $resume->updated_at->format('M d, Y') }}</div>
                                <div class="text-[10px] font-medium text-slate-500">{{ $resume->updated_at->diffForHumans() }}</div>
                            </td>
                            <td class="px-8 py-6 text-right">
                                <a href="{{ route('resumes.show', $resume) }}" target="_blank" class="inline-flex items-center justify-center p-3 bg-white/10 border border-white/10 text-white rounded-xl hover:bg-purple-600 transition shadow-lg group">
                                    <svg class="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                                </a>
                            </td>
                        </tr>
                        @empty
                        <tr>
                            <td colspan="4" class="px-8 py-16 text-center">
                                <div class="flex flex-col items-center">
                                    <div class="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-slate-500 mb-4">
                                        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                                    </div>
                                    <h4 class="text-sm font-black text-slate-500 uppercase tracking-widest">No resumes created yet</h4>
                                </div>
                            </td>
                        </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</div>
@endsection
