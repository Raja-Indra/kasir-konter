<?php

namespace App\Http\Controllers;

use App\Models\Transaksi;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;

class LaporanController extends Controller
{
    public function index(Request $request)
    {
        // Default: Tanggal hari ini
        $startDate = $request->input('start_date', Carbon::today()->toDateString());
        $endDate = $request->input('end_date', Carbon::today()->toDateString());

        // Query Data
        $transaksi = Transaksi::with('user')
            ->whereDate('created_at', '>=', $startDate)
            ->whereDate('created_at', '<=', $endDate)
            ->latest()
            ->get();

        // Hitung Summary untuk ditampilkan di kartu atas
        $summary = [
            'total_omzet' => $transaksi->sum('total_harga'),
            'total_laba' => $transaksi->sum('total_laba'),
            'total_transaksi' => $transaksi->count(),
        ];

        return Inertia::render('Laporan/Index', [
            'transaksi' => $transaksi,
            'summary' => $summary,
            'filters' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
            ]
        ]);
    }

    public function exportPdf(Request $request)
    {
        $startDate = $request->input('start_date', Carbon::today()->toDateString());
        $endDate = $request->input('end_date', Carbon::today()->toDateString());

        $transaksi = Transaksi::with('user')
            ->whereDate('created_at', '>=', $startDate)
            ->whereDate('created_at', '<=', $endDate)
            ->latest() // Biasanya laporan urut tanggal, bisa diubah ->oldest()
            ->get();

        $totalOmzet = $transaksi->sum('total_harga');
        $totalLaba = $transaksi->sum('total_laba');

        // Load View PDF (Blade)
        $pdf = Pdf::loadView('pdf.laporan_penjualan', compact('transaksi', 'startDate', 'endDate', 'totalOmzet', 'totalLaba'));

        // Setup Ukuran Kertas (A4 Portrait)
        $pdf->setPaper('a4', 'portrait');

        return $pdf->stream('Laporan-Penjualan.pdf');
    }
}
