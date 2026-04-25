<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Template;
use Illuminate\Auth\Access\Response;

class TemplatePolicy
{
    public function viewAny(?User $user): bool
    {
        return true;
    }

    public function view(?User $user, Template $template): bool
    {
        // Public approved templates are viewable by anyone
        if ($template->is_active && $template->is_public && $template->status === 'approved') {
            return true;
        }

        // Otherwise, must be authenticated
        if (!$user) {
            return false;
        }

        // Admin or Owner can view private/pending templates
        return $user->hasRole('admin') || 
               $user->hasPermissionTo('manage_templates') || 
               $user->id === $template->user_id;
    }

    public function create(User $user): bool
    {
        // Any authenticated user can create/publish a template (subject to moderation)
        return true;
    }

    public function update(User $user, Template $template): bool
    {
        return $user->hasRole('admin') || 
               $user->hasPermissionTo('manage_templates') || 
               ($user->id === $template->user_id && !$template->is_deletion_requested);
    }

    public function delete(User $user, Template $template): bool
    {
        return $user->hasRole('admin') || 
               $user->hasPermissionTo('manage_templates') || 
               $user->id === $template->user_id;
    }
}
