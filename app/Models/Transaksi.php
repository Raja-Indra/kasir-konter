<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Transaksi extends Model
{
    use HasFactory, HasUuids;

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'user_id',
        'no_nota',
        'total_harga',
        'total_laba', // Field baru
        'bayar',
        'kembalian',
        'umur_pelanggan',
        'no_hp_pelanggan'
    ];

    public function details()
    {
        return $this->hasMany(DetailTransaksi::class);
    }

    public function hutang()
    {
        return $this->hasOne(Hutang::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
