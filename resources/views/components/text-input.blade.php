@props(['disabled' => false])

<input @disabled($disabled) {{ $attributes->merge(['class' => 'bg-white/5 border-white/10 focus:border-purple-500 focus:ring-purple-500 rounded-xl shadow-sm text-white placeholder-slate-500']) }}>
