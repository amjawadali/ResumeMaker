<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ProfileController extends Controller
{
    /**
     * Display the specified resource.
     */
    public function show(Request $request)
    {
        $user = $request->user()->load([
            'userDetail',
            'educations',
            'experiences',
            'skills',
            'projects', // Assuming this relation exists or needs to be added
            // Add other relations as needed
        ]);
        
        return response()->json([
            'data' => [
                'user' => $user,
                'details' => $user->userDetail,
                'education' => $user->educations,
                'experience' => $user->experiences,
                'skills' => $user->skills,
                // 'projects' => $user->projects,
            ]
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request)
    {
        // This endpoint will handle bulk updates or specific section updates
        // For simplicity in MVP, we might accept a full payload or nested keys
        
        $user = $request->user();
        
        DB::transaction(function () use ($user, $request) {
            if ($request->has('user')) {
                $user->update($request->input('user'));
            }
            
            if ($request->has('details')) {
                $user->userDetail()->updateOrCreate(
                    ['user_id' => $user->id],
                    $request->input('details')
                );
            }
            
            // For lists (Education, Experience), it's trickier to sync via simple JSON
            // We might want separate endpoints for those, or a sync strategy here.
            // For now, let's assume valid IDs being passed means update, null ID means create.
            
            // Since this is "Profile" implementation, let's focus on the single objects first
            // and maybe delegate list management to specific endpoints if complexity grows.
        });

        return $this->show($request);
    }
}
