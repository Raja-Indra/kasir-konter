<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Transaksi;
use App\Models\Setting;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class SendLaporanWaCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:send-laporan-wa {periode} {--force : Abaikan pengecekan setting aktif}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Kirim laporan penjualan PDF via WhatsApp';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $periode = $this->argument('periode');
        $force = $this->option('force');

        Log::info("=== Memulai Eksekusi Laporan WA ($periode) ===");
        Log::info("Force mode: " . ($force ? 'TRUE' : 'FALSE'));

        $isMasterActive = Setting::where('key', 'laporan_wa_aktif')->value('value') === '1';

        if (!$isMasterActive && !$force) {
            $msg = "Fitur Laporan WA secara umum sedang dimatikan. Mengabaikan pengiriman.";
            $this->info($msg);
            Log::warning("Laporan WA Dibatalkan: Fitur utama (laporan_wa_aktif) adalah OFF.");
            return 0;
        }

        // Check if enabled based on period
        $settingKey = match($periode) {
            'daily' => 'laporan_wa_harian_aktif',
            'weekly' => 'laporan_wa_mingguan_aktif',
            'monthly' => 'laporan_wa_bulanan_aktif',
            default => null,
        };

        if (!$settingKey) {
            $this->error('Periode tidak valid. Gunakan: daily, weekly, monthly.');
            Log::error("Laporan WA Gagal: Periode yang diberikan ($periode) tidak valid.");
            return 1;
        }

        $isActive = Setting::where('key', $settingKey)->value('value') === '1';

        if (!$isActive && !$force) {
            $msg = "Pengaturan laporan $periode sedang tidak aktif. Mengabaikan pengiriman.";
            $this->info($msg);
            Log::warning("Laporan WA Dibatalkan: Fitur periode ($settingKey) adalah OFF.");
            return 0;
        }

        $token = Setting::where('key', 'fonnte_token')->value('value');
        $noHp = Setting::where('key', 'laporan_wa_no_hp')->value('value');

        if (!$token || !$noHp) {
            $msg = 'Token Fonnte atau Nomor HP Tujuan Laporan belum diatur.';
            $this->error($msg);
            Log::error("Laporan WA Gagal: Token Fonnte atau No HP Kosong.");
            return 1;
        }

        // Tentukan Range Tanggal
        $now = Carbon::now();
        switch ($periode) {
            case 'daily':
                $startDate = $now->copy()->startOfDay();
                $endDate = $now->copy()->endOfDay();
                $periodeText = 'Harian (' . $now->translatedFormat('d F Y') . ')';
                $filename = 'Laporan_Harian_' . $now->format('Y-m-d') . '.pdf';
                break;
            case 'weekly':
                $startDate = $now->copy()->startOfWeek();
                $endDate = $now->copy()->endOfWeek();
                $periodeText = 'Mingguan (' . $startDate->translatedFormat('d F Y') . ' - ' . $endDate->translatedFormat('d F Y') . ')';
                $filename = 'Laporan_Mingguan_' . $now->format('Y-m-d') . '.pdf';
                break;
            case 'monthly':
                $startDate = $now->copy()->startOfMonth();
                $endDate = $now->copy()->endOfMonth();
                $periodeText = 'Bulanan (' . $now->translatedFormat('F Y') . ')';
                $filename = 'Laporan_Bulanan_' . $now->format('Y-m') . '.pdf';
                break;
        }

        Log::info("Mengumpulkan transaksi untuk periode: $periodeText");

        // Ambil Data Transaksi
        $transaksi = Transaksi::with(['user', 'hutang'])
            ->whereDate('created_at', '>=', $startDate->toDateString())
            ->whereDate('created_at', '<=', $endDate->toDateString())
            ->latest()
            ->get();

        $totalOmzet = $transaksi->sum('total_harga');
        $totalLabaBersih = $transaksi->filter(fn($t) => !$t->hutang)->sum('total_laba');
        $totalLabaHutang = $transaksi->filter(fn($t) => $t->hutang)->sum('total_laba');

        if ($transaksi->isEmpty() && !$force) {
            $msg = "Tidak ada transaksi pada periode $periodeText. Mengabaikan pengiriman.";
            $this->info($msg);
            Log::info("Laporan WA Dibatalkan: " . $msg);
            return 0;
        }

        // Generate PDF
        $startDateStr = $startDate->toDateString();
        $endDateStr = $endDate->toDateString();
        
        $pdf = Pdf::loadView('pdf.laporan_penjualan', compact('transaksi', 'startDate', 'endDate', 'totalOmzet', 'totalLabaBersih', 'totalLabaHutang', 'startDateStr', 'endDateStr'));
        $pdf->setPaper('a4', 'portrait');

        // Pastikan folder temp ada di disk public
        if (!Storage::disk('public')->exists('temp')) {
            Storage::disk('public')->makeDirectory('temp');
        }

        $pdfPath = storage_path('app/public/temp/' . $filename);
        
        try {
            $pdf->save($pdfPath);
            Log::info("File PDF sementara berhasil dibuat: $pdfPath");
        } catch (\Exception $e) {
            Log::error("Gagal membuat/menyimpan file PDF: " . $e->getMessage());
            $this->error("Gagal menyimpan PDF.");
            return 1;
        }

        // Susun Pesan
        $pesan = "*Laporan Penjualan $periodeText*\n\n";
        $pesan .= "Total Transaksi: *" . $transaksi->count() . "*\n";
        $pesan .= "Total Omzet: *Rp " . number_format($totalOmzet, 0, ',', '.') . "*\n";
        $pesan .= "Laba Bersih: *Rp " . number_format($totalLabaBersih, 0, ',', '.') . "*\n";
        $pesan .= "Laba dari Hutang (Belum Lunas): *Rp " . number_format($totalLabaHutang, 0, ',', '.') . "*\n\n";
        $pesan .= "Detail lengkap dapat dilihat pada dokumen PDF yang dilampirkan.\n\n_Terima kasih_\n*- Indra Cellular -*";

        // Beri jeda 5 detik agar tidak berbenturan dengan command notifikasi stok (Fonnte rate limit prevention)
        sleep(5);

        Log::info("Mencoba mengirim request HTTP ke API Fonnte...");

        try {
            $response = Http::withHeaders([
                'Authorization' => $token,
            ])
            ->attach(
                'file', file_get_contents($pdfPath), $filename
            )
            ->post('https://api.fonnte.com/send', [
                'target' => $noHp,
                'message' => $pesan,
            ]);

            // Hapus file temp setelah proses request selesai
            if (file_exists($pdfPath)) {
                unlink($pdfPath);
                Log::info("File PDF sementara telah dihapus.");
            }

            if ($response->successful()) {
                $resData = $response->json();
                if (isset($resData['status']) && $resData['status'] == true) {
                    $this->info('Laporan PDF berhasil dikirim ke WhatsApp.');
                    Log::info("Sukses! Laporan WA berhasil dikirim ke Fonnte.");
                    return 0;
                }
                $errorMsg = 'Gagal mengirim dari Fonnte: ' . ($resData['reason'] ?? 'Unknown error');
                $this->error($errorMsg);
                Log::error('SendLaporanWaCommand API Error: ' . $errorMsg, ['response' => $resData]);
                return 1;
            }

            $errorMsg = 'Gagal terhubung ke Fonnte API. Status: ' . $response->status();
            $this->error($errorMsg);
            Log::error('SendLaporanWaCommand HTTP Error: ' . $errorMsg, ['body' => $response->body()]);
            return 1;
        } catch (\Exception $e) {
            // Pastikan file temp terhapus meski terjadi exception
            if (isset($pdfPath) && file_exists($pdfPath)) {
                unlink($pdfPath);
            }
            $this->error('Kesalahan sistem saat mengirim laporan: ' . $e->getMessage());
            Log::error('SendLaporanWaCommand Exception: ' . $e->getMessage(), ['trace' => $e->getTraceAsString()]);
            return 1;
        }
    }
}
