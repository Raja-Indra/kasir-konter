<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RoleController extends Controller
{
    public function index()
    {
        // Ambil roles beserta permissions-nya
        // Ambil juga SEMUA permission yang ada untuk ditampilkan di checkbox
        return Inertia::render('Roles/Index', [
            'roles' => Role::with('permissions')->get(),
            'allPermissions' => Permission::all(),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|unique:roles,name',
            'permissions' => 'array'
        ]);

        $role = Role::create(['name' => $request->name, 'guard_name' => 'web']);

        if($request->has('permissions')){
            $role->syncPermissions($request->permissions);
        }

        return redirect()->back()->with('success', 'Role berhasil dibuat.');
    }

    public function update(Request $request, Role $role)
    {
        $request->validate([
            'name' => 'required|unique:roles,name,'.$role->id,
            'permissions' => 'array'
        ]);

        if ($role->name === 'owner' && $request->name !== 'owner') {
            return redirect()->back()->with('error', 'Nama Role Owner Utama tidak boleh diubah.');
        }

        $role->update(['name' => $request->name]);
        $role->syncPermissions($request->permissions);

        return redirect()->back()->with('success', 'Role diperbarui.');
    }

    public function destroy(Role $role)
    {
        if($role->name === 'owner') {
            return redirect()->back()->with('error', 'Role Owner Utama tidak boleh dihapus.');
        }

        $role->delete();
        return redirect()->back()->with('success', 'Role dihapus.');
    }
}
