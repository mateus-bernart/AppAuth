<?php

namespace Database\Seeders;

use App\Models\Stock;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class StockSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Stock::create([
            'product_id' => 1,
            'branch_id' => 1,
            'batch' => 1,
            'quantity' => 123,
            'created_at' => Carbon::now(),
            'updated_at' => Carbon::now()
        ]);
    }
}
