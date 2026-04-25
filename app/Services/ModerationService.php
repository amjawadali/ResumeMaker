<?php

namespace App\Services;

use App\Models\Template;
use App\Models\User;
use Illuminate\Support\Facades\Notification;

class ModerationService
{
    /**
     * Approve a template.
     */
    public function approve(Template $template): void
    {
        $template->update([
            'status' => 'approved',
            'is_active' => true,
        ]);

        // In a real app, we would notify the creator here
        // $template->user->notify(new \App\Notifications\TemplateApproved($template));
    }

    /**
     * Reject a template.
     */
    public function reject(Template $template, string $reason): void
    {
        $template->update([
            'status' => 'rejected',
            'is_active' => false,
        ]);

        // In a real app, we would notify the creator here with the reason
        // $template->user->notify(new \App\Notifications\TemplateRejected($template, $reason));
    }

    /**
     * Get count of pending templates for admin dashboard.
     */
    public function pendingCount(): int
    {
        return Template::where('status', 'pending')->count();
    }
}
