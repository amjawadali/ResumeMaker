<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Template;
use Illuminate\Auth\Access\Response;

class TemplatePolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return $user->hasRole('admin') || $user->hasPermissionTo('manage_templates');
    }

    public function update(User $user, Template $template): bool
    {
        return $user->hasRole('admin') || $user->hasPermissionTo('manage_templates');
    }

    public function delete(User $user, Template $template): bool
    {
        return $user->hasRole('admin') || $user->hasPermissionTo('manage_templates');
    }
}
