<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class RiwayatSaldoProvider extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'provider_id',
        'produk_id',
        'jenis',
        'nominal',
        'keterangan',
    ];

    protected $casts = [
        'nominal' => 'decimal:2',
    ];

    public $incrementing = false;
    protected $keyType = 'string';

    public function provider()
    {
        return $this->belongsTo(Provider::class);
    }

    public function produk()
    {
        return $this->belongsTo(Produk::class);
    }
}
