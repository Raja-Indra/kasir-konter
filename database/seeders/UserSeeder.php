<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Buat User ADMIN (Owner)
        $admin = User::create([
            'name' => 'Owner Indra Cell',
            'email' => 'muhammadindra226@gmail.com',
            'password' => Hash::make('12345678'), // Password default
            'no_hp' => '081234567890',
            'email_verified_at' => now(),
            'is_active' => true,
        ]);
        
        // Langsung beri role admin
        $admin->assignRole('admin');


        // 2. Buat User KASIR (Untuk Test)
        $kasir = User::create([
            'name' => 'Yajid',
            'email' => 'mindrarahman23@mhs.politala.ac.id',
            'password' => Hash::make('12345678'),
            'no_hp' => '089876543210',
            'email_verified_at' => now(),
            'is_active' => true,
        ]);
        
        // Langsung beri role kasir
        $kasir->assignRole('kasir');
    }
}