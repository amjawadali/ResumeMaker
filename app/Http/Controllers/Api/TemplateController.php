<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Template;
use App\Http\Resources\TemplateResource;
use Illuminate\Http\Request;

class TemplateController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $templates = Template::where('is_active', true)->get();
        return TemplateResource::collection($templates);
    }

    /**
     * Display the specified resource.
     */
    public function show(Template $template)
    {
        if (!$template->is_active) {
            abort(404);
        }
        return new TemplateResource($template);
    }
}
