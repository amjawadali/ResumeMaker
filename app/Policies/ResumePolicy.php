<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Resume;
use Illuminate\Auth\Access\Response;

class ResumePolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Resume $resume): bool
    {
        return $user->id === $resume->user_id || $user->hasRole('admin');
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('create_resume');
    }

    public function update(User $user, Resume $resume): bool
    {
        return $user->id === $resume->user_id;
    }

    public function delete(User $user, Resume $resume): bool
    {
        return $user->id === $resume->user_id;
    }

    public function download(User $user, Resume $resume): bool
    {
        return ($user->id === $resume->user_id && $user->hasPermissionTo('download_resume')) || $user->hasRole('admin');
    }
}
