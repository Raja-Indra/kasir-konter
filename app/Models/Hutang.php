<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Hutang extends Model
{
    use HasFactory, HasUuids;

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'transaksi_id', 'nama_pelanggan', 'keterangan', 'no_hp',
        'total_hutang', 'terbayar', 'sisa', 'status', 'jatuh_tempo'
    ];

    public function cicilan()
    {
        return $this->hasMany(RiwayatCicilan::class)->latest();
    }
}
