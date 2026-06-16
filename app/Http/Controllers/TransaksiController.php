<?php

namespace App\Http\Controllers;

use App\Models\Transaksi;
use App\Models\DetailTransaksi;
use App\Models\Produk;
use App\Models\Provider;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Illuminate\Support\Facades\Gate;

class TransaksiController extends Controller
{
    public function index()
    {
        Gate::authorize('view transaction');
        
        // Kita kirim data produk untuk ditampilkan di katalog kasir
        return Inertia::render('Transaksi/Index', [
            'products' => Produk::query()
                ->where('is_archived', false)
                ->with('provider:id,nama_provider,saldo')
                ->orderBy('is_pinned', 'desc') 
                ->latest()
                ->get(),
            'pelangganHutang' => \App\Models\Hutang::select('nama_pelanggan', 'sisa')->get()
        ]);
    }

    public function store(Request $request)
    {
        Gate::authorize('create transaction');
        
        $request->validate([
            'cart' => 'required|array|min:1',
            'bayar' => 'required|numeric',
            'total_harga' => 'required|numeric',
            'metode_pembayaran' => 'nullable|string',
            'nama_pelanggan' => 'nullable|string|required_if:metode_pembayaran,hutang',
        ]);

        try {
            DB::transaction(function () use ($request) {
                $no_nota = 'TRX-' . date('Ymd-His');
                $kembalian = $request->bayar - $request->total_harga;
                $total_laba_nota = 0;
                $isHutang = $request->metode_pembayaran === 'hutang';

                if (!$isHutang && $kembalian < 0) throw new \Exception('Uang pembayaran kurang!');

                // 1. Simpan Header Transaksi
                $transaksi = Transaksi::create([
                    'user_id' => Auth::id(),
                    'no_nota' => $no_nota,
                    'total_harga' => $request->total_harga,
                    'bayar' => $request->bayar,
                    'kembalian' => $kembalian,
                    'umur_pelanggan' => $request->umur_pelanggan,
                    'total_laba' => 0,
                ]);

                // Jika Hutang, catat ke tabel hutangs
                if ($isHutang) {
                    $sisaHutang = $request->total_harga - $request->bayar;
                    if ($sisaHutang > 0) {
                        // Ambil daftar nama produk dari keranjang
                        $namaProdukList = collect($request->cart)->pluck('nama_produk')->implode(', ');
                        $keteranganHutang = 'Hutang: ' . (strlen($namaProdukList) > 200 ? substr($namaProdukList, 0, 200) . '...' : $namaProdukList);

                        $existingHutang = \App\Models\Hutang::where('nama_pelanggan', $request->nama_pelanggan)
                            ->first();

                        if ($existingHutang) {
                            $existingHutang->update([
                                'total_hutang' => $existingHutang->total_hutang + $request->total_harga,
                                'terbayar' => $existingHutang->terbayar + $request->bayar,
                                'sisa' => $existingHutang->sisa + $sisaHutang,
                                'keterangan' => $existingHutang->keterangan . ' | ' . $keteranganHutang,
                                'status' => 'belum_lunas',
                                // 'transaksi_id' => $transaksi->id, // Biarkan pakai transaksi awal agar riwayat lama tetap punya acuan, atau update ke yang baru
                            ]);

                            \App\Models\RiwayatHutang::create([
                                'hutang_id' => $existingHutang->id,
                                'nominal_hutang' => $request->total_harga,
                                'keterangan' => $keteranganHutang,
                            ]);
                        } else {
                            $newHutang = \App\Models\Hutang::create([
                                'transaksi_id' => $transaksi->id,
                                'nama_pelanggan' => $request->nama_pelanggan,
                                'keterangan' => $keteranganHutang,
                                'total_hutang' => $request->total_harga,
                                'terbayar' => $request->bayar,
                                'sisa' => $sisaHutang,
                                'status' => 'belum_lunas',
                            ]);

                            \App\Models\RiwayatHutang::create([
                                'hutang_id' => $newHutang->id,
                                'nominal_hutang' => $request->total_harga,
                                'keterangan' => $keteranganHutang,
                            ]);
                        }
                    }
                }

                // 2. Looping Barang
                foreach ($request->cart as $item) {
                    $produkDb = Produk::lockForUpdate()->find($item['id']);

                    if (!$produkDb) throw new \Exception("Produk tidak ditemukan.");

                    // --- LOGIKA HARGA ---
                    // Jika flexible (E-Wallet manual), pakai harga inputan kasir.
                    // Jika fix, wajib pakai harga database (agar aman).
                    if ($produkDb->is_flexible_price) {
                        $harga_modal_final = $item['harga_modal']; // Dari inputan React
                        $harga_jual_final = $item['harga_jual'];   // Dari inputan React
                    } else {
                        $harga_modal_final = $produkDb->harga_modal + ($produkDb->harga_admin_provider ?? 0);
                        $harga_jual_final = $produkDb->harga_jual;
                    }

                    // --- LOGIKA STOK & SALDO ---
                    if ($produkDb->is_digital) {
                        // A. PRODUK DIGITAL: Kurangi Saldo Provider
                        $provider = Provider::lockForUpdate()->find($produkDb->provider_id);

                        if (!$provider) {
                            throw new \Exception("Provider untuk produk {$produkDb->nama_produk} tidak ditemukan.");
                        }

                        // Total modal yang dibutuhkan = Harga Modal Satuan * Qty
                        $total_modal_dibutuhkan = $harga_modal_final * $item['qty'];

                        if ($produkDb->is_tarik_tunai) {
                            // Untuk Tarik Tunai: Provider menerima saldo digital dari pelanggan
                            // Sesuai kesepakatan, provider saldo bertambah sebesar harga modal.
                            $provider->increment('saldo', $total_modal_dibutuhkan);
                        } else {
                            // Cek Saldo Cukup?
                            if ($provider->saldo < $total_modal_dibutuhkan) {
                                throw new \Exception("Saldo Provider {$provider->nama_provider} Kurang! Sisa: " . number_format($provider->saldo));
                            }

                            // Potong Saldo
                            $provider->decrement('saldo', $total_modal_dibutuhkan);
                        }

                    } else {
                        // B. PRODUK FISIK: Kurangi Stok Barang
                        if ($produkDb->stok < $item['qty']) {
                            throw new \Exception("Stok {$produkDb->nama_produk} Kurang!");
                        }
                        $produkDb->decrement('stok', $item['qty']);
                    }

                    // Hitung Laba
                    $laba_per_item = ($harga_jual_final - $harga_modal_final) * $item['qty'];
                    $total_laba_nota += $laba_per_item;

                    // Simpan Detail
                    DetailTransaksi::create([
                        'transaksi_id' => $transaksi->id,
                        'produk_id' => $produkDb->id,
                        'qty' => $item['qty'],
                        'harga_modal' => $harga_modal_final,
                        'harga_jual' => $harga_jual_final,
                        'subtotal' => $harga_jual_final * $item['qty'],
                        'laba' => $laba_per_item
                    ]);
                }

                $transaksi->update(['total_laba' => $total_laba_nota]);
            });

            return redirect()->back()->with('success', 'Transaksi berhasil!');

        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    public function history(Request $request)
    {
        Gate::authorize('view history');
        
        $query = Transaksi::with(['user', 'details.produk', 'hutang'])
            ->latest(); // Urutkan created_at desc

        if ($request->filled('provider_id')) {
            $query->whereHas('details.produk', function($q) use ($request) {
                $q->where('provider_id', $request->provider_id);
            });
        }

        if ($request->filled('jenis')) {
            $query->whereHas('details.produk', function($q) use ($request) {
                $q->where('jenis', $request->jenis);
            });
        }

        $transaksi = $query->paginate(50)->withQueryString();

        $providers = Provider::all();
        $jenis_produk = Produk::select('jenis')->distinct()->whereNotNull('jenis')->pluck('jenis');

        return Inertia::render('Riwayat/Index', [
            'transaksi' => $transaksi,
            'providers' => $providers,
            'jenis_produk' => $jenis_produk,
            'filters' => $request->only(['provider_id', 'jenis'])
        ]);
    }

    public function print(Transaksi $transaksi)
    {
        Gate::authorize('view transaction');
        
        // Load relasi user dan details produk
        $transaksi->load(['user', 'details.produk']);

        return Inertia::render('Transaksi/Print', [
            'transaksi' => $transaksi
        ]);
    }

    public function destroy(Transaksi $transaksi)
    {
        Gate::authorize('delete history');
        
        $transaksi->delete();
        return redirect()->back();
    }
}
