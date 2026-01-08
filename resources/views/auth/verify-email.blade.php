<x-guest-layout>
    <!-- Header -->
    <div class="mb-8 text-center">
        <h2 class="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-2">
            Verify Your Email
        </h2>
        <p class="text-slate-400 text-sm leading-relaxed">
            {{ __('Thanks for signing up! Before getting started, could you verify your email address by clicking on the link we just emailed to you?') }}
        </p>
    </div>

    @if (session('status') == 'verification-link-sent')
        <div class="mb-6 font-medium text-sm text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 p-4 rounded-xl text-center">
            {{ __('A new verification link has been sent to the email address you provided during registration.') }}
        </div>
    @endif

    <div class="mt-6 flex flex-col gap-4">
        <form method="POST" action="{{ route('verification.send') }}">
            @csrf

            <x-primary-button class="w-full justify-center">
                {{ __('Resend Verification Email') }}
            </x-primary-button>
        </form>

        <form method="POST" action="{{ route('logout') }}">
            @csrf

            <button type="submit" class="w-full py-3 text-sm text-slate-400 hover:text-white transition-colors border border-transparent hover:border-white/10 rounded-xl">
                {{ __('Log Out') }}
            </button>
        </form>
    </div>
</x-guest-layout>
