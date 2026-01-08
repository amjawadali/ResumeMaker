<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">

        <title>{{ config('app.name', 'ResumeMaker') }}</title>

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">

        <style>
            :root {
                --bg-dark: #050505;
                --bg-card: rgba(255, 255, 255, 0.03);
                --bg-card-hover: rgba(255, 255, 255, 0.06);
                --border-color: rgba(255, 255, 255, 0.08);
                --primary-gradient: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
                --text-main: #ffffff;
                --text-muted: #9ca3af;
                --font-heading: 'Outfit', sans-serif;
                --font-body: 'Inter', sans-serif;
            }

            * {
                box-sizing: border-box;
            }

            body {
                background-color: var(--bg-dark);
                background-image: 
                    radial-gradient(circle at 15% 50%, rgba(99, 102, 241, 0.08) 0%, transparent 25%),
                    radial-gradient(circle at 85% 30%, rgba(168, 85, 247, 0.08) 0%, transparent 25%);
                color: var(--text-main);
                font-family: var(--font-body);
                line-height: 1.6;
                min-height: 100vh;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                padding: 1.5rem;
                margin: 0;
            }

            .logo-link {
                margin-bottom: 2rem;
                display: block;
                text-decoration: none;
            }

            .bg-logo {
                font-family: var(--font-heading);
                font-weight: 700;
                font-size: 2rem;
                background: var(--primary-gradient);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                letter-spacing: -0.02em;
            }

            .auth-card {
                width: 100%;
                max-width: 450px;
                background: var(--bg-card);
                border: 1px solid var(--border-color);
                border-radius: 1.5rem;
                padding: 2.5rem;
                backdrop-filter: blur(12px);
                box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
                animation: fadeUp 0.5s ease-out;
            }

            /* Form Elements - Global Overrides */
            label {
                display: block;
                font-weight: 500;
                font-size: 0.9rem;
                margin-bottom: 0.5rem;
                color: var(--text-muted);
            }

            input[type="text"],
            input[type="email"],
            input[type="password"] {
                width: 100%;
                background: rgba(0, 0, 0, 0.2);
                border: 1px solid var(--border-color);
                color: white;
                padding: 0.75rem 1rem;
                border-radius: 0.75rem;
                font-size: 0.95rem;
                font-family: var(--font-body);
                transition: all 0.3s ease;
                outline: none;
            }

            input[type="text"]:focus,
            input[type="email"]:focus,
            input[type="password"]:focus {
                border-color: #6366f1;
                box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
                background: rgba(0, 0, 0, 0.4);
            }

            button[type="submit"] {
                width: 100%;
                background: var(--primary-gradient);
                color: white;
                border: none;
                padding: 0.875rem;
                border-radius: 0.75rem;
                font-weight: 600;
                font-family: var(--font-heading);
                cursor: pointer;
                transition: all 0.3s ease;
                margin-top: 1rem;
                font-size: 1rem;
                letter-spacing: 0.02em;
            }

            button[type="submit"]:hover {
                transform: translateY(-1px);
                box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
            }

            .social-btn {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 0.75rem;
                width: 100%;
                background: transparent;
                border: 1px solid var(--border-color);
                color: var(--text-main);
                padding: 0.75rem;
                border-radius: 0.75rem;
                font-size: 0.95rem;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.3s ease;
                text-decoration: none;
                margin-bottom: 0.75rem;
            }

            .social-btn:hover {
                background: var(--bg-card-hover);
                border-color: rgba(255, 255, 255, 0.2);
            }

            .divider {
                display: flex;
                align-items: center;
                gap: 1rem;
                margin: 1.5rem 0;
                color: var(--text-muted);
                font-size: 0.85rem;
            }

            .divider::before,
            .divider::after {
                content: "";
                flex: 1;
                height: 1px;
                background: var(--border-color);
            }

            .auth-links {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-top: 1.5rem;
                font-size: 0.9rem;
            }

            .auth-link {
                color: var(--text-muted);
                text-decoration: none;
                transition: color 0.2s;
            }

            .auth-link:hover {
                color: #6366f1;
            }

            @keyframes fadeUp {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
            }
        </style>

        <!-- Scripts -->
        @vite(['resources/css/app.css', 'resources/js/app.js'])
    </head>
    <body class="font-sans antialiased">
        <a href="/" class="logo-link">
            <span class="bg-logo">ResumeMaker</span>
        </a>

        <div class="auth-card">
            {{ $slot }}
        </div>
    </body>
</html>
