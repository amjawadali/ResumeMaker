<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;
use App\Models\Template;
use Spatie\Activitylog\Models\Activity;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return array_merge(parent::share($request), [
            'auth' => [
                'user' => $request->user() ? array_merge($request->user()->toArray(), [
                    'roles' => $request->user()->getRoleNames(),
                    'permissions' => $request->user()->getAllPermissions()->pluck('name'),
                ]) : null,
            ],
            'flash' => [
                'success' => $request->session()->get('success'),
                'error' => $request->session()->get('error'),
            ],
            'notifications' => function () use ($request) {
                if (!$request->user() || !$request->user()->hasAnyRole(['admin', 'super-admin'])) {
                    return null;
                }

                $pendingTemplates = Template::where('status', 'pending')->latest()->take(5)->get();
                $deletionRequests = Template::where('is_deletion_requested', true)->latest()->take(5)->get();
                $latestActivity = Activity::with('causer')->latest()->take(5)->get()->map(function($a) {
                    return [
                        'id' => $a->id,
                        'description' => $a->description,
                        'time' => $a->created_at->diffForHumans(),
                        'causer' => $a->causer ? $a->causer->name : 'System'
                    ];
                });

                return [
                    'pending_templates_count' => Template::where('status', 'pending')->count(),
                    'deletion_requests_count' => Template::where('is_deletion_requested', true)->count(),
                    'items' => [
                        'approvals' => $pendingTemplates,
                        'deletions' => $deletionRequests,
                        'activity' => $latestActivity
                    ],
                    'total_alerts' => Template::where('status', 'pending')->count() + Template::where('is_deletion_requested', true)->count()
                ];
            },
            'ziggy' => function () use ($request) {
                return array_merge((new \Tighten\Ziggy\Ziggy)->toArray(), [
                    'location' => $request->url(),
                ]);
            },
        ]);
    }
}
