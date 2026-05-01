<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;
use App\Models\Setting;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Jadwal untuk alert stok (hanya jika aktif dan mode otomatis)
Schedule::command('app:send-stock-alert')->everyMinute()->when(function () {
    try {
        $aktif = Setting::where('key', 'alert_stok_aktif')->value('value') === '1';
        $mode = Setting::where('key', 'alert_stok_mode')->value('value');
        $jam = Setting::where('key', 'alert_stok_jam')->value('value'); // Format 'HH:MM'
        
        if ($aktif && $mode === 'otomatis' && $jam) {
            // Cek apakah waktu saat ini (jam & menit) cocok dengan pengaturan
            return now()->format('H:i') === $jam;
        }
    } catch (\Exception $e) {
        // Abaikan jika DB belum siap
    }
    return false;
});
