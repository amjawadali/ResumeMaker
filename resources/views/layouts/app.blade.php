<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">

        <title>{{ config('app.name', 'Laravel') }}</title>

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&display=swap" rel="stylesheet">

        <!-- Scripts -->
        @vite(['resources/js/app.js'])
        <script src="https://cdn.tailwindcss.com"></script>
        <script src="https://unpkg.com/lucide@latest"></script>
        
        <style>
            [x-cloak] { display: none !important; }
            
            body {
                font-family: 'Plus Jakarta Sans', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif;
                overflow-x: hidden;
                scroll-behavior: smooth;
            }
            
            /* Custom Scrollbar */
            ::-webkit-scrollbar {
                width: 8px;
            }
            ::-webkit-scrollbar-track {
                background: #0f172a;
            }
            ::-webkit-scrollbar-thumb {
                background: #1e293b;
                border-radius: 10px;
            }
            ::-webkit-scrollbar-thumb:hover {
                background: #334155;
            }

            .glass-panel {
                background: rgba(255, 255, 255, 0.03);
                backdrop-filter: blur(12px);
                border: 1px solid rgba(255, 255, 255, 0.08);
            }

            .premium-gradient {
                background: linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%);
            }
            
            .text-glow {
                text-shadow: 0 0 15px rgba(168, 85, 247, 0.4);
            }
            .animate-shake {
                animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
            }
            @keyframes shake {
                10%, 90% { transform: translate3d(-1px, 0, 0); }
                20%, 80% { transform: translate3d(2px, 0, 0); }
                30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
                40%, 60% { transform: translate3d(4px, 0, 0); }
            }
        </style>
    </head>
    <body class="font-sans antialiased bg-[#0f172a] text-white">
        <div class="min-h-screen">
            @include('layouts.navigation')

            <!-- Page Heading -->
            @if(isset($header) || View::hasSection('header'))
                <!-- <header class="bg-[#0f172a] border-b border-white/10"> -->
                    <!-- <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8"> -->
                        @if(isset($header))
                            <!-- {{ $header }} -->
                        @else
                            <!-- @yield('header') -->
                        @endif
                    <!-- </div> -->
                <!-- </header> -->
            @endif

            <!-- Page Content -->
            <main>
                @if(isset($slot))
                    {{ $slot }}
                @else
                    @yield('content')
                @endif
            </main>
        </div>
        <script>
            document.addEventListener('DOMContentLoaded', () => {
                if (typeof lucide !== 'undefined') {
                    lucide.createIcons();
                }
            });
        </script>
        @stack('scripts')
    </body>
</html>
