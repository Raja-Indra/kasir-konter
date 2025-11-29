<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\PermissionRegistrar; // Import ini
use App\Models\User;

class RolesAndPermissionsSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Reset Cache Permission
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        // 2. Daftar Permission
        $permissions = [
            'view dashboard',     // Pastikan ini ada
            'manage users',
            'manage products',
            'manage transaction',
            'view reports',
            'manage debt',
        ];

        // 3. Buat Permission (Paksa guard 'web')
        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission, 'guard_name' => 'web']);
        }

        // 4. Buat Role (Paksa guard 'web')
        $roleKasir = Role::firstOrCreate(['name' => 'kasir', 'guard_name' => 'web']);
        $roleAdmin = Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);

        // 5. Assign Permission ke Role
        // Kasir
        $roleKasir->givePermissionTo([
            'view dashboard', 
            'manage transaction', 
            'manage debt'
        ]);

        // Admin (Semua)
        $roleAdmin->givePermissionTo(Permission::all());

        // 6. Assign ke User (Opsional, jika user sudah ada)
        $user = User::where('email', 'admin@admin.com')->first();
        if ($user) {
            $user->assignRole($roleAdmin);
        }
    }
}