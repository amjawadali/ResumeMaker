@extends('layouts.app')

@section('header')
    <div class="flex justify-between items-center">
        <h2 class="font-semibold text-xl text-gray-800 leading-tight">
            {{ __('Manage Templates') }}
        </h2>
        <a href="{{ route('admin.templates.create') }}" class="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700 active:bg-indigo-900 focus:outline-none focus:border-indigo-900 focus:ring ring-indigo-300 disabled:opacity-25 transition ease-in-out duration-150">
            {{ __('Add New Template') }}
        </a>
    </div>
@endsection

@section('content')
<div class="py-12">
    <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
        @if (session('success'))
            <div class="mb-4 font-medium text-sm text-green-600 bg-green-100 p-4 rounded-lg">
                {{ session('success') }}
            </div>
        @endif

        <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg border border-gray-200">
            <div class="overflow-x-auto">
                <table class="w-full text-left">
                    <thead class="bg-gray-50 border-b">
                        <tr>
                            <th class="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Preview</th>
                            <th class="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Name / Category</th>
                            <th class="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Slug / View</th>
                            <th class="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-center">Status</th>
                            <th class="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y whitespace-nowrap">
                        @foreach($templates as $template)
                        <tr class="hover:bg-gray-50 transition">
                            <td class="px-6 py-4">
                                <div class="w-12 h-16 bg-gray-100 rounded overflow-hidden border">
                                    @if($template->preview_image)
                                        <img src="{{ Storage::url($template->preview_image) }}" class="w-full h-full object-cover">
                                    @else
                                        <div class="w-full h-full flex items-center justify-center text-[8px] text-gray-400 p-1 text-center">No Image</div>
                                    @endif
                                </div>
                            </td>
                            <td class="px-6 py-4">
                                <div class="font-bold text-gray-900">{{ $template->name }}</div>
                                <div class="text-xs text-indigo-600 uppercase">{{ $template->category }}</div>
                            </td>
                            <td class="px-6 py-4">
                                <div class="text-sm font-mono text-gray-500">{{ $template->slug }}</div>
                                <div class="text-xs text-gray-400">{{ $template->blade_view }}</div>
                            </td>
                            <td class="px-6 py-4 text-center">
                                <form action="{{ route('admin.templates.toggle-active', $template) }}" method="POST">
                                    @csrf
                                    <button type="submit" class="px-3 py-1 rounded-full text-[10px] font-bold uppercase transition {{ $template->is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700' }}">
                                        {{ $template->is_active ? 'Active' : 'Inactive' }}
                                    </button>
                                </form>
                            </td>
                            <td class="px-6 py-4 text-right">
                                <div class="flex justify-end space-x-2">
                                    <a href="{{ route('admin.templates.edit', $template) }}" class="text-gray-400 hover:text-indigo-600">
                                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                                    </a>
                                    <form action="{{ route('admin.templates.destroy', $template) }}" method="POST" class="inline">
                                        @csrf @method('DELETE')
                                        <button type="submit" class="text-gray-400 hover:text-red-600" onclick="return confirm('Delete this template?')">
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
        </div>
    </div>
</div>
@endsection
