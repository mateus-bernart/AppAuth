<?php

namespace App\Http\Controllers;

use App\Models\Branch;
use App\Models\Stock;
use Illuminate\Http\Request;

class BranchController extends Controller
{
    public function getAllBranches(Request $request)
    {
        $term = $request->query('q');
        if ($term) {
            return
                Branch::where('code', 'like', "%{$term}%")
                ->orWhere('description', 'like', "%{$term}%")
                ->get();
        }

        return Branch::all();
    }

    public function getBranchWithStock(Request $request, $branchId)
    {

        $term = $request->query('q');
        $branch = Branch::with(['stock' => function ($query) use ($term) {
            if ($term) {
                $query->whereHas('product', function ($productQuery) use ($term) {
                    $productQuery
                        ->where('name', 'like', "%{$term}%")
                        ->orWhere('code', 'like', "%{$term}%")
                        ->orWhere('description', 'like', "%{$term}%");
                });
            }

            $query->with('product');
        }])->find($branchId);

        return response()->json([
            'branch' => $branch,
            'stock' => $branch ? $branch->stock : []
        ]);
    }
}
