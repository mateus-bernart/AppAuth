<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StockLog extends Model
{
    protected $fillable = [
        'user_id',
        'branch_id',
        'product_id',
        'old_quantity',
        'new_quantity',
        'quantity_change',
        'action'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }
}
