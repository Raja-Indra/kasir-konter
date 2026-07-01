<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\PermissionRegistrar;
use App\Models\User;

class RolesAndPermissionsSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Reset Cache
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        // 2. Daftar Permission Rinci (CRUD)
        $permissions = [
            // Dashboard
            'view dashboard owner',
            'view dashboard admin',
            'view dashboard kasir',

            // Manajemen User
            'view users',
            'create users',
            'edit users',
            'delete users',

            // Manajemen Produk
            'view products',
            'create products',
            'edit products',
            'delete products',

            // Manajemen Provider
            'view providers',
            'create providers',
            'edit providers',
            'delete providers',

            // Transaksi (Kasir)
            'view transaction',
            'create transaction', // Melakukan transaksi

            // Riwayat Transaksi
            'view history',
            'delete history', // Hapus riwayat transaksi (bahaya)

            // Laporan Penjualan
            'view reports',

            // Kasbon/Hutang
            'view debt',
            'create debt',
            'pay debt', // Bayar cicilan

            // Pengaturan
            'manage settings', // Pengaturan toko
            'manage roles',    // Akses menu roles ini

            // Kategori Produk
            'view categories',
            'create categories',
            'edit categories',
            'delete categories',
        ];

        // 3. Buat Permission
        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission, 'guard_name' => 'web']);
        }

        // 4. Buat Role & Assign Default

        // A. Role KASIR (Hanya bisa transaksi dan lihat stok)
        $roleKasir = Role::firstOrCreate(['name' => 'kasir']);
        $roleKasir->syncPermissions([
            'view dashboard kasir',
            'view products', // Kasir butuh lihat produk untuk cari harga
            'view transaction',
            'create transaction',
            'view debt',
            'create debt',
            'pay debt',
            'view history', // Kasir biasanya boleh lihat riwayat transaksi sendiri
        ]);

        // B. Role OWNER (Segalanya)
        $roleOwner = Role::firstOrCreate(['name' => 'owner']);
        $roleOwner->syncPermissions(Permission::all());
    }
}
