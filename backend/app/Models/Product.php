<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    protected $fillable = [
        'name',
        'description',
        'code',
        'price',
    ];

    public function stock()
    {
        return $this->hasMany(Stock::class);
    }
}
