<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Publication extends Model
{
    protected $fillable = [
        'user_id', 'title', 'publisher', 'date', 'url', 'description', 'order'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
