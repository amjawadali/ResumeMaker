<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" class="dark">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">

        <title>{{ config('app.name', 'ResumeMaker') }}</title>

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">

        <!-- Scripts -->
        @vite(['resources/css/app.css', 'resources/js/app.jsx'])
    </head>
    <body class="font-sans antialiased bg-[#0f172a] text-slate-200">
        <div class="min-h-screen relative overflow-hidden">
            <!-- Background Orbs -->
            <div class="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
                <div class="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px]"></div>
                <div class="absolute top-[20%] -right-[5%] w-[30%] h-[30%] bg-blue-600/10 rounded-full blur-[100px]"></div>
            </div>

            <nav class="bg-[#0f172a]/80 backdrop-blur-xl border-b border-white/5 sticky top-0 z-50">
                <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div class="flex justify-between h-20">
                        <div class="flex items-center">
                            <!-- Logo -->
                            <div class="shrink-0 flex items-center">
                                <a href="{{ route('dashboard') }}" class="text-2xl font-black bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent tracking-tighter">
                                    ResumeMaker
                                </a>
                            </div>

                            <!-- Navigation Links -->
                            <div class="hidden space-x-8 sm:-my-px sm:ms-10 sm:flex">
                                <a href="{{ route('dashboard') }}" class="inline-flex items-center px-1 pt-1 border-b-2 {{ request()->routeIs('dashboard') ? 'border-purple-500 text-white' : 'border-transparent text-slate-400 hover:text-slate-300' }} text-sm font-semibold transition-all">
                                    Dashboard
                                </a>
                                <a href="{{ route('templates.index') }}" class="inline-flex items-center px-1 pt-1 border-b-2 {{ request()->routeIs('templates.*') ? 'border-purple-500 text-white' : 'border-transparent text-slate-400 hover:text-slate-300' }} text-sm font-semibold transition-all">
                                    Templates
                                </a>
                            </div>
                        </div>

                        <!-- Settings Dropdown -->
                        <div class="hidden sm:flex sm:items-center sm:ms-6 gap-4">
                            <a href="{{ route('profile.edit') }}" class="text-sm font-medium text-slate-400 hover:text-white transition-colors">
                                {{ Auth::user()->name }}
                            </a>
                            <form method="POST" action="{{ route('logout') }}">
                                @csrf
                                <button type="submit" class="p-2.5 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-xl border border-white/10 transition-all text-sm font-bold">
                                    Log Out
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </nav>

            <!-- Page Heading -->
            @isset($header)
                <header class="bg-white/5 border-b border-white/5 py-10">
                    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        {{ $header }}
                    </div>
                </header>
            @endisset

            <!-- Page Content -->
            <main>
                {{ $slot }}
            </main>
        </div>
    </body>
</html>
