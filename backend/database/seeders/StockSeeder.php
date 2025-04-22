<?php

namespace Database\Seeders;

use App\Models\Stock;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class StockSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // DB::table('stocks')->truncate(); // clears the table first

        // for ($i = 1; $i <= 100; $i++) {
        //     Stock::create([
        //         'product_id' => rand(1, 50),
        //         'branch_id' => rand(1, 48),
        //         'batch' => $i,
        //         'quantity' => rand(1, 1000),
        //         'created_at' => Carbon::now(),
        //         'updated_at' => Carbon::now()
        //     ]);
        // }
    }
}
