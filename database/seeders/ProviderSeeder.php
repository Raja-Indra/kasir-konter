<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Provider;

class ProviderSeeder extends Seeder
{
    public function run(): void
    {
        $providers = [
            [
                'nama_provider' => 'Dana',
                'saldo' => 2000000,
            ],
            [
                'nama_provider' => 'Agen Pulsa',
                'saldo' => 500000,
            ],
            [
                'nama_provider' => 'Anggi Charger',
                'saldo' => 500000,
            ],
            [
                'nama_provider' => 'Gudang', // Biasanya untuk stok fisik
                'saldo' => 0,
            ],
        ];

        foreach ($providers as $data) {
            Provider::create($data);
        }
    }
}