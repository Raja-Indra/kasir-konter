<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Produk;
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
    protected $description = 'Kirim notifikasi stok menipis ke WhatsApp via Fonnte';

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

        // Ambil produk fisik yang stoknya <= 5
        $produkMenipis = Produk::where('is_digital', false)
            ->where('stok', '<=', 2)
            ->orderBy('stok', 'asc')
            ->get();

        if ($produkMenipis->isEmpty()) {
            $this->info('Tidak ada stok produk yang menipis.');
            return 0; // Tidak perlu kirim kalau stok aman
        }

        // Susun Pesan
        $pesan = "⚠️ *Peringatan Stok Menipis* ⚠️\n\nBerikut adalah daftar produk yang stoknya sudah sedikit atau dibawah 3 pcs:\n\n";
        
        foreach ($produkMenipis as $index => $p) {
            $pesan .= ($index + 1) . ". {$p->nama_produk} - *Sisa: {$p->stok}*\n";
        }

        $pesan .= "\nMohon segera lakukan restock untuk menghindari kehabisan produk. Terima kasih.\n- _Indra Cellular_";

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
