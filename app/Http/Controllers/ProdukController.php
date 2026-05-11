<?php

namespace App\Http\Controllers;

use App\Models\Produk;
use App\Models\Provider;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Illuminate\Support\Facades\Gate;

class ProdukController extends Controller
{
    public function index()
    {
        Gate::authorize('view products');
        
        return Inertia::render('Produk/Index', [
            'products' => Produk::with('provider')->latest()->get(),
            'providers' => Provider::select('id', 'nama_provider')->get()
        ]);
    }

    public function store(Request $request)
    {
        Gate::authorize('create products');
        
        $validated = $request->validate([
            'provider_id' => 'required|exists:providers,id',
            'nama_produk' => 'required|string|max:255',
            'foto' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
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

        if ($request->hasFile('foto')) {
            $validated['foto'] = $request->file('foto')->store('produks', 'public');
        }

        Produk::create($validated);
        return redirect()->back();
    }

    public function update(Request $request, Produk $produk)
    {
        Gate::authorize('edit products');
        
        $validated = $request->validate([
            'provider_id' => 'required|exists:providers,id',
            'nama_produk' => 'required|string|max:255',
            'foto' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
            'remove_foto' => 'nullable|boolean',
            'harga_admin_provider' => 'nullable|numeric',
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

        if ($request->boolean('remove_foto')) {
            if ($produk->foto) {
                Storage::disk('public')->delete($produk->foto);
            }
            $validated['foto'] = null;
        } elseif ($request->hasFile('foto')) {
            if ($produk->foto) {
                Storage::disk('public')->delete($produk->foto);
            }
            $validated['foto'] = $request->file('foto')->store('produks', 'public');
        }

        unset($validated['remove_foto']); // Jangan masukkan ke update

        $produk->update($validated);
        return redirect()->back();
    }

    public function addStock(Request $request, Produk $produk)
    {
        Gate::authorize('edit products');
        
        $validated = $request->validate([
            'tambah_stok' => 'required|integer|min:1',
        ]);

        $produk->increment('stok', $validated['tambah_stok']);

        return redirect()->back()->with('success', 'Stok berhasil ditambahkan.');
    }
    
    public function togglePin(Produk $produk)
    {
        Gate::authorize('edit products');
        
        $produk->update([
            'is_pinned' => !$produk->is_pinned
        ]);

        return redirect()->back()->with('success', 'Status pin produk diperbarui.');
    }

    public function destroy(Produk $produk)
    {
        Gate::authorize('delete products');
        
        try {
            $fotoPath = $produk->foto;
            $produk->delete();
            
            if ($fotoPath) {
                Storage::disk('public')->delete($fotoPath);
            }
            
            return redirect()->back();
        } catch (\Illuminate\Database\QueryException $e) {
            if ($e->getCode() == "23000") {
                return redirect()->back()->withErrors(['error' => 'Produk tidak dapat dihapus karena sudah ada di riwayat transaksi.']);
            }
            return redirect()->back()->withErrors(['error' => 'Gagal menghapus produk.']);
        }
    }
}
