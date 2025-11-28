<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use App\Models\User;

class RolesAndPermissionsSeeder extends Seeder
{
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // 1. Buat Permissions (Hak Akses Spesifik)
        $permissions = [
            'view dashboard',
            'manage users',    // CRUD User
            'manage products', // CRUD Produk & Provider
            'manage transaction', // Kasir
            'view reports',    // Laporan
            'manage debt',     // Kasbon
        ];

        foreach ($permissions as $permission) {
            Permission::create(['name' => $permission]);
        }

        // 2. Buat Roles & Assign Permissions

        // A. Role KASIR (Hanya bisa transaksi & kasbon)
        $roleKasir = Role::create(['name' => 'kasir']);
        $roleKasir->givePermissionTo(['view dashboard', 'manage transaction', 'manage debt']);

        // B. Role ADMIN (Bisa segalanya)
        $roleAdmin = Role::create(['name' => 'admin']);
        $roleAdmin->givePermissionTo(Permission::all());

        // 3. Assign Role ke User Pertama (Admin Utama)
        // Pastikan email ini sesuai dengan user yang sudah Anda buat sebelumnya
        $user = User::where('email', 'admin@admin.com')->first();
        if ($user) {
            $user->assignRole('admin');
        }
    }
}
