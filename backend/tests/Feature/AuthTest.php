<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Driver;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test owner login with valid credentials.
     */
    public function test_owner_can_login_with_valid_credentials(): void
    {
        $user = User::factory()->create([
            'email' => 'test@example.com',
            'password' => Hash::make('password123'),
            'role' => 'owner',
        ]);

        $response = $this->postJson('/api/auth/login', [
            'email' => 'test@example.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure(['token', 'role', 'user']);
    }

    /**
     * Test owner login with invalid credentials.
     */
    public function test_owner_cannot_login_with_invalid_credentials(): void
    {
        User::factory()->create([
            'email' => 'test@example.com',
            'password' => Hash::make('password123'),
            'role' => 'owner',
        ]);

        $response = $this->postJson('/api/auth/login', [
            'email' => 'test@example.com',
            'password' => 'wrongpassword',
        ]);

        $response->assertStatus(401);
    }

    /**
     * Test driver login with valid PIN.
     */
    public function test_driver_can_login_with_valid_pin(): void
    {
        $driver = Driver::factory()->create([
            'phone' => '771234567',
            'pin_code' => '1234',
            'status' => 'active',
        ]);

        $response = $this->postJson('/api/auth/driver/login', [
            'phone' => '771234567',
            'pin_code' => '1234',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure(['token', 'role', 'driver']);
    }

    /**
     * Test driver login with invalid PIN.
     */
    public function test_driver_cannot_login_with_invalid_pin(): void
    {
        Driver::factory()->create([
            'phone' => '771234567',
            'pin_code' => '1234',
            'status' => 'active',
        ]);

        $response = $this->postJson('/api/auth/driver/login', [
            'phone' => '771234567',
            'pin_code' => '0000',
        ]);

        $response->assertStatus(401);
    }

    /**
     * Test driver login with valid magic token.
     */
    public function test_driver_can_login_with_valid_magic_token(): void
    {
        $driver = Driver::factory()->create([
            'phone' => '771234567',
            'magic_token' => 'mt_test_token',
            'status' => 'active',
        ]);

        $response = $this->postJson('/api/auth/driver/login', [
            'token' => 'mt_test_token',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure(['token', 'role', 'driver']);
    }
}
