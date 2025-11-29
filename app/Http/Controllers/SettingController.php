<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class SettingController extends Controller
{
    public function index()
    {
        return Inertia::render('Setting/Index');
    }

    public function update(Request $request)
    {
        $data = $request->validate([
            'nama_toko' => 'required|string',
            'alamat_toko' => 'required|string',
            'no_hp_toko' => 'required|string',
            'footer_struk' => 'required|string',
            'logo_toko' => 'nullable|image|max:2048',
        ]);

        // Handle Upload Logo
        if ($request->hasFile('logo_toko')) {
            // Hapus logo lama
            $oldLogo = Setting::where('key', 'logo_toko')->value('value');
            if ($oldLogo) Storage::disk('public')->delete($oldLogo);

            // Simpan baru
            $path = $request->file('logo_toko')->store('settings', 'public');
            Setting::updateOrCreate(['key' => 'logo_toko'], ['value' => $path]);
        }

        // Simpan Data Teks
        $keys = ['nama_toko', 'alamat_toko', 'no_hp_toko', 'footer_struk'];
        foreach ($keys as $key) {
            Setting::updateOrCreate(['key' => $key], ['value' => $data[$key]]);
        }

        return redirect()->back()->with('success', 'Pengaturan toko diperbarui!');
    }
}