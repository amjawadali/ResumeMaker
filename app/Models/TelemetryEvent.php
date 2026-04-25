<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TelemetryEvent extends Model
{
    protected $fillable = [
        'event_type',
        'model_type',
        'model_id',
        'user_id',
        'session_id',
        'metadata',
    ];

    protected $casts = [
        'metadata' => 'array',
    ];

    /**
     * Get the user that caused the event.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the related model (polymorphic-like behavior simplified for this use case).
     */
    public function getRelatedModel()
    {
        if ($this->model_type === 'Template') {
            return Template::find($this->model_id);
        }
        if ($this->model_type === 'Resume') {
            return Resume::find($this->model_id);
        }
        return null;
    }
}
