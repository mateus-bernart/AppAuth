<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Stock;
use App\Models\StockLog;
use Illuminate\Http\Request;

class StockController extends Controller
{
    public function getBranchStock($branchId)
    {
        $stock = Stock::where('branch_id', $branchId)->get();
        return response()->json(['stock' => $stock]);
    }

    public function logAdjustment($productId, Request $request)
    {

        $request->validate([
            'branch_id' => 'required|exists:branches,id',
            'new_quantity' => 'required|integer|min:0',
        ]);

        $stock = Stock::where('product_id', $productId)
            ->where('branch_id', $request->branch_id)
            ->firstOrFail();

        $quantityChange = $request->new_quantity - $stock->quantity;

        if (!$quantityChange) {
            return response()->json(['success' => true, 'message' => 'No changes.']);
        }

        $log = StockLog::create([
            'user_id' => auth()->id(),
            'branch_id' => $request->branch_id,
            'product_id' => $productId,
            'old_quantity' => $stock->quantity,
            'new_quantity' => $request->new_quantity,
            'quantity_change' => $quantityChange,
            'action' => 'manual_adjustment'
        ]);

        $stock->update(['quantity' => $request->new_quantity]);

        return response()->json([
            'success' => true,
            'log_id' => $log->id,
            'quantity_change' => $quantityChange
        ]);
    }
}
