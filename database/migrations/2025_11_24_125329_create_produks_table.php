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
        Schema::create('products', function (Blueprint $table) {
            $table->uuid('id')->primary(); // UUID Primary Key

            // Foreign Key ke tabel providers
            $table->foreignUuid('provider_id')
                ->constrained('providers')
                ->onDelete('cascade');

            $table->string('nama_produk');
            $table->decimal('harga_modal', 15, 2);
            $table->decimal('harga_jual', 15, 2);
            $table->integer('stok')->default(0);
            $table->string('jenis'); // Contoh: 'voucher', 'inject', 'kartu perdana'
            $table->boolean('is_digital')->default(true); // true = digital, false = fisik
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('produks');
    }
};
