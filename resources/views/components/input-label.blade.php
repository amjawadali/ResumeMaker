@props(['value'])

<label {{ $attributes->merge(['class' => 'block font-bold text-xs text-slate-300 uppercase tracking-wider mb-2']) }}>
    {{ $value ?? $slot }}
</label>
