<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ResumeVersion extends Model
{
    protected $fillable = ['resume_id', 'canvas_state', 'name', 'snapshot_path'];

    protected $casts = [
        'canvas_state' => 'array'
    ];

    public function resume()
    {
        return $this->belongsTo(Resume::class);
    }
}
