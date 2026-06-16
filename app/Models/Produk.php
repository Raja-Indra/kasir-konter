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
        'foto',
        'harga_admin_provider',
        'harga_modal',
        'harga_jual',
        'stok',
        'jenis',
        'is_digital',
        'is_tarik_tunai',
        'is_flexible_price',
        'min_nominal',
        'max_nominal',
        'is_pinned',
        'is_archived'
    ];

    protected $casts = [
        'is_digital' => 'boolean',
        'is_tarik_tunai' => 'boolean',
        'is_flexible_price' => 'boolean',
        'is_pinned' => 'boolean',
        'is_archived' => 'boolean',
        'harga_admin_provider' => 'decimal:2',
        'harga_modal' => 'decimal:2',
        'harga_jual' => 'decimal:2',
        'min_nominal' => 'decimal:2',
        'max_nominal' => 'decimal:2',
    ];

    public function provider()
    {
        return $this->belongsTo(Provider::class);
    }
}
