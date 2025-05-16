<?php

namespace App\Http\Controllers;

use App\Models\Branch;
use App\Models\Stock;
use Illuminate\Http\Request;

class BranchController extends Controller
{
    public function getBranches(Request $request)
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
}
