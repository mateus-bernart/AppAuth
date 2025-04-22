<?php

namespace Database\Seeders;

use App\Models\Product;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Faker\Factory as Faker;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        // DB::table('products')->truncate(); // clears the table first
        // DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        // $products = [
        //     'Premium Chicken Feed',
        //     'Organic Corn Mix',
        //     'Vitamin Boost Supplement',
        //     'High-Protein Pig Feed',
        //     'SuperGrow Cow Feed',
        //     'Balanced Rabbit Pellets',
        //     'Omega-3 Egg Enhancer',
        //     'Silage Preserver',
        //     'Milking Booster Formula',
        //     'Eco Pasture Seeds',
        //     'FastGrow Fertilizer',
        //     'Probiotic Cattle Feed',
        //     'Antibiotic-Free Pig Mix',
        //     'Sheep Wool Enhancer',
        //     'Lamb Growth Formula',
        //     'Duck Layer Pellets',
        //     'Goat Energy Booster',
        //     'Natural Insect Repellent',
        //     'Livestock Mineral Block',
        //     'Poultry Water Cleaner',
        //     'Fish Farm Feed',
        //     'Alfalfa Hay Cubes',
        //     'Horse Performance Mix',
        //     'Grain Storage Preserver',
        //     'Toxin Binder Additive',
        //     'Yeast Digestive Aid',
        //     'Enzyme Feed Additive',
        //     'Pet Rabbit Premium Mix',
        //     'Dairy Cattle Enhancer',
        //     'Calf Starter Feed',
        //     'Bovine Respiratory Support',
        //     'Sow Lactation Support',
        //     'Farrowing Crate Feed',
        //     'Piglet Growth Boost',
        //     'Fly Control Supplement',
        //     'Corn Silage Enhancer',
        //     'High Energy Grain Mix',
        //     'Urea Molasses Block',
        //     'Molasses Mineral Mix',
        //     'Hog Weight Gainer',
        //     'Poultry Feather Shine',
        //     'Goat Digestive Aid',
        //     'Vitamin AD3E Mix',
        //     'Electrolyte Rehydrator',
        //     'Salt Lick Block',
        //     'Multi-species Feed Mix',
        //     'Meat Pig Concentrate',
        //     'Winter Forage Blend',
        //     'Livestock Coat Enhancer',
        //     'Hydration Gel for Calves'
        // ];

        // $usedCodes = [];

        // foreach ($products as $product) {
        //     do {
        //         $code = rand(1000, 99999);
        //     } while (in_array($code, $usedCodes));

        //     $usedCodes[] = $code;

        //     $faker = Faker::create();

        //     Product::create([
        //         'code' => $code, // generates codes like 90000, 90001, ..., 90029
        //         'name' => $product,
        //         'description' => $faker->sentence(6),
        //         'price' => $faker->randomFloat(2, 10, 1000),
        //         'created_at' => Carbon::now(),
        //         'updated_at' => Carbon::now(),
        //     ]);
        // }
    }
}
