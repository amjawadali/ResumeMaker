<?php

namespace App\Http\Controllers;

use App\Models\Resume;
use App\Services\LatexEngine\LatexConverter;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ResumeSyncController extends Controller
{
    protected $latexConverter;

    public function __construct(LatexConverter $latexConverter)
    {
        $this->latexConverter = $latexConverter;
    }

    /**
     * Sync the visual canvas state with the semantic LaTeX source.
     */
    public function sync(Request $request, Resume $resume)
    {
        // Authorization
        if ($resume->user_id !== Auth::id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'canvas_state' => 'required|array',
            'title' => 'sometimes|string|max:255',
        ]);

        // 1. Update Canvas State (Visals/Overrides)
        \Illuminate\Support\Facades\Log::info('Syncing Resume ' . $resume->id, ['data' => $validated]);
        
        $resume->canvas_state = $validated['canvas_state'];
        
        if (isset($validated['title'])) {
            $resume->title = $validated['title'];
        }

        // 2. Regenerate LaTeX Source (Semantic Source of Truth)
        try {
            $newLatex = $this->latexConverter->jsonToLatex($validated['canvas_state']);
            $resume->latex_source = $newLatex;
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('LaTeX Generation failed during sync: ' . $e->getMessage());
        }

        $resume->save();

        // 3. Auto-save Version (Every 5 minutes)
        $lastVersion = $resume->versions()
            ->where('name', 'Auto-save')
            ->latest()
            ->first();

        if (!$lastVersion || $lastVersion->created_at->diffInMinutes(now()) >= 5) {
            $snapshotPath = null;
            if ($request->has('snapshot') && !empty($request->snapshot)) {
                try {
                    $imageData = $request->snapshot;
                    if (strpos($imageData, ',') !== false) {
                        $parts = explode(',', $imageData);
                        $header = $parts[0];
                        $data = $parts[1];
                        
                        $extension = 'png';
                        if (preg_match('/image\/(\w+)/', $header, $matches)) {
                            $extension = $matches[1];
                        }
                        
                        $decodedData = base64_decode($data);
                        if ($decodedData) {
                            if (!\Illuminate\Support\Facades\Storage::disk('public')->exists('snapshots')) {
                                \Illuminate\Support\Facades\Storage::disk('public')->makeDirectory('snapshots');
                            }
                            
                            $filename = 'snapshots/' . \Illuminate\Support\Str::random(40) . '.' . $extension;
                            \Illuminate\Support\Facades\Storage::disk('public')->put($filename, $decodedData);
                            $snapshotPath = $filename;
                        }
                    }
                } catch (\Exception $e) {
                    // Silently fail snapshot save for auto-save
                }
            }
            
            $resume->versions()->create([
                'canvas_state' => $validated['canvas_state'],
                'name' => 'Auto-save',
                'snapshot_path' => $snapshotPath,
            ]);
        }

        return response()->json([
            'message' => 'Synced successfully',
            'latex_source' => $resume->latex_source,
            'canvas_state' => $resume->canvas_state,
        ]);
    }

    /**
     * Pull the latest semantics from LaTeX to update the JSON state.
     * Useful when switching templates or external LaTeX edits (future).
     */
    public function pullFromLatex(Resume $resume)
    {
        if ($resume->user_id !== Auth::id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        if (!$resume->latex_source) {
            return response()->json(['error' => 'No LaTeX source found'], 404);
        }

        $jsonState = $this->latexConverter->latexToJson($resume->latex_source);
        $resume->canvas_state = $jsonState;
        $resume->save();

        return response()->json([
            'message' => 'State pulled from LaTeX',
            'canvas_state' => $resume->canvas_state,
        ]);
    }
}
