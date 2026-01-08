<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Resume extends Model
{
    use HasFactory;

    protected $table = 'resumes';

    protected $fillable = [
        'user_id',
        'template_id',
        'title',
        'sections_visibility',
        // New JSON configs
        'custom_styling',
        'sections_order',
        'content_override',
        // Legacy/Direct columns if needed (can keep for backward compat or remove, but keeping ensures no breakage if code uses them)
        'primary_color', 'font_family', 'font_size', 'sidebar_width', 'font_weight', 'custom_sections', 'canvas_state'
    ];

    protected $casts = [
        'sections_visibility' => 'array',
        'custom_styling' => 'array',
        'sections_order' => 'array',
        'content_override' => 'array',
        'custom_sections' => 'array',
        'canvas_state' => 'array'
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function template(): BelongsTo
    {
        return $this->belongsTo(Template::class);
    }
}
