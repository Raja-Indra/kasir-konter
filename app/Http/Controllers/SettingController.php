<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Http;
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

    public function wa()
    {
        return Inertia::render('Setting/Whatsapp');
    }

    public function updateWa(Request $request)
    {
        $data = $request->validate([
            'fonnte_token' => 'nullable|string',
        ]);

        Setting::updateOrCreate(['key' => 'fonnte_token'], ['value' => $data['fonnte_token'] ?? '']);

        return redirect()->back()->with('success', 'Token Fonnte berhasil disimpan!');
    }

    public function testWa(Request $request)
    {
        $request->validate([
            'no_hp' => 'required|string',
        ]);

        $token = Setting::where('key', 'fonnte_token')->value('value');
        
        if (!$token) {
            return redirect()->back()->withErrors(['error' => 'Token Fonnte belum diatur.']);
        }

        try {
            $response = Http::withHeaders([
                'Authorization' => $token,
            ])->post('https://api.fonnte.com/send', [
                'target' => $request->no_hp,
                'message' => "Halo! Ini adalah pesan percobaan otomatis dari sistem Kasir Konter Indra Cellular.\n\nJika menerima pesan ini, berarti integrasi Fonnte telah *BERHASIL* dihubungkan. 🎉\n\nTerima Kasih.",
            ]);

            if ($response->successful()) {
                $resData = $response->json();
                if (isset($resData['status']) && $resData['status'] == true) {
                    return redirect()->back()->with('success', 'Pesan percobaan berhasil dikirim ke ' . $request->no_hp);
                }
                return redirect()->back()->withErrors(['error' => 'Gagal dari Fonnte: ' . ($resData['reason'] ?? 'Unknown error')]);
            }

            return redirect()->back()->withErrors(['error' => 'Gagal terhubung ke Fonnte API.']);
        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['error' => 'Terjadi kesalahan sistem: ' . $e->getMessage()]);
        }
    }
}