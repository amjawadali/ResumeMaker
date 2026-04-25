<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class Template extends Model
{
    use HasFactory, SoftDeletes, LogsActivity;

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['name', 'status', 'is_active', 'is_deletion_requested'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }

    protected $table = 'templates';

    protected $fillable = [
        'user_id',
        'name',
        'slug',
        'description',
        'preview_image',
        'category',
        'blade_view',
        'canvas_data',
        'type',
        'is_public',
        'status',
        'is_premium',
        'use_count',
        'fill_score_avg',
        'is_active',
        'is_deletion_requested',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'is_public' => 'boolean',
        'is_premium' => 'boolean',
        'canvas_data' => 'array',
        'is_deletion_requested' => 'boolean',
    ];

    public function user(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function resumes(): HasMany
    {
        return $this->hasMany(Resume::class);
    }

    public function versions(): HasMany
    {
        return $this->hasMany(TemplateVersion::class);
    }

    public function ratings(): HasMany
    {
        return $this->hasMany(TemplateRating::class);
    }

    public function tags(): HasMany
    {
        return $this->hasMany(TemplateTag::class);
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    public function scopePublicApproved(Builder $query): Builder
    {
        return $query->where('is_active', true)
            ->where('is_public', true)
            ->where('status', 'approved');
    }

    public function scopeSearch(Builder $query, ?string $term): Builder
    {
        if (!$term) return $query;

        return $query->where(function ($q) use ($term) {
            $q->where('name', 'like', "%{$term}%")
                ->orWhere('description', 'like', "%{$term}%")
                ->orWhere('category', 'like', "%{$term}%");
        });
    }

    public function scopeInCategory(Builder $query, ?string $category): Builder
    {
        if (!$category || $category === 'All') return $query;
        return $query->where('category', $category);
    }

    public function scopeSortBy(Builder $query, ?string $sort): Builder
    {
        return match ($sort) {
            'newest' => $query->latest(),
            'popular' => $query->orderBy('use_count', 'desc'),
            'trending' => $query->orderByRaw('(use_count / EXTRACT(DAY FROM (now() - created_at) + interval \'1 day\')) DESC'),
            default => $query->orderBy('use_count', 'desc'),
        };
    }

    public function incrementUseCount(): void
    {
        $this->increment('use_count');
    }
}
