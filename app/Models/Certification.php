<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Certification extends Model
{
    use HasFactory;

    protected $table = 'certifications';

    protected $fillable = [
        'user_id',
        'name',
        'issuing_organization',
        'issue_date',
        'expiry_date',
        'credential_id',
        'credential_url',
        'description',
        'order',
    ];

    protected $casts = [
        'issue_date' => 'date',
        'expiry_date' => 'date',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
