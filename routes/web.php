<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ProviderController;
use App\Http\Controllers\ProdukController;
use App\Http\Controllers\TransaksiController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\HutangController;
use App\Http\Controllers\LaporanController;
use App\Http\Controllers\SettingController;
use App\Http\Controllers\RoleController;

// Route::get('/', function () {
//     return Inertia::render('Welcome', [
//         'canLogin' => Route::has('login'),
//         'canRegister' => Route::has('register'),
//         'laravelVersion' => Application::VERSION,
//         'phpVersion' => PHP_VERSION,
//     ]);
// });

// KODE BARU
Route::get('/', function () {
    return redirect()->route('login');
});

// Route::get('/dashboard', function () {
//     return Inertia::render('Dashboard');
// })->middleware(['auth', 'verified'])->name('dashboard');

Route::get('/dashboard', [DashboardController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    Route::resource('providers', ProviderController::class);
    Route::post('/providers/{provider}/add-saldo', [ProviderController::class, 'addSaldo'])->name('providers.add_saldo');
    Route::resource('produk', ProdukController::class);
    Route::post('/produk/{produk}/add-stock', [ProdukController::class, 'addStock'])->name('produk.add_stock');
    Route::post('/produk/inject', [ProdukController::class, 'injectVoucher'])->name('produk.inject');
    Route::get('/transaksi', [TransaksiController::class, 'index'])->name('transaksi.index');
    Route::post('/transaksi', [TransaksiController::class, 'store'])->name('transaksi.store');
    Route::get('/riwayat-transaksi', [TransaksiController::class, 'history'])->name('riwayat.index');
    Route::delete('/transaksi/{transaksi}', [TransaksiController::class, 'destroy'])->name('transaksi.destroy');
    Route::get('/transaksi/{transaksi}/print', [TransaksiController::class, 'print'])->name('transaksi.print');
    Route::resource('users', UserController::class);
    Route::get('/hutang', [HutangController::class, 'index'])->name('hutang.index');
    Route::post('/hutang', [HutangController::class, 'store'])->name('hutang.store');
    Route::post('/hutang/{hutang}/cicil', [HutangController::class, 'cicil'])->name('hutang.cicil'); // Route khusus bayar
    Route::delete('/hutang/{hutang}', [HutangController::class, 'destroy'])->name('hutang.destroy');
    Route::put('/produk/{produk}/pin', [ProdukController::class, 'togglePin'])->name('produk.pin');
    Route::put('/produk/{produk}/archive', [ProdukController::class, 'toggleArchive'])->name('produk.archive');
    Route::get('/laporan', [LaporanController::class, 'index'])->name('laporan.index');
    Route::get('/laporan/export', [LaporanController::class, 'exportPdf'])->name('laporan.export');
    Route::get('/settings', [SettingController::class, 'index'])->name('settings.index');
    Route::post('/settings', [SettingController::class, 'update'])->name('settings.update');
    Route::get('/settings/wa', [SettingController::class, 'wa'])->name('settings.wa');
    Route::post('/settings/wa', [SettingController::class, 'updateWa'])->name('settings.wa.update');
    Route::post('/settings/wa/test', [SettingController::class, 'testWa'])->name('settings.wa.test');
    Route::post('/settings/wa/alert', [SettingController::class, 'updateAlertSetting'])->name('settings.wa.alert');
    Route::post('/settings/wa/alert/manual', [SettingController::class, 'sendManualAlert'])->name('settings.wa.alert.manual');
    Route::post('/settings/wa/laporan', [SettingController::class, 'updateLaporanWaSetting'])->name('settings.wa.laporan');
    Route::post('/settings/wa/laporan/manual/{periode}', [SettingController::class, 'sendManualLaporan'])->name('settings.wa.laporan.manual');
    Route::resource('roles', RoleController::class)->except(['create', 'edit', 'show']);
    Route::resource('kategori', \App\Http\Controllers\KategoriController::class)->except(['create', 'edit', 'show']);
});

require __DIR__.'/auth.php';
