<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
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
                margin: 0;
                padding: 0;
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
                overflow-x: hidden;
                min-height: 100vh;
            }

            /* Utilities */
            .container {
                max-width: 1280px;
                margin: 0 auto;
                padding: 0 2rem;
            }
            
            a {
                text-decoration: none;
                color: inherit;
                transition: all 0.3s ease;
            }

            /* Header */
            header {
                padding: 1.5rem 0;
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                z-index: 50;
                background: rgba(5, 5, 5, 0.6);
                backdrop-filter: blur(12px);
                border-bottom: 1px solid var(--border-color);
            }

            .nav-wrapper {
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .logo {
                font-family: var(--font-heading);
                font-weight: 700;
                font-size: 1.5rem;
                background: var(--primary-gradient);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                letter-spacing: -0.02em;
            }

            .nav-links {
                display: flex;
                gap: 2rem;
                align-items: center;
            }

            .nav-link {
                color: var(--text-muted);
                font-weight: 500;
                font-size: 0.95rem;
            }

            .nav-link:hover {
                color: var(--text-main);
            }

            .btn {
                padding: 0.6rem 1.25rem;
                border-radius: 9999px;
                font-weight: 500;
                font-size: 0.95rem;
                cursor: pointer;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                display: inline-flex;
                align-items: center;
                gap: 0.5rem;
            }

            .btn-primary {
                background: var(--primary-gradient);
                color: white;
                border: 1px solid rgba(255, 255, 255, 0.1);
                box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
            }

            .btn-primary:hover {
                box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
                transform: translateY(-1px);
            }

            .btn-ghost {
                background: transparent;
                color: var(--text-main);
                border: 1px solid var(--border-color);
            }

            .btn-ghost:hover {
                background: var(--bg-card-hover);
                border-color: rgba(255, 255, 255, 0.2);
            }

            /* Hero Section */
            .hero {
                padding: 10rem 0 6rem;
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 4rem;
                align-items: center;
                position: relative;
            }

            .hero-content {
                max-width: 600px;
                animation: fadeUp 0.8s ease-out;
            }

            .badge {
                display: inline-block;
                padding: 0.35rem 1rem;
                background: rgba(99, 102, 241, 0.1);
                border: 1px solid rgba(99, 102, 241, 0.2);
                color: #818cf8;
                border-radius: 9999px;
                font-size: 0.85rem;
                font-weight: 500;
                margin-bottom: 1.5rem;
                font-family: var(--font-heading);
            }

            .hero-title {
                font-family: var(--font-heading);
                font-size: 4rem;
                line-height: 1.1;
                font-weight: 700;
                margin-bottom: 1.5rem;
                letter-spacing: -0.02em;
            }

            .hero-title span {
                background: var(--primary-gradient);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
            }

            .hero-text {
                font-size: 1.125rem;
                color: var(--text-muted);
                margin-bottom: 2.5rem;
                max-width: 500px;
            }

            .hero-image-wrapper {
                position: relative;
                animation: fadeLeft 1s ease-out;
            }

            .hero-image {
                width: 100%;
                border-radius: 12px;
                box-shadow: 
                    0 25px 50px -12px rgba(0, 0, 0, 0.5),
                    0 0 0 1px rgba(255, 255, 255, 0.1);
                transform: perspective(1000px) rotateY(-5deg) rotateX(2deg);
                transition: transform 0.5s ease;
            }

            .hero-image:hover {
                transform: perspective(1000px) rotateY(0) rotateX(0);
            }

            .glow-effect {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 120%;
                height: 120%;
                background: radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%);
                z-index: -1;
                pointer-events: none;
            }

            /* Features Grid */
            .features {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                gap: 2rem;
                padding-bottom: 6rem;
            }

            .feature-card {
                background: var(--bg-card);
                border: 1px solid var(--border-color);
                padding: 2rem;
                border-radius: 16px;
                transition: all 0.3s ease;
                display: flex;
                flex-direction: column;
                gap: 1rem;
            }

            .feature-card:hover {
                transform: translateY(-5px);
                background: var(--bg-card-hover);
                border-color: rgba(99, 102, 241, 0.3);
            }

            .feature-icon {
                width: 48px;
                height: 48px;
                background: rgba(255, 255, 255, 0.05);
                border-radius: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: #a855f7;
                font-size: 1.5rem;
            }

            .feature-title {
                font-family: var(--font-heading);
                font-weight: 600;
                font-size: 1.25rem;
                color: var(--text-main);
            }

            .feature-desc {
                color: var(--text-muted);
                font-size: 0.95rem;
            }

            /* Animations */
            @keyframes fadeUp {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
            }
            @keyframes fadeLeft {
                from { opacity: 0; transform: translateX(20px); }
                to { opacity: 1; transform: translateX(0); }
            }

            /* Mobile Responsive */
            @media (max-width: 968px) {
                .hero {
                    grid-template-columns: 1fr;
                    text-align: center;
                    gap: 3rem;
                    padding-top: 8rem;
                }
                
                .hero-content {
                    margin: 0 auto;
                }

                .hero-text {
                    margin-left: auto;
                    margin-right: auto;
                }

                .hero-image {
                    transform: none;
                }

                .hero-title {
                    font-size: 3rem;
                }
            }
        </style>
    </head>
    <body class="antialiased">
        <header>
            <div class="container nav-wrapper">
                <a href="/" class="logo">
                    ResumeMaker
                </a>
                
                <nav class="nav-links">
                    @if (Route::has('login'))
                        @auth
                            <a href="{{ url('/dashboard') }}" class="nav-link">Dashboard</a>
                        @else
                            <a href="{{ route('login') }}" class="nav-link">Log in</a>
                            
                            @if (Route::has('register'))
                                <a href="{{ route('register') }}" class="btn btn-primary">
                                    Get Started
                                </a>
                            @endif
                        @endauth
                    @endif
                </nav>
            </div>
        </header>

        <main class="container">
            <section class="hero">
                <div class="hero-content">
                    <span class="badge">New: AI-Powered Writing</span>
                    <h1 class="hero-title">
                        Build your professional <span>resume</span> in minutes.
                    </h1>
                    <p class="hero-text">
                        Create a polished, recruiter-ready resume with our modern templates and intelligent tools. Stand out from the crowd and land your dream job.
                    </p>
                    <div style="display: flex; gap: 1rem; flex-wrap: wrap; @media(max-width:968px){justify-content:center;}">
                        @auth
                             <a href="{{ url('/dashboard') }}" class="btn btn-primary">
                                Go to Dashboard
                            </a>
                        @else
                            <a href="{{ route('register') }}" class="btn btn-primary">
                                Create My Resume
                            </a>
                            <a href="{{ route('login') }}" class="btn btn-ghost">
                                Log In
                            </a>
                        @endauth
                    </div>
                </div>

                <div class="hero-image-wrapper">
                    <div class="glow-effect"></div>
                    <img src="{{ asset('images/hero.png') }}" alt="Resume Maker Interface" class="hero-image">
                </div>
            </section>

            <section class="features">
                <div class="feature-card">
                    <div class="feature-icon">✨</div>
                    <h3 class="feature-title">Modern Templates</h3>
                    <p class="feature-desc">Choose from dozens of professionally designed templates that follow the latest hiring trends.</p>
                </div>
                <div class="feature-card">
                    <div class="feature-icon">🚀</div>
                    <h3 class="feature-title">AI Assistance</h3>
                    <p class="feature-desc">Leverage the power of AI to write compelling summaries and experience points.</p>
                </div>
                <div class="feature-card">
                    <div class="feature-icon">📄</div>
                    <h3 class="feature-title">Instant Export</h3>
                    <p class="feature-desc">Download your resume in high-quality PDF format, ready for application submission.</p>
                </div>
            </section>
        </main>
    </body>
</html>
