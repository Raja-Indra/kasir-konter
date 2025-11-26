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
        Schema::create('transaksis', function (Blueprint $table) {
            $table->uuid('id')->primary();

            // Kasir yang melayani (Opsional: bisa nullable jika mau support guest checkout)
            $table->foreignId('user_id')->constrained('users');

            $table->string('no_nota')->unique(); // TRX-2023...

            $table->decimal('total_harga', 15, 2); // Total belanjaan
            $table->decimal('total_laba', 15, 2);  // Total keuntungan nota ini
            $table->decimal('bayar', 15, 2);       // Uang dari pelanggan
            $table->decimal('kembalian', 15, 2);   // Uang kembali

            $table->integer('umur_pelanggan')->nullable(); // Sesuai request (Nullable biar tidak wajib)

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transaksis');
    }
};
