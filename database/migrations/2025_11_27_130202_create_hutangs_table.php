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
        Schema::create('hutangs', function (Blueprint $table) {
            $table->uuid('id')->primary();

            // Opsional: Link ke transaksi jika hutangnya dari belanjaan kasir
            $table->foreignUuid('transaksi_id')->nullable()->constrained('transaksis')->nullOnDelete();

            $table->string('nama_pelanggan');
            $table->string('keterangan')->nullable(); // Misal: Kasbon Pulsa
            $table->string('no_hp')->nullable(); // Penting buat nagih WA

            $table->decimal('total_hutang', 15, 2);
            $table->decimal('terbayar', 15, 2)->default(0);
            $table->decimal('sisa', 15, 2);

            $table->enum('status', ['belum_lunas', 'lunas'])->default('belum_lunas');
            $table->date('jatuh_tempo')->nullable();

            $table->timestamps();
        });
    }
    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('hutangs');
    }
};
