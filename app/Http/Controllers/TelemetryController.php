<?php

namespace App\Http\Controllers;

use App\Models\TelemetryEvent;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class TelemetryController extends Controller
{
    /**
     * Store a new telemetry event.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'event_type' => 'required|string|max:50',
            'model_type' => 'nullable|string|max:50',
            'model_id' => 'nullable|integer',
            'metadata' => 'nullable|array',
            'session_id' => 'nullable|string|max:255',
        ]);

        $event = TelemetryEvent::create([
            'event_type' => $validated['event_type'],
            'model_type' => $validated['model_type'] ?? null,
            'model_id' => $validated['model_id'] ?? null,
            'user_id' => Auth::id(),
            'session_id' => $validated['session_id'] ?? $request->session()->getId(),
            'metadata' => $validated['metadata'] ?? [],
        ]);

        return response()->json([
            'status' => 'success',
            'event_id' => $event->id
        ], 201);
    }
}
