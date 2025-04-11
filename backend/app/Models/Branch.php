<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Branch extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'code',
        'description'
    ];

    public function stock()
    {
        return $this->hasMany(Stock::class);
    }
}
