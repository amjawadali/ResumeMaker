<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\UserDetail;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Inertia\Testing\AssertableInertia as Assert;

class UserDetailsTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_details_page_can_be_rendered(): void
    {
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->get('/user-details');

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('UserDetails/Index')
            ->has('userDetail')
        );
    }

    public function test_personal_info_can_be_updated(): void
    {
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->from('/user-details')
            ->post('/user-details/personal-info', [
                'full_name' => 'John Doe',
                'email' => 'john@example.com',
                'phone' => '1234567890',
            ]);

        $response->assertStatus(302);
        $response->assertRedirect('/user-details');
        $this->assertDatabaseHas('user_details', [
            'user_id' => $user->id,
            'full_name' => 'John Doe',
            'email' => 'john@example.com',
        ]);
        
        $response->assertSessionHas('success', 'Personal information updated successfully!');
    }

    public function test_personal_info_validation_fails_with_invalid_email(): void
    {
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->from('/user-details')
            ->post('/user-details/personal-info', [
                'full_name' => 'John Doe',
                'email' => 'invalid-email',
            ]);

        $response->assertStatus(302);
        $response->assertRedirect('/user-details');
        $response->assertSessionHasErrors(['email']);
    }
}
