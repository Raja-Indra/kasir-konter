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
        Schema::create('detail_transaksis', function (Blueprint $table) {
            $table->uuid('id')->primary();

            $table->foreignUuid('transaksi_id')
                ->constrained('transaksis')
                ->onDelete('cascade'); // Jika nota dihapus, detail ikut hilang

            $table->foreignUuid('produk_id')
                ->constrained('products');

            $table->integer('qty');

            // SNAPSHOT HARGA (PENTING)
            $table->decimal('harga_modal', 15, 2); // Modal per unit saat itu
            $table->decimal('harga_jual', 15, 2);  // Jual per unit saat itu

            // HITUNGAN
            $table->decimal('subtotal', 15, 2); // harga_jual * qty
            $table->decimal('laba', 15, 2);     // (harga_jual - harga_modal) * qty

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('detail_transaksis');
    }
};
