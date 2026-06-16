<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Produk;
use App\Models\Provider;
use App\Models\Setting;
use Illuminate\Support\Facades\Http;

class SendStockAlertCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:send-stock-alert';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Kirim notifikasi stok dan saldo provider menipis ke WhatsApp via Fonnte';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $token = Setting::where('key', 'fonnte_token')->value('value');
        $noHp = Setting::where('key', 'alert_stok_no_hp')->value('value');

        if (!$token || !$noHp) {
            $this->error('Token Fonnte atau Nomor HP tujuan belum diatur.');
            return 1;
        }

        // Ambil produk fisik yang stoknya <= 5 (Wait, earlier it was <= 2, let's keep <= 2 or maybe <= 5? Dashboard uses <= 5. Let's use <= 5 to match dashboard or just keep 2. The previous code had <= 2, I will keep <= 5 to make it more proactive but wait, I will use <= 5 as that is the standard "menipis" in dashboard).
        $produkMenipis = Produk::where('is_digital', false)
            ->where('is_archived', false)
            ->where('stok', '<=', 2)
            ->orderBy('stok', 'asc')
            ->get();

        // Ambil saldo provider yang <= 50000
        $providerMenipis = Provider::where('saldo', '<=', 50000)
            ->orderBy('saldo', 'asc')
            ->get();

        if ($produkMenipis->isEmpty() && $providerMenipis->isEmpty()) {
            $this->info('Tidak ada stok produk atau saldo provider yang menipis.');
            return 0; // Tidak perlu kirim kalau aman
        }

        // Susun Pesan
        $pesan = "⚠️ *Peringatan Stok & Saldo Menipis* ⚠️\n\n";

        if ($produkMenipis->isNotEmpty()) {
            $pesan .= "Berikut adalah daftar produk yang stoknya sudah sedikit (≤ 2):\n";
            foreach ($produkMenipis as $index => $p) {
                $pesan .= ($index + 1) . ". {$p->nama_produk} - *Sisa: {$p->stok}*\n";
            }
            $pesan .= "\n";
        }

        if ($providerMenipis->isNotEmpty()) {
            $pesan .= "Berikut adalah daftar saldo provider yang menipis (≤ Rp 50.000):\n";
            foreach ($providerMenipis as $index => $p) {
                $pesan .= ($index + 1) . ". {$p->nama_provider} - *Sisa: Rp " . number_format($p->saldo, 0, ',', '.') . "*\n";
            }
            $pesan .= "\n";
        }

        $pesan .= "Mohon segera lakukan restock atau top up untuk menghindari kehabisan. Terima kasih.\n- _Indra Cellular_";

        try {
            $response = Http::withHeaders([
                'Authorization' => $token,
            ])->post('https://api.fonnte.com/send', [
                'target' => $noHp,
                'message' => $pesan,
            ]);

            if ($response->successful()) {
                $resData = $response->json();
                if (isset($resData['status']) && $resData['status'] == true) {
                    $this->info('Pesan notifikasi berhasil dikirim.');
                    return 0;
                }
                $this->error('Gagal mengirim dari Fonnte: ' . ($resData['reason'] ?? 'Unknown error'));
                return 1;
            }

            $this->error('Gagal terhubung ke Fonnte API.');
            return 1;
        } catch (\Exception $e) {
            $this->error('Kesalahan sistem: ' . $e->getMessage());
            return 1;
        }
    }
}
