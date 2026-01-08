@extends('layouts.app')

@section('header')
    <h2 class="font-semibold text-xl text-gray-800 leading-tight">
        {{ __('Edit Template: ') }} {{ $template->name }}
    </h2>
@endsection

@section('content')
<div class="py-12">
    <div class="max-w-4xl mx-auto sm:px-6 lg:px-8">
        <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg border border-gray-200 p-8">
            <form action="{{ route('admin.templates.update', $template) }}" method="POST" enctype="multipart/form-data">
                @csrf
                @method('PUT')
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <x-input-label for="name" :value="__('Template Name')" />
                        <x-text-input id="name" name="name" type="text" class="mt-1 block w-full" :value="old('name', $template->name)" required />
                        <x-input-error class="mt-2" :messages="$errors->get('name')" />
                    </div>

                    <div>
                        <x-input-label for="category" :value="__('Category')" />
                        <select id="category" name="category" class="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm">
                            @foreach(['modern', 'classic', 'creative', 'minimal', 'executive'] as $cat)
                                <option value="{{ $cat }}" {{ old('category', $template->category) == $cat ? 'selected' : '' }}>{{ ucfirst($cat) }}</option>
                            @endforeach
                        </select>
                        <x-input-error class="mt-2" :messages="$errors->get('category')" />
                    </div>

                    <div class="md:col-span-2">
                        <x-input-label for="blade_view" :value="__('Blade View Path')" />
                        <x-text-input id="blade_view" name="blade_view" type="text" class="mt-1 block w-full" :value="old('blade_view', $template->blade_view)" required />
                        <x-input-error class="mt-2" :messages="$errors->get('blade_view')" />
                    </div>

                    <div class="md:col-span-2">
                        <x-input-label for="description" :value="__('Description')" />
                        <textarea id="description" name="description" rows="3" class="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm">{{ old('description', $template->description) }}</textarea>
                        <x-input-error class="mt-2" :messages="$errors->get('description')" />
                    </div>

                    <div class="flex space-x-4">
                        <div class="flex-shrink-0">
                            @if($template->preview_image)
                                <img src="{{ Storage::url($template->preview_image) }}" class="w-20 h-28 object-cover rounded border">
                            @else
                                <div class="w-20 h-28 bg-gray-100 flex items-center justify-center text-xs text-gray-400 rounded border">No Image</div>
                            @endif
                        </div>
                        <div class="flex-grow">
                            <x-input-label for="preview_image" :value="__('Update Preview Image')" />
                            <input id="preview_image" name="preview_image" type="file" class="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
                            <x-input-error class="mt-2" :messages="$errors->get('preview_image')" />
                        </div>
                    </div>

                    <div class="flex items-center">
                        <label class="inline-flex items-center">
                            <input type="checkbox" name="is_active" value="1" {{ old('is_active', $template->is_active) ? 'checked' : '' }} class="rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500">
                            <span class="ml-2 text-sm text-gray-600">Active</span>
                        </label>
                    </div>
                </div>

                <div class="mt-8 flex justify-end space-x-3">
                    <a href="{{ route('admin.templates.index') }}" class="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition">Cancel</a>
                    <button type="submit" class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition">Update Template</button>
                </div>
            </form>
        </div>
    </div>
</div>
@endsection
