<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Setting;

class SettingSeeder extends Seeder
{
    public function run(): void
    {
        $settings = [
            'nama_toko' => 'Indra Cell',
            'alamat_toko' => 'Jl. Pelaihari - Batakan No. 123',
            'no_hp_toko' => '0838-9533-8857',
            'footer_struk' => 'Terima Kasih, Barang yang dibeli tidak dapat ditukar',
            'logo_toko' => null,
        ];

        foreach ($settings as $key => $value) {
            Setting::create(['key' => $key, 'value' => $value]);
        }
    }
}