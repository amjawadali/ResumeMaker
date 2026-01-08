<x-guest-layout>
    <!-- Header -->
    <div class="mb-8 text-center">
        <h2 class="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-2">
            Security Check
        </h2>
        <p class="text-slate-400 text-sm">
            {{ __('This is a secure area of the application. Please confirm your password before continuing.') }}
        </p>
    </div>

    <form method="POST" action="{{ route('password.confirm') }}">
        @csrf

        <!-- Password -->
        <div>
            <x-input-label for="password" :value="__('Password')" />

            <x-text-input id="password" class="block mt-1 w-full"
                            type="password"
                            placeholder="••••••••"
                            name="password"
                            required autocomplete="current-password" />

            <x-input-error :messages="$errors->get('password')" class="mt-2" style="color: #ef4444; font-size: 0.875rem;" />
        </div>

        <div class="flex justify-end mt-6">
            <x-primary-button class="w-full justify-center">
                {{ __('Confirm') }}
            </x-primary-button>
        </div>
    </form>
</x-guest-layout>
