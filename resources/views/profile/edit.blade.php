<x-app-layout>
    <x-slot name="header">
        <div class="flex items-center justify-between">
            <h2 class="font-black text-2xl text-white leading-tight">
                {{ __('Profile Settings') }}
            </h2>
            <span class="text-sm font-medium text-slate-400">Manage your account</span>
        </div>
    </x-slot>

    <div class="py-12">
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-8">
            
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <!-- Profile Information Card -->
                <div class="p-8 bg-white/5 backdrop-blur-lg sm:rounded-[2.5rem] border border-white/10 relative overflow-hidden group">
                    <div class="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                    <div class="relative">
                        <div class="flex items-center gap-4 mb-6">
                            <div class="p-3 bg-purple-500/20 rounded-xl">
                                <svg class="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                            </div>
                            <div>
                                <h3 class="text-lg font-bold text-white">Profile Information</h3>
                                <p class="text-sm text-slate-400">Update your account's profile information.</p>
                            </div>
                        </div>
                        @include('profile.partials.update-profile-information-form')
                    </div>
                </div>

                <!-- Update Password Card -->
                <div class="p-8 bg-white/5 backdrop-blur-lg sm:rounded-[2.5rem] border border-white/10 relative overflow-hidden group">
                    <div class="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                    <div class="relative">
                        <div class="flex items-center gap-4 mb-6">
                            <div class="p-3 bg-blue-500/20 rounded-xl">
                                <svg class="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                            </div>
                            <div>
                                <h3 class="text-lg font-bold text-white">Security</h3>
                                <p class="text-sm text-slate-400">Ensure your account is using a long, random password.</p>
                            </div>
                        </div>
                        @include('profile.partials.update-password-form')
                    </div>
                </div>
            </div>

            <!-- Delete Account Card -->
            <div class="p-8 bg-red-500/5 backdrop-blur-lg sm:rounded-[2.5rem] border border-red-500/10 relative overflow-hidden">
                <div class="relative">
                     <div class="flex items-center gap-4 mb-6">
                        <div class="p-3 bg-red-500/20 rounded-xl">
                            <svg class="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        </div>
                        <div>
                            <h3 class="text-lg font-bold text-white">Danger Zone</h3>
                            <p class="text-sm text-slate-400">Permanently delete your account.</p>
                        </div>
                    </div>
                    @include('profile.partials.delete-user-form')
                </div>
            </div>
        </div>
    </div>
</x-app-layout>
