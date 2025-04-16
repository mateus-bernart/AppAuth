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

    public function createProduct(Request $request, $branchId)
    {
        $fields = $request->validate([
            'name'        => 'required|max:255',
            'description' => 'required|max:255',
            'code'        => 'required|digits:6|unique:products',
            'quantity'    => 'required|max:255',
            'batch'       => 'required|max:255',
            'price'       => 'required|max:255',
        ]);

        $product = Product::create($fields);

        Stock::create([
            'product_id' => $product->id,
            'branch_id' => $branchId,
            'batch' => $fields['batch'],
            'quantity' => $fields['quantity'],
        ]);

        if ($product->wasRecentlyCreated) {
            return ['name' => $product, 'status' => 'created'];
        } else {
            return ['status' => 'fail'];
        }

        event(new Registered($product));
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
