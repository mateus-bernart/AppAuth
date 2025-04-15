<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Stock;
use Illuminate\Http\Request;

class StockController extends Controller
{
    public function getBranchStock($branchId)
    {
        $stock = Stock::where('branch_id', $branchId)->get();
        return response()->json(['stock' => $stock]);
    }

    public function adjustStock(Request $request,  $productId)
    {
        $request->validate([
            'action' => 'required|in:increment,decrement',
            'branch_id' => 'required|exists:branches,id'
        ]);

        //adjust this, first is coming from branch 8
        $stock = Stock::where('product_id', $productId)
            ->where('branch_id', $request->branch_id)
            ->firstOrFail();

        if ($request->action === 'increment') {
            $stock->increment('quantity');
        } else {
            if ($stock->quantity <= 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot decrement - stock already at zero'
                ], 400);
            }
            $stock->decrement('quantity');
        }

        return response()->json([
            'success' => true,
            'branch' => $stock->branch_id,
            'product' => $stock->product,
            'new_quantity' => $stock->quantity
        ], 200);
    }
}
