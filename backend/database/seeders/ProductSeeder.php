<?php

namespace Database\Seeders;

use App\Models\Product;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Product::create([
            'code' => 94567,
            'name' => 'Limited Edition Widget',
            'description' => 'Special release widget',
            'created_at' => Carbon::now(),
            'updated_at' => Carbon::now()
        ]);
    }
}
