<?php

namespace Database\Seeders;

use App\Models\Template;
use Illuminate\Database\Seeder;

class TemplateSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $templates = [
            [
                'name' => 'Modern Professional',
                'slug' => 'modern',
                'description' => 'A clean and modern resume template with a contemporary design, perfect for tech and creative professionals.',
                'category' => 'modern',
                'blade_view' => 'templates.modern',
                'is_active' => true,
            ],
            [
                'name' => 'Classic Traditional',
                'slug' => 'classic',
                'description' => 'A timeless, traditional resume format suitable for corporate and formal industries.',
                'category' => 'classic',
                'blade_view' => 'templates.classic',
                'is_active' => true,
            ],
            [
                'name' => 'Creative Bold',
                'slug' => 'creative',
                'description' => 'An eye-catching, creative template for designers, artists, and creative professionals.',
                'category' => 'creative',
                'blade_view' => 'templates.creative',
                'is_active' => true,
            ],
            [
                'name' => 'Minimal Clean',
                'slug' => 'minimal',
                'description' => 'A minimalist design focusing on content with clean lines and ample white space.',
                'category' => 'minimal',
                'blade_view' => 'templates.minimal',
                'is_active' => true,
            ],
            [
                'name' => 'Executive Premium',
                'slug' => 'executive',
                'description' => 'A sophisticated template designed for senior executives and C-level professionals.',
                'category' => 'executive',
                'blade_view' => 'templates.executive',
                'is_active' => true,
            ],
        ];

        foreach ($templates as $template) {
            Template::create($template);
        }
    }
}
