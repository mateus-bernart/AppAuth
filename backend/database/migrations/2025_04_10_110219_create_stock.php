<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (!Schema::hasTable('stocks')) {
            Schema::create('stocks', function (Blueprint $table) {
                $table->id();
                $table->foreignId('product_id')->constrained('products')->onDelete('cascade');
                $table->foreignId('branch_id')->constrained('branches');
                $table->string('batch');
                $table->integer('quantity');
                $table->integer('synced')->default(0);
                $table->timestamps();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('stock');
    }
};
