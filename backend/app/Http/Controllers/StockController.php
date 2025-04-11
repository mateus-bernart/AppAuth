<?php

namespace App\Http\Controllers;

use App\Models\Stock;
use Illuminate\Http\Request;

class StockController extends Controller
{
    public function getBranchStock($branchId)
    {
        $stock = Stock::where('branch_id', $branchId)->get();
        return response()->json(['stock' => $stock]);
    }
}
