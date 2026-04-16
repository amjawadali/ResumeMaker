<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Project extends Model
{
    protected $fillable = [
        'user_id', 'title', 'url', 'description', 'technologies', 'order'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
