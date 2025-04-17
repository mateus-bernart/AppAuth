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

        $request->merge([
            'price' => str_replace(',', '.', $request->input('price'))
        ]);

        $fields = $request->validate([
            'name'        => 'required|max:255|string',
            'description' => 'required|max:1000|nullable',
            'code'        => 'required|unique:products|integer|digits:6',
            'quantity'    => 'required|integer|min:0',
            'batch'       => 'required|integer|min:0',
            'price'       => 'required|numeric|min:0',
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
