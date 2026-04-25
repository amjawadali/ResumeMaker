<?php

use App\Models\Template;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
});

test('marketplace index only shows approved public templates for guests', function () {
    // 1 approved public
    Template::factory()->create([
        'name' => 'Visible Template',
        'is_active' => true,
        'is_public' => true,
        'status' => 'approved',
    ]);

    // 1 pending
    Template::factory()->pending()->create(['name' => 'Hidden Pending']);

    // 1 private
    Template::factory()->private()->create(['name' => 'Hidden Private']);

    $this->get(route('templates.index'))
        ->assertStatus(200)
        ->assertInertia(fn (Assert $page) => $page
            ->component('Templates/Index')
            ->has('templates.data', 1)
            ->where('templates.data.0.name', 'Visible Template')
        );
});

test('marketplace index only shows approved public templates for regular users', function () {
    $user = User::factory()->create();
    
    Template::factory()->create([
        'name' => 'Visible Template',
        'is_active' => true,
        'is_public' => true,
        'status' => 'approved',
    ]);

    Template::factory()->pending()->create(['name' => 'Hidden Pending']);

    $this->actingAs($user)
        ->get(route('templates.index'))
        ->assertStatus(200)
        ->assertInertia(fn (Assert $page) => $page
            ->component('Templates/Index')
            ->has('templates.data', 1)
        );
});

test('marketplace index shows all templates for admins', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    Template::factory()->create(['name' => 'Approved', 'status' => 'approved', 'is_active' => true]);
    Template::factory()->pending()->create(['name' => 'Pending']);

    $this->actingAs($admin)
        ->get(route('templates.index'))
        ->assertStatus(200)
        ->assertInertia(fn (Assert $page) => $page
            ->component('Templates/Index')
            ->has('templates.data', 2)
        );
});
