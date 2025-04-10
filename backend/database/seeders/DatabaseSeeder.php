<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::factory()->create([
            'name' => 'Test User',
            'email' => 'teste@teste',
            'password' => '123',
            'email_verified' => '1',
        ]);

        $this->call([
            ProductSeeder::class,
            BranchSeeder::class,
            StockSeeder::class,
        ]);
    }
}
