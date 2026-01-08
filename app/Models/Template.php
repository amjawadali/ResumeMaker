<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Builder;

class Template extends Model
{
    use HasFactory;

    protected $table = 'templates';

    protected $fillable = [
        'name',
        'slug',
        'description',
        'preview_image',
        'category',
        'blade_view',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function resumes(): HasMany
    {
        return $this->hasMany(Resume::class);
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }
}
