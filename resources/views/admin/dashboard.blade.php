@extends('layouts.app')

@section('header')
    <h2 class="font-semibold text-xl text-white leading-tight">
        {{ __('Admin Dashboard') }}
    </h2>
@endsection

@section('content')
<div class="py-12">
    <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
        <!-- Stats Grid -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div class="bg-white/5 backdrop-blur-lg p-6 rounded-[2rem] border border-white/10 relative overflow-hidden group">
                <div class="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div class="relative z-10">
                    <p class="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Users</p>
                    <p class="text-3xl font-black text-white mt-2">{{ $stats['total_users'] }}</p>
                </div>
            </div>
            <div class="bg-white/5 backdrop-blur-lg p-6 rounded-[2rem] border border-white/10 relative overflow-hidden group">
                <div class="absolute inset-0 bg-gradient-to-br from-pink-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div class="relative z-10">
                    <p class="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Resumes</p>
                    <p class="text-3xl font-black text-white mt-2">{{ $stats['total_resumes'] }}</p>
                </div>
            </div>
            <div class="bg-white/5 backdrop-blur-lg p-6 rounded-[2rem] border border-white/10 relative overflow-hidden group">
                <div class="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div class="relative z-10">
                    <p class="text-xs font-bold text-slate-400 uppercase tracking-widest">Active Templates</p>
                    <p class="text-3xl font-black text-white mt-2">{{ $stats['active_templates'] }} <span class="text-base text-slate-500 font-medium">/ {{ $stats['total_templates'] }}</span></p>
                </div>
            </div>
            <div class="bg-white/5 backdrop-blur-lg p-6 rounded-[2rem] border border-white/10 relative overflow-hidden group">
                <div class="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div class="relative z-10">
                    <p class="text-xs font-bold text-slate-400 uppercase tracking-widest">Avg Resumes/User</p>
                    <p class="text-3xl font-black text-white mt-2">{{ $stats['total_users'] > 0 ? round($stats['total_resumes'] / $stats['total_users'], 1) : 0 }}</p>
                </div>
            </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <!-- Recent Users -->
            <div class="bg-white/5 backdrop-blur-lg rounded-[2.5rem] border border-white/10 overflow-hidden">
                <div class="px-8 py-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                    <h3 class="font-bold text-white text-lg">Recent Users</h3>
                    <a href="{{ route('admin.users.index') }}" class="text-xs font-bold uppercase tracking-widest text-purple-400 hover:text-purple-300 transition">View All</a>
                </div>
                <div class="p-0">
                    <table class="w-full text-left">
                        <tbody class="divide-y divide-white/10">
                            @foreach($recentUsers as $user)
                            <tr class="hover:bg-white/5 transition duration-150">
                                <td class="px-8 py-5">
                                    <div class="font-bold text-white">{{ $user->name }}</div>
                                    <div class="text-xs text-slate-500 font-medium">{{ $user->email }}</div>
                                </td>
                                <td class="px-8 py-5 text-xs font-medium text-slate-400 text-right">
                                    {{ $user->created_at->diffForHumans() }}
                                </td>
                                <td class="px-8 py-5 text-right w-1">
                                    <a href="{{ route('admin.users.show', $user) }}" class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-white/5 hover:bg-purple-500/20 text-slate-400 hover:text-purple-300 transition">
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
                                    </a>
                                </td>
                            </tr>
                            @endforeach
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Popular Templates -->
            <div class="bg-white/5 backdrop-blur-lg rounded-[2.5rem] border border-white/10 overflow-hidden">
                <div class="px-8 py-6 border-b border-white/10 bg-white/5">
                    <h3 class="font-bold text-white text-lg">Template Popularity</h3>
                </div>
                <div class="p-8">
                    <div class="space-y-8">
                        @foreach($popularTemplates as $template)
                        <div>
                            <div class="flex justify-between text-sm mb-2">
                                <span class="font-bold text-slate-200">{{ $template->name }}</span>
                                <span class="text-slate-400 font-medium">{{ $template->resumes_count }} <span class="text-xs uppercase tracking-wider opacity-70">resumes</span></span>
                            </div>
                            <div class="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                                @php 
                                    $percentage = $stats['total_resumes'] > 0 ? ($template->resumes_count / $stats['total_resumes']) * 100 : 0;
                                @endphp
                                <div class="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full" style="width: {{ $percentage }}%"></div>
                            </div>
                        </div>
                        @endforeach
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection
