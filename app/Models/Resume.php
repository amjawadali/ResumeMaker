<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class Resume extends Model
{
    use HasFactory, LogsActivity;

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['title', 'template_id'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }

    protected $table = 'resumes';

    protected $fillable = [
        'user_id',
        'template_id',
        'template_version_id',
        'title',
        'sections_visibility',
        'custom_styling',
        'sections_order',
        'content_override',
        'primary_color', 'font_family', 'font_size', 'sidebar_width', 'font_weight', 'custom_sections', 'canvas_state', 'latex_source', 'fill_score'
    ];

    public function templateVersion(): BelongsTo
    {
        return $this->belongsTo(TemplateVersion::class, 'template_version_id');
    }

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

    public function versions()
    {
        return $this->hasMany(ResumeVersion::class);
    }
}
