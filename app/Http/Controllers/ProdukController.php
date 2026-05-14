<?php

namespace App\Http\Controllers;

use App\Models\Produk;
use App\Models\Provider;
use App\Models\RiwayatSaldoProvider;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Illuminate\Support\Facades\Gate;

class ProdukController extends Controller
{
    public function index()
    {
        Gate::authorize('view products');
        
        return Inertia::render('Produk/Index', [
            'products' => Produk::with('provider')->latest()->get(),
            'providers' => Provider::select('id', 'nama_provider', 'saldo')->get()
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

    public function injectVoucher(Request $request)
    {
        Gate::authorize('create products'); // or 'edit products' depending on policy
        
        $validated = $request->validate([
            'provider_id' => 'required|exists:providers,id',
            'is_new_produk' => 'required|boolean',
            'produk_id' => 'required_if:is_new_produk,false|nullable|exists:products,id',
            
            // Atribut produk baru
            'nama_produk' => 'required_if:is_new_produk,true|nullable|string|max:255',
            'harga_jual' => 'required_if:is_new_produk,true|nullable|numeric',
            'jenis' => 'required_if:is_new_produk,true|nullable|string',
            'is_digital' => 'required_if:is_new_produk,true|nullable|boolean',
            
            // Atribut inject
            'qty' => 'required|integer|min:1',
            'harga_modal_inject' => 'required|numeric|min:0',
            'harga_kertas_voucher' => 'required|numeric|min:0',
        ]);

        $provider = Provider::findOrFail($validated['provider_id']);
        $totalPotongSaldo = $validated['qty'] * $validated['harga_modal_inject'];
        $hargaModalBaru = $validated['harga_modal_inject'] + $validated['harga_kertas_voucher'];

        if ($provider->saldo < $totalPotongSaldo) {
            return redirect()->back()->withErrors(['error' => 'Saldo Provider tidak mencukupi untuk melakukan inject. Saldo: Rp ' . number_format($provider->saldo, 0, ',', '.') . ', Dibutuhkan: Rp ' . number_format($totalPotongSaldo, 0, ',', '.')]);
        }

        DB::beginTransaction();
        try {
            if ($validated['is_new_produk']) {
                $produk = Produk::create([
                    'provider_id' => $validated['provider_id'],
                    'nama_produk' => $validated['nama_produk'],
                    'harga_jual' => $validated['harga_jual'],
                    'harga_modal' => $hargaModalBaru,
                    'stok' => $validated['qty'],
                    'jenis' => $validated['jenis'],
                    'is_digital' => $validated['is_digital'],
                    'is_tarik_tunai' => false,
                    'is_flexible_price' => false,
                ]);
            } else {
                $produk = Produk::findOrFail($validated['produk_id']);
                $produk->increment('stok', $validated['qty']);
                $produk->update(['harga_modal' => $hargaModalBaru]);
            }

            $provider->decrement('saldo', $totalPotongSaldo);

            RiwayatSaldoProvider::create([
                'provider_id' => $provider->id,
                'produk_id' => $produk->id,
                'jenis' => 'keluar',
                'nominal' => $totalPotongSaldo,
                'keterangan' => 'Inject ' . $validated['qty'] . ' pcs ' . $produk->nama_produk,
            ]);

            DB::commit();
            return redirect()->back()->with('success', 'Inject voucher berhasil. Saldo terpotong Rp ' . number_format($totalPotongSaldo, 0, ',', '.'));
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->withErrors(['error' => 'Terjadi kesalahan sistem saat melakukan inject: ' . $e->getMessage()]);
        }
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
