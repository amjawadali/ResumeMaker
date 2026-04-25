<?php

namespace Database\Factories;

use App\Models\Template;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class TemplateFactory extends Factory
{
    protected $model = Template::class;

    public function definition(): array
    {
        $name = $this->faker->words(3, true);
        return [
            'user_id' => User::factory(),
            'name' => $name,
            'slug' => Str::slug($name),
            'description' => $this->faker->sentence(),
            'preview_image' => 'https://via.placeholder.com/300x400',
            'category' => $this->faker->randomElement(['Modern', 'Classic', 'Creative', 'Professional']),
            'type' => 'user_content',
            'canvas_data' => ['pages' => []],
            'is_public' => true,
            'status' => 'approved',
            'is_active' => true,
            'use_count' => 0,
            'fill_score_avg' => 0,
        ];
    }

    public function pending(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'pending',
            'is_active' => false,
        ]);
    }

    public function private(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_public' => false,
        ]);
    }
}
