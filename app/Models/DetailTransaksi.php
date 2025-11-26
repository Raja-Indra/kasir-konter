<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class DetailTransaksi extends Model
{
    use HasFactory, HasUuids;

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'transaksi_id',
        'produk_id',
        'qty',
        'harga_modal', // Rename dari harga_modal_saat_transaksi
        'harga_jual',  // Rename dari harga_jual_saat_transaksi
        'subtotal',    // Tambahan
        'laba'         // Rename dari keuntungan
    ];

    public function produk()
    {
        return $this->belongsTo(Produk::class);
    }
}
