<x-guest-layout>
    <div style="text-align: center; margin-bottom: 2rem;">
        <h2 style="font-family: var(--font-heading); font-size: 1.75rem; font-weight: 700; background: var(--primary-gradient); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Welcome Back</h2>
        <p style="color: var(--text-muted); font-size: 0.95rem;">Please sign in to your account</p>
    </div>

    <!-- Social Login -->
    <div>
        <a href="#" class="social-btn">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M23.7663 12.2764C23.7663 11.4607 23.6999 10.6406 23.5588 9.83807H12.2402V14.4591H18.7221C18.4528 15.9494 17.5885 17.2678 16.3233 18.1056V21.1039H20.1903C22.4612 19.0139 23.7663 15.9273 23.7663 12.2764Z" fill="#4285F4"/>
                <path d="M12.2405 24.0008C15.4769 24.0008 18.2063 22.9382 20.1948 21.1039L16.3278 18.1055C15.252 18.8175 13.863 19.252 12.2448 19.252C9.11419 19.252 6.45976 17.1399 5.50735 14.3003H1.51691V17.3912C3.55404 21.4434 7.7032 24.0008 12.2405 24.0008Z" fill="#34A853"/>
                <path d="M5.50277 14.3003C5.00266 12.8099 5.00266 11.1961 5.50277 9.70575V6.61481H1.51691C-0.185255 10.0056 -0.185255 13.9945 1.51691 17.3912L5.50277 14.3003Z" fill="#FBBC05"/>
                <path d="M12.2405 4.74966C13.9512 4.71284 15.6047 5.36697 16.8437 6.54867L20.27 3.12219C18.1009 1.0855 15.2211 -0.034466 12.2405 0.000808666C7.7032 0.000808666 3.55404 2.55822 1.51691 6.61481L5.50277 9.70575C6.45094 6.86173 9.10989 4.74966 12.2405 4.74966Z" fill="#EA4335"/>
            </svg>
            Continue with Google
        </a>
        <a href="#" class="social-btn">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22 12.06C22 6.53 17.5 2 12 2C6.5 2 2 6.53 2 12.06C2 17.06 5.66 21.21 10.44 21.96V14.96H7.9V12.06H10.44V9.85C10.44 7.34 11.93 5.96 14.22 5.96C15.31 5.96 16.45 6.15 16.45 6.15V8.62H15.19C13.95 8.62 13.56 9.39 13.56 10.18V12.06H16.34L15.89 14.96H13.56V21.96C18.34 21.21 22 17.06 22 12.06Z" fill="#1877F2"/>
            </svg>
            Continue with Facebook
        </a>
    </div>

    <div class="divider">
        <span>Or continue with email</span>
    </div>

    <!-- Session Status -->
    <x-auth-session-status class="mb-4" :status="session('status')" />

    <form method="POST" action="{{ route('login') }}">
        @csrf

        <!-- Email Address -->
        <div>
            <x-input-label for="email" :value="__('Email')" />
            <x-text-input id="email" type="email" name="email" :value="old('email')" required autofocus autocomplete="username" placeholder="john@example.com" />
            <x-input-error :messages="$errors->get('email')" class="mt-2" style="color: #f87171; font-size: 0.85rem;" />
        </div>

        <!-- Password -->
        <div class="mt-4" style="margin-top: 1rem;">
            <x-input-label for="password" :value="__('Password')" />

            <x-text-input id="password"
                            type="password"
                            name="password"
                            required autocomplete="current-password" placeholder="••••••••" />

            <x-input-error :messages="$errors->get('password')" class="mt-2" style="color: #f87171; font-size: 0.85rem;" />
        </div>

        <!-- Remember Me -->
        <div class="block mt-4" style="margin-top: 1rem; display: flex; justify-content: space-between; align-items: center;">
            <label for="remember_me" class="inline-flex items-center" style="display: flex; align-items: center; gap: 0.5rem; margin: 0; cursor: pointer;">
                <input id="remember_me" type="checkbox" name="remember" style="width: auto; margin: 0; width: 1rem; height: 1rem;">
                <span style="font-size: 0.9rem; color: var(--text-muted);">{{ __('Remember me') }}</span>
            </label>
            
            @if (Route::has('password.request'))
                <a class="auth-link" href="{{ route('password.request') }}" style="font-size: 0.9rem;">
                    {{ __('Forgot password?') }}
                </a>
            @endif
        </div>

        <div style="margin-top: 1.5rem;">
            <x-primary-button>
                {{ __('Log in') }}
            </x-primary-button>
        </div>

        <div style="text-align: center; margin-top: 1.5rem; font-size: 0.9rem; color: var(--text-muted);">
            Don't have an account? 
            <a href="{{ route('register') }}" class="auth-link" style="color: #a855f7; font-weight: 500;">Sign up</a>
        </div>
    </form>
</x-guest-layout>
