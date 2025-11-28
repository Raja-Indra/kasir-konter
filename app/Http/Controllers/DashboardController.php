<?php

namespace App\Http\Controllers;

use App\Models\DetailTransaksi;
use App\Models\Transaksi;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $today = Carbon::today();

        // 1. STATISTIK HARI INI
        $stats = [
            'omzet_hari_ini' => Transaksi::whereDate('created_at', $today)->sum('total_harga'),
            'laba_hari_ini'  => Transaksi::whereDate('created_at', $today)->sum('total_laba'),
            'transaksi_hari_ini' => Transaksi::whereDate('created_at', $today)->count(),
            'total_sisa_hutang' => \App\Models\Hutang::sum('sisa'), // Total uang nyangkut di pelanggan
        ];

        // 2. GRAFIK 7 HARI TERAKHIR
        // Kita butuh array tanggal dan array total omzet
        $chartData = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = Carbon::today()->subDays($i);
            $chartData['labels'][] = $date->format('d M'); // Contoh: 25 Nov
            $chartData['data'][] = Transaksi::whereDate('created_at', $date)->sum('total_harga');
        }

        // 3. 5 PRODUK TERLARIS BULAN INI
        $topProduk = DetailTransaksi::with('produk')
            ->select('produk_id', DB::raw('SUM(qty) as total_qty'))
            ->whereMonth('created_at', Carbon::now()->month)
            ->groupBy('produk_id')
            ->orderByDesc('total_qty')
            ->limit(5)
            ->get();

        return Inertia::render('Dashboard', [
            'stats' => $stats,
            'chart' => $chartData,
            'top_produk' => $topProduk
        ]);
    }
}
