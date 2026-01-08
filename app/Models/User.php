<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasRoles;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    // Relationships
    public function userDetail(): HasOne
    {
        return $this->hasOne(UserDetail::class);
    }

    public function educations(): HasMany
    {
        return $this->hasMany(Education::class)->orderBy('order');
    }

    public function experiences(): HasMany
    {
        return $this->hasMany(Experience::class)->orderBy('order');
    }

    public function skills(): HasMany
    {
        return $this->hasMany(Skill::class)->orderBy('order');
    }

    public function certifications(): HasMany
    {
        return $this->hasMany(Certification::class)->orderBy('order');
    }

    public function languages(): HasMany
    {
        return $this->hasMany(Language::class)->orderBy('order');
    }

    public function resumes(): HasMany
    {
        return $this->hasMany(Resume::class);
    }
}
