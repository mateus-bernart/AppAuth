<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Stock;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function getBranchStockProducts($branchId)
    {
        $products = Stock::where('branch_id', $branchId)->get();
        return response()->json(['products' => $products]);
    }

    public function deleteProduct($productId)
    {
        $product = Product::find($productId);
        if (!$product) {
            return response()->json(['message' => 'Product not found'], 400);
        }

        $result = $product->delete();
        if ($result) {
            return response()->json(['Product deleted'], 200);
        } else {
            return response()->json(['Product wasn\'t deleted'], 500);
        }
    }
}
