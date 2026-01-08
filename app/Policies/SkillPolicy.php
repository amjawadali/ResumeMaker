<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Skill;
use Illuminate\Auth\Access\Response;

class SkillPolicy
{
    public function update(User $user, Skill $skill): bool
    {
        return $user->id === $skill->user_id;
    }

    public function delete(User $user, Skill $skill): bool
    {
        return $user->id === $skill->user_id;
    }
}
