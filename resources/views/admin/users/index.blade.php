@extends('layouts.app')

@section('header')
    <h2 class="font-semibold text-xl text-white leading-tight">
        {{ __('User Management') }}
    </h2>
@endsection

@section('content')
<div class="py-12">
    <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
        @if (session('success'))
            <div class="mb-4 font-bold text-sm text-green-400 bg-green-400/10 border border-green-400/20 p-4 rounded-xl backdrop-blur-md">
                {{ session('success') }}
            </div>
        @endif

        <div class="bg-white/5 backdrop-blur-lg overflow-hidden sm:rounded-[2.5rem] border border-white/10">
            <div class="overflow-x-auto">
                <table class="w-full text-left">
                    <thead class="bg-white/5 border-b border-white/10">
                        <tr>
                            <th class="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">User</th>
                            <th class="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Role</th>
                            <th class="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Joined</th>
                            <th class="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-white/5">
                        @foreach($users as $user)
                        <tr class="hover:bg-white/5 transition duration-150">
                            <td class="px-8 py-5">
                                <div class="font-bold text-white text-base">{{ $user->name }}</div>
                                <div class="text-xs text-slate-500 font-medium">{{ $user->email }}</div>
                            </td>
                            <td class="px-8 py-5">
                                @foreach($user->roles as $role)
                                    <span class="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider {{ $role->name === 'admin' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/20' : 'bg-blue-500/20 text-blue-300 border border-blue-500/20' }}">
                                        {{ $role->name }}
                                    </span>
                                @endforeach
                            </td>
                            <td class="px-8 py-5 text-sm font-medium text-slate-400">
                                {{ $user->created_at->format('M d, Y') }}
                            </td>
                            <td class="px-8 py-5 text-right">
                                <div class="flex items-center justify-end gap-3">
                                    <form action="{{ route('admin.users.assign-role', $user) }}" method="POST" class="inline-block relative group">
                                        @csrf
                                        <select name="role" onchange="this.form.submit()" class="text-xs font-bold bg-slate-900 border-white/10 rounded-lg focus:ring-purple-500 focus:border-purple-500 text-slate-300 cursor-pointer py-1.5 pl-3 pr-8">
                                            <option value="" disabled selected>Change Role</option>
                                            <option value="user">User</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </form>
                                    <form action="{{ route('admin.users.destroy', $user) }}" method="POST" class="inline">
                                        @csrf @method('DELETE')
                                        <button type="submit" class="p-1.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/20 transition" onclick="return confirm('Delete this user?')">
                                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                        </button>
                                    </form>
                                </div>
                            </td>
                        </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
            @if($users->hasPages())
            <div class="px-8 py-5 border-t border-white/10 bg-white/5">
                {{ $users->links() }}
            </div>
            @endif
        </div>
    </div>
</div>
@endsection
