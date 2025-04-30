<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Stock;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class ProductController extends Controller
{

    public function addImage(Request $request, $productId)
    {
        $product = Product::find($productId);

        if (!$product) {
            return response()->json(['error' => 'Product not found'], 404);
        }

        if ($request->hasFile('image')) {
            $image = $request->file('image');
            $filename = Str::uuid() . '.' . $image->getClientOriginalExtension();
            $image->storeAs('product_images', $filename, 'public');

            $product->image = $filename;
            $product->save();

            return response()->json([
                'message' => 'Image added successfully',
                'imagePath' => "product_images/{$filename}",
                'product' => $product
            ], 200);
        } else {
            return response()->json([
                'message' => "No image Uploaded"
            ], 400);
        }
    }

    public function getProduct($productId)
    {
        $product = Product::find($productId);
        if (!$product) {
            return response()->json([
                'error' => 'Product not found'
            ], 404);
        }
        return response()->json([
            'product' => $product
        ]);
    }

    public function removeImage($productId)
    {
        $product = Product::find($productId);

        if (!$product) {
            return response()->json([
                'error' => 'Product not found',
                404
            ]);
        }

        if ($product->image) {
            $imagePath = "product_images/{$product->image}";
            if (Storage::disk('public')->exists($imagePath)) {
                if (Storage::disk('public')->delete($imagePath)) {
                    $product->image = null;
                    $product->save();
                    return response()->json(['message' => 'Image removed successfully'], 200);
                } else {
                    return response()->json([
                        'message' => 'Image does not exist.'
                    ], 404);
                }
            } else {
                return response()->json([
                    'message' => 'Image could not be deleted.'
                ], 500);
            }
        }

        return response()->json([
            'message' => 'User does not have an image.'
        ],  404);
    }

    public function checkCode($productCode)
    {
        $exists = Product::where('code', $productCode)->exists();
        return response()->json(['exists' => $exists], 200);
    }

    public function getBranchStockProducts($branchId)
    {
        $products = Stock::where('branch_id', $branchId)->get();
        return response()->json(['products' => $products]);
    }

    public function createOrUpdateProduct(Request $request, $branchId, $productId = null)
    {
        $request->merge([
            'price' => str_replace(',', '.', $request->input('price'))
        ]);

        $rules = [
            'name'        => 'required|max:255|string',
            'description' => 'required|max:1000|nullable',
            'quantity'    => 'required|integer|min:0',
            'batch'       => 'required|integer|min:0',
            'price'       => 'required|numeric|min:0',
            'image'       => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
        ];

        if ($productId) {
            $rules['code'] = ['required', 'integer', 'digits:6', Rule::unique('products', 'code')->ignore($productId)];
        } else {
            $rules['code'] = ['required', 'integer', 'digits:6', 'unique:products,code'];
        }

        $fields = $request->validate($rules);

        if ($request->hasFile('image')) {
            $image = $request->file('image');
            $filename = Str::uuid() . '.' . $image->getClientOriginalExtension();
            $image->storeAs('product_images', $filename, 'public');
            $fields['image'] = $filename;
        }

        $fields['synced'] = 1;

        $product = Product::updateOrCreate(
            ['id' => $productId],
            $fields
        );

        $stock = Stock::updateOrCreate(
            ['product_id' => $product->id, 'branch_id' => $branchId],
            [
                'batch' => $fields['batch'],
                'quantity' => $fields['quantity'],
                'synced' => 1,
            ]
        );

        return response()->json([
            'product' => $product,
            'stock' => $stock,
            'status' => $productId ? 'updated' : 'created'
        ], 200);
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
