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
        \Illuminate\Support\Facades\Schema::disableForeignKeyConstraints();
        Template::truncate();
        \Illuminate\Support\Facades\Schema::enableForeignKeyConstraints();

        $templates = [
            [
                'name' => 'Premium Executive',
                'slug' => 'premium-executive',
                'description' => 'A stunning, high-end design featuring a modern layout with refined typography and a professional color palette.',
                'category' => 'modern',
                'blade_view' => 'templates.modern',
                'is_active' => true,
            ],
        ];

        foreach ($templates as $template) {
            Template::create($template);
        }
    }
}
