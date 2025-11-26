<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids; // <-- 1. Import ini

class Provider extends Model
{
    use HasFactory, HasUuids; // <-- 2. Pasang di sini

    // Karena ID dibuat otomatis oleh sistem, kita tidak perlu memasukkannya ke fillable
    protected $fillable = [
        'nama_provider',
        'saldo',
    ];

    // Opsional: Beritahu Laravel kalau tipe ID kita adalah string
    protected $keyType = 'string';
    public $incrementing = false;
}
