<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Award extends Model
{
    protected $fillable = [
        'user_id', 'title', 'issuer', 'date', 'description', 'order'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
