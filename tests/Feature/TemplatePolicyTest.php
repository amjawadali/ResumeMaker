<?php

use App\Models\Template;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
});

test('public approved templates are viewable by everyone', function () {
    $template = Template::factory()->create([
        'is_active' => true,
        'is_public' => true,
        'status' => 'approved',
    ]);

    $this->get(route('templates.show', $template))
        ->assertStatus(200);
    
    $this->actingAs(User::factory()->create())
        ->get(route('templates.show', $template))
        ->assertStatus(200);
});

test('private templates are not viewable by guests or other users', function () {
    $owner = User::factory()->create();
    $otherUser = User::factory()->create();
    $template = Template::factory()->private()->create(['user_id' => $owner->id]);

    // Guest
    $this->get(route('templates.show', $template))
        ->assertStatus(403);
    
    // Other User
    $this->actingAs($otherUser)
        ->get(route('templates.show', $template))
        ->assertStatus(403);
});

test('private templates are viewable by owner and admin', function () {
    $owner = User::factory()->create();
    $admin = User::factory()->create();
    $admin->assignRole('admin');
    
    $template = Template::factory()->private()->create(['user_id' => $owner->id]);

    // Owner
    $this->actingAs($owner)
        ->get(route('templates.show', $template))
        ->assertStatus(200);
    
    // Admin
    $this->actingAs($admin)
        ->get(route('templates.show', $template))
        ->assertStatus(200);
});

test('pending templates are viewable by owner but not by public', function () {
    $owner = User::factory()->create();
    $template = Template::factory()->pending()->create(['user_id' => $owner->id]);

    $this->get(route('templates.show', $template))
        ->assertStatus(403);

    $this->actingAs($owner)
        ->get(route('templates.show', $template))
        ->assertStatus(200);
});

test('creators can edit their own templates if not deletion requested', function () {
    $user = User::factory()->create();
    $template = Template::factory()->create(['user_id' => $user->id, 'is_deletion_requested' => false]);

    $this->actingAs($user)
        ->get(route('creator.templates.edit', $template))
        ->assertStatus(200);
});

test('creators cannot edit templates if deletion requested', function () {
    $user = User::factory()->create();
    $template = Template::factory()->create(['user_id' => $user->id, 'is_deletion_requested' => true]);

    $this->actingAs($user)
        ->get(route('creator.templates.edit', $template))
        ->assertStatus(403);
});

test('admins can edit any template', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');
    $template = Template::factory()->create();

    $this->actingAs($admin)
        ->get(route('creator.templates.edit', $template))
        ->assertStatus(200);
});
