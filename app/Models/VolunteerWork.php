<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VolunteerWork extends Model
{
    protected $fillable = [
        'user_id', 'organization', 'role', 'start_date', 'end_date', 'currently_volunteering', 'description', 'order'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
