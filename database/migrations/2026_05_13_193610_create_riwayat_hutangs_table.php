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
        Schema::create('riwayat_hutangs', function (Blueprint $table) {
            $table->uuid('id')->primary();

            $table->foreignUuid('hutang_id')
                ->constrained('hutangs')
                ->onDelete('cascade');

            $table->decimal('nominal_hutang', 15, 2);
            $table->string('keterangan')->nullable(); 

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('riwayat_hutangs');
    }
};
