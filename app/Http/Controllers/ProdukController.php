<?php

namespace App\Http\Controllers;

use App\Models\Produk;
use App\Models\Provider;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProdukController extends Controller
{
    public function index()
    {
        return Inertia::render('Produk/Index', [ // <-- Folder Produk
            'products' => Produk::with('provider')->latest()->get(),
            'providers' => Provider::select('id', 'nama_provider')->get()
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'provider_id' => 'required|exists:providers,id',
            'nama_produk' => 'required|string|max:255',

            // UBAH DI SINI: Dari 'required' menjadi 'nullable'
            'harga_modal' => 'nullable|numeric',

            'harga_jual' => 'required|numeric',
            'stok' => 'required|integer',
            'jenis' => 'required|string',
            'is_digital' => 'required|boolean',
            'is_flexible_price' => 'boolean',
        ]);

        // Jika harga modal kosong/null, kita set jadi 0 agar aman di kalkulasi
        if (is_null($validated['harga_modal'])) {
            $validated['harga_modal'] = 0;
        }

        Produk::create($validated);
        return redirect()->back();
    }

    public function update(Request $request, Produk $produk)
    {
        $validated = $request->validate([
            'provider_id' => 'required|exists:providers,id',
            'nama_produk' => 'required|string|max:255',

            // UBAH DI SINI JUGA
            'harga_modal' => 'nullable|numeric',

            'harga_jual' => 'required|numeric',
            'stok' => 'required|integer',
            'jenis' => 'required|string',
            'is_digital' => 'required|boolean',
            'is_flexible_price' => 'boolean',
        ]);

        if (is_null($validated['harga_modal'])) {
            $validated['harga_modal'] = 0;
        }

        $produk->update($validated);
        return redirect()->back();
    }

    public function destroy(Produk $produk)
    {
        $produk->delete();
        return redirect()->back();
    }
}
