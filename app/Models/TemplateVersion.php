<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class TemplateVersion extends Model
{
    use HasFactory;

    protected $table = 'template_versions';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'template_id',
        'version',
        'canvas_data',
        'changelog',
    ];

    protected $casts = [
        'canvas_data' => 'array',
    ];

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($model) {
            if (empty($model->id)) {
                $model->id = (string) Str::uuid();
            }
        });
    }

    public function template(): BelongsTo
    {
        return $this->belongsTo(Template::class);
    }

    public function isLatest(): bool
    {
        return $this->template->versions()->latest()->first()->id === $this->id;
    }
}
