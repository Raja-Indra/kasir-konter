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
            'is_tarik_tunai' => 'boolean',
            'is_flexible_price' => 'boolean',
            'min_nominal' => 'nullable|numeric',
            'max_nominal' => 'nullable|numeric|gte:min_nominal',
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
            'is_tarik_tunai' => 'boolean',
            'is_flexible_price' => 'boolean',
            'min_nominal' => 'nullable|numeric',
            'max_nominal' => 'nullable|numeric|gte:min_nominal',
        ]);

        if (is_null($validated['harga_modal'])) {
            $validated['harga_modal'] = 0;
        }

        $produk->update($validated);
        return redirect()->back();
    }

    public function addStock(Request $request, Produk $produk)
    {
        $validated = $request->validate([
            'tambah_stok' => 'required|integer|min:1',
        ]);

        $produk->increment('stok', $validated['tambah_stok']);

        return redirect()->back()->with('success', 'Stok berhasil ditambahkan.');
    }
    
    public function togglePin(Produk $produk)
    {
        $produk->update([
            'is_pinned' => !$produk->is_pinned
        ]);

        return redirect()->back()->with('success', 'Status pin produk diperbarui.');
    }

    public function destroy(Produk $produk)
    {
        try {
            $produk->delete();
            return redirect()->back();
        } catch (\Illuminate\Database\QueryException $e) {
            if ($e->getCode() == "23000") {
                return redirect()->back()->withErrors(['error' => 'Produk tidak dapat dihapus karena sudah ada di riwayat transaksi.']);
            }
            return redirect()->back()->withErrors(['error' => 'Gagal menghapus produk.']);
        }
    }
}
