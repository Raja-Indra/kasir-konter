<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class RiwayatHutang extends Model
{
    use HasFactory, HasUuids;

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'hutang_id', 'nominal_hutang', 'keterangan'
    ];

    public function hutang()
    {
        return $this->belongsTo(Hutang::class);
    }
}
