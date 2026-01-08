<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Experience;
use Illuminate\Auth\Access\Response;

class ExperiencePolicy
{
    public function update(User $user, Experience $experience): bool
    {
        return $user->id === $experience->user_id;
    }

    public function delete(User $user, Experience $experience): bool
    {
        return $user->id === $experience->user_id;
    }
}
