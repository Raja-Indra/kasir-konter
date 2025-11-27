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

class TransaksiController extends Controller
{
    public function index()
    {
        // Kita kirim data produk untuk ditampilkan di katalog kasir
        return Inertia::render('Transaksi/Index', [
            'products' => Produk::query()
                ->orderBy('is_pinned', 'desc') 
                ->latest()
                ->get()
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'cart' => 'required|array|min:1',
            'bayar' => 'required|numeric',
            'total_harga' => 'required|numeric',
        ]);

        try {
            DB::transaction(function () use ($request) {
                $no_nota = 'TRX-' . date('Ymd-His');
                $kembalian = $request->bayar - $request->total_harga;
                $total_laba_nota = 0;

                if ($kembalian < 0) throw new \Exception('Uang pembayaran kurang!');

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
                        $harga_modal_final = $produkDb->harga_modal;
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

                        // Cek Saldo Cukup?
                        if ($provider->saldo < $total_modal_dibutuhkan) {
                            throw new \Exception("Saldo Provider {$provider->nama_provider} Kurang! Sisa: " . number_format($provider->saldo));
                        }

                        // Potong Saldo
                        $provider->decrement('saldo', $total_modal_dibutuhkan);

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

    public function history()
    {
        // Ambil data transaksi, urutkan dari yang terbaru
        // 'details.produk' = Eager Loading (biar hemat query database)
        $transaksi = Transaksi::with(['user', 'details.produk'])
            ->latest() // Urutkan created_at desc
            ->paginate(10); // Tampilkan 10 per halaman

        return Inertia::render('Riwayat/Index', [
            'transaksi' => $transaksi
        ]);
    }

    public function print(Transaksi $transaksi)
    {
        // Load relasi user dan details produk
        $transaksi->load(['user', 'details.produk']);

        return Inertia::render('Transaksi/Print', [
            'transaksi' => $transaksi
        ]);
    }
}
