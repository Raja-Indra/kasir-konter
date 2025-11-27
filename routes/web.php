<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

use App\Http\Controllers\ProviderController;
use App\Http\Controllers\ProdukController;
use App\Http\Controllers\TransaksiController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\HutangController;

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

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    Route::resource('providers', ProviderController::class);
    Route::resource('produk', ProdukController::class);
    Route::get('/transaksi', [TransaksiController::class, 'index'])->name('transaksi.index');
    Route::post('/transaksi', [TransaksiController::class, 'store'])->name('transaksi.store');
    Route::get('/riwayat-transaksi', [TransaksiController::class, 'history'])->name('riwayat.index');
    Route::get('/transaksi/{transaksi}/print', [TransaksiController::class, 'print'])->name('transaksi.print');
    Route::resource('users', UserController::class);
    Route::get('/hutang', [HutangController::class, 'index'])->name('hutang.index');
    Route::post('/hutang', [HutangController::class, 'store'])->name('hutang.store');
    Route::post('/hutang/{hutang}/cicil', [HutangController::class, 'cicil'])->name('hutang.cicil'); // Route khusus bayar
    Route::delete('/hutang/{hutang}', [HutangController::class, 'destroy'])->name('hutang.destroy');
    Route::put('/produk/{produk}/pin', [ProdukController::class, 'togglePin'])->name('produk.pin');
});

require __DIR__.'/auth.php';
