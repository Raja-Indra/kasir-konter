<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Produk extends Model
{
    use HasFactory, HasUuids;

    /**
     * Karena nama tabel di database adalah 'products'
     * sedangkan nama Model ini adalah 'Produk',
     * kita WAJIB mendefinisikan ini:
     */
    protected $table = 'products';

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'provider_id',
        'nama_produk',
        'harga_modal',
        'harga_jual',
        'stok',
        'jenis',
        'is_digital',
        'is_flexible_price'
    ];

    protected $casts = [
        'is_digital' => 'boolean',
        'is_flexible_price' => 'boolean',
        'harga_modal' => 'decimal:2',
        'harga_jual' => 'decimal:2',
    ];

    public function provider()
    {
        return $this->belongsTo(Provider::class);
    }
}
