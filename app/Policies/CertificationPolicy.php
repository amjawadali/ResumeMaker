<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Certification;
use Illuminate\Auth\Access\Response;

class CertificationPolicy
{
    public function update(User $user, Certification $certification): bool
    {
        return $user->id === $certification->user_id;
    }

    public function delete(User $user, Certification $certification): bool
    {
        return $user->id === $certification->user_id;
    }
}
