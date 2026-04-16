<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserDetail extends Model
{
    use HasFactory;

    protected $table = 'user_details';

    protected $fillable = [
        'user_id',
        'full_name',
        'email',
        'phone',
        'address',
        'city',
        'state',
        'zip_code',
        'country',
        'website',
        'linkedin',
        'github',
        'twitter',
        'profile_photo',
        'professional_summary',
        'social_links',
    ];

    protected $appends = [
        'profile_photo_url',
    ];

    protected $casts = [
        'social_links' => 'array',
    ];

    public function getProfilePhotoUrlAttribute(): ?string
    {
        if (!$this->profile_photo) {
            return null;
        }

        // If it's already a full URL, return it
        if (filter_var($this->profile_photo, FILTER_VALIDATE_URL)) {
            return $this->profile_photo;
        }

        return asset('storage/' . $this->profile_photo);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
