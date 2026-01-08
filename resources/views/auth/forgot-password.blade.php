<x-guest-layout>
    <!-- Header -->
    <div class="mb-8 text-center">
        <h2 class="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-2">
            Reset Password
        </h2>
        <p class="text-slate-400 text-sm">
            {{ __('Forgot your password? No problem. Just let us know your email address and we will email you a password reset link.') }}
        </p>
    </div>

    <!-- Session Status -->
    <x-auth-session-status class="mb-4" :status="session('status')" />

    <form method="POST" action="{{ route('password.email') }}">
        @csrf

        <!-- Email Address -->
        <div>
            <x-input-label for="email" :value="__('Email')" />
            <x-text-input id="email" class="block mt-1 w-full" type="email" placeholder="john@example.com" name="email" :value="old('email')" required autofocus />
            <x-input-error :messages="$errors->get('email')" class="mt-2" style="color: #ef4444; font-size: 0.875rem;" />
        </div>

        <div class="flex items-center justify-end mt-6">
            <x-primary-button class="w-full justify-center">
                {{ __('Email Password Reset Link') }}
            </x-primary-button>
        </div>
        
        <div class="mt-6 text-center">
            <a href="{{ route('login') }}" class="text-sm text-slate-400 hover:text-white transition-colors">
                <span class="mr-2">←</span> Back to Login
            </a>
        </div>
    </form>
</x-guest-layout>
