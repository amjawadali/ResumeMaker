<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TemplateTag extends Model
{
    use HasFactory;

    protected $table = 'template_tags';

    protected $fillable = [
        'template_id',
        'name',
    ];

    public function template(): BelongsTo
    {
        return $this->belongsTo(Template::class);
    }
}
