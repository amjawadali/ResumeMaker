<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ResumeResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'template' => new TemplateResource($this->whenLoaded('template')),
            'sections_visibility' => $this->sections_visibility ?? [],
            'custom_styling' => $this->custom_styling ?? [],
            'content_override' => $this->content_override ?? [],
            'sections_order' => $this->sections_order ?? [],
            'updated_at' => $this->updated_at,
            'created_at' => $this->created_at,
        ];
    }
}
