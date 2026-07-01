<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class KategoriSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $cats = ['Pulsa', 'Paket Data', 'Token Listrik', 'Top Up E-Wallet', 'Voucher Fisik', 'Kartu Perdana', 'Aksesoris', 'Jasa'];
        foreach($cats as $cat) {
            \App\Models\Kategori::firstOrCreate(['nama_kategori' => $cat]);
        }
    }
}
