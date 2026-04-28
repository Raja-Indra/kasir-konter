<?php

namespace App\Http\Controllers;

use App\Models\DetailTransaksi;
use App\Models\Transaksi;
use App\Models\Produk;
use App\Models\Provider;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $today = Carbon::today();
        $filter = $request->query('filter', 'minggu_ini'); // Default 7 hari terakhir

        // 1. STATISTIK HARI INI
        $stats = [
            'omzet_hari_ini' => Transaksi::whereDate('created_at', $today)->sum('total_harga'),
            'laba_hari_ini'  => Transaksi::whereDate('created_at', $today)->sum('total_laba'),
            'transaksi_hari_ini' => Transaksi::whereDate('created_at', $today)->count(),
            'total_sisa_hutang' => \App\Models\Hutang::sum('sisa'), // Total uang nyangkut di pelanggan
        ];

        // 2. GRAFIK OMZET BERDASARKAN FILTER
        $chartData = ['labels' => [], 'data' => []];

        if ($filter === 'hari_ini') {
            // 24 Jam hari ini
            for ($i = 0; $i < 24; $i++) {
                $chartData['labels'][] = str_pad($i, 2, '0', STR_PAD_LEFT) . ':00';
                $chartData['data'][] = Transaksi::whereDate('created_at', $today->toDateString())
                    ->whereRaw('HOUR(created_at) = ?', [$i])
                    ->sum('total_harga');
            }
        } elseif ($filter === 'minggu_ini') {
            // 7 Hari terakhir
            for ($i = 6; $i >= 0; $i--) {
                $date = Carbon::today()->subDays($i);
                $chartData['labels'][] = $date->format('d M');
                $chartData['data'][] = Transaksi::whereDate('created_at', $date->toDateString())->sum('total_harga');
            }
        } elseif ($filter === 'bulan_ini') {
            // Per minggu dalam bulan ini
            $startOfMonth = Carbon::now()->startOfMonth();
            $endOfMonth = Carbon::now()->endOfMonth();
            
            $currentWeekStart = $startOfMonth->copy();
            $weekNumber = 1;
            
            while ($currentWeekStart <= $endOfMonth) {
                $currentWeekEnd = $currentWeekStart->copy()->addDays(6);
                if ($currentWeekEnd > $endOfMonth) {
                    $currentWeekEnd = $endOfMonth->copy();
                }
                
                $chartData['labels'][] = "Minggu " . $weekNumber;
                $chartData['data'][] = Transaksi::whereBetween('created_at', [
                    $currentWeekStart->copy()->startOfDay(),
                    $currentWeekEnd->copy()->endOfDay()
                ])->sum('total_harga');
                
                $currentWeekStart->addDays(7);
                $weekNumber++;
            }
        } elseif ($filter === 'tahun_ini') {
            // 12 Bulan dalam 1 tahun terakhir (12 bulan ke belakang)
            for ($i = 11; $i >= 0; $i--) {
                $date = Carbon::now()->startOfMonth()->subMonths($i);
                $chartData['labels'][] = $date->format('M Y');
                $chartData['data'][] = Transaksi::whereYear('created_at', $date->year)
                    ->whereMonth('created_at', $date->month)
                    ->sum('total_harga');
            }
        } elseif ($filter === '5_tahun') {
            // 5 Tahun terakhir
            for ($i = 4; $i >= 0; $i--) {
                $year = Carbon::now()->subYears($i)->year;
                $chartData['labels'][] = $year;
                $chartData['data'][] = Transaksi::whereYear('created_at', $year)->sum('total_harga');
            }
        }

        // 3. 5 PRODUK TERLARIS BULAN INI
        $topProduk = DetailTransaksi::with('produk')
            ->select('produk_id', DB::raw('SUM(qty) as total_qty'))
            ->whereMonth('created_at', Carbon::now()->month)
            ->groupBy('produk_id')
            ->orderByDesc('total_qty')
            ->limit(5)
            ->get();

        // 4. PERINGATAN STOK TIPIS (Produk Fisik <= 5)
        $lowStockProducts = Produk::where('is_digital', false)
            ->where('stok', '<=', 5)
            ->orderBy('stok', 'asc')
            ->limit(5)
            ->get();

        // 5. PERINGATAN SALDO PROVIDER MENIPIS (<= 50000)
        $lowBalanceProviders = Provider::where('saldo', '<=', 50000)
            ->orderBy('saldo', 'asc')
            ->get();

        // 6. 5 TRANSAKSI TERAKHIR HARI INI
        $recentTransactions = Transaksi::with('user')
            ->whereDate('created_at', $today)
            ->latest()
            ->limit(5)
            ->get();

        return Inertia::render('Dashboard', [
            'stats' => $stats,
            'chart' => $chartData,
            'current_filter' => $filter,
            'top_produk' => $topProduk,
            'low_stock' => $lowStockProducts,
            'low_balance' => $lowBalanceProviders,
            'recent_transactions' => $recentTransactions
        ]);
    }
}
