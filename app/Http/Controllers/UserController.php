<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    public function index()
    {
        return Inertia::render('Users/Index', [
            'users' => User::latest()->get()
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'no_hp' => 'nullable|string|max:20',
            'password' => 'required|string|min:6',
            'foto' => 'nullable|image|max:2048', // Max 2MB
            'is_active' => 'boolean'
        ]);

        // Handle Upload Foto
        if ($request->hasFile('foto')) {
            $path = $request->file('foto')->store('avatars', 'public');
            $validated['foto'] = $path;
        }

        // Hash Password
        $validated['password'] = Hash::make($validated['password']);

        $user = User::create($validated);
        $user->assignRole($request->input('role', 'kasir'));
        return redirect()->back();
    }

    public function update(Request $request, User $user)
    {
        // Validasi sedikit beda: Email boleh sama dengan punya sendiri, Password boleh kosong (kalau ga mau diganti)
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'email', Rule::unique('users')->ignore($user->id)],
            'no_hp' => 'nullable|string|max:20',
            'password' => 'nullable|string|min:6',
            'foto' => 'nullable|image|max:2048',
            'is_active' => 'boolean'
        ]);

        // Handle Password (Hanya update jika diisi)
        if (!empty($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        } else {
            unset($validated['password']); // Hapus key password biar ga ke-update jadi null
        }

        // Handle Foto Baru
        if ($request->hasFile('foto')) {
            // Hapus foto lama jika ada
            if ($user->foto) {
                Storage::disk('public')->delete($user->foto);
            }
            $validated['foto'] = $request->file('foto')->store('avatars', 'public');
        }

        $user->update($validated);
        $user->syncRoles([$request->input('role')]);
        return redirect()->back();
    }

    public function destroy(User $user)
    {
        // Hapus file foto jika ada
        if ($user->foto) {
            Storage::disk('public')->delete($user->foto);
        }

        $user->delete();
        return redirect()->back();
    }
}
