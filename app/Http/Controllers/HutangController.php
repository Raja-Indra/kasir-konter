<?php

namespace App\Http\Controllers;

use App\Models\Hutang;
use App\Models\RiwayatCicilan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class HutangController extends Controller
{
    public function index()
    {
        // Tampilkan hutang yang belum lunas di atas
        $hutangs = Hutang::with('cicilan')
            ->orderByRaw("FIELD(status, 'belum_lunas', 'lunas')")
            ->latest()
            ->paginate(10);

        return Inertia::render('Hutang/Index', [
            'hutangs' => $hutangs
        ]);
    }

    public function store(Request $request)
    {
        // Tambah Hutang Baru Manual
        $validated = $request->validate([
            'nama_pelanggan' => 'required|string',
            'total_hutang' => 'required|numeric|min:1',
            'keterangan' => 'nullable|string',
            'no_hp' => 'nullable|string',
            'jatuh_tempo' => 'nullable|date',
        ]);

        $validated['sisa'] = $validated['total_hutang'];
        $validated['status'] = 'belum_lunas';

        Hutang::create($validated);
        return redirect()->back()->with('success', 'Data hutang dicatat.');
    }

    public function cicil(Request $request, Hutang $hutang)
    {
        // Bayar Cicilan
        $request->validate([
            'nominal' => 'required|numeric|min:1|max:' . $hutang->sisa,
            'catatan' => 'nullable|string'
        ]);

        DB::transaction(function () use ($request, $hutang) {
            // 1. Catat History
            RiwayatCicilan::create([
                'hutang_id' => $hutang->id,
                'nominal_bayar' => $request->nominal,
                'catatan' => $request->catatan
            ]);

            // 2. Update Header Hutang
            $hutang->terbayar += $request->nominal;
            $hutang->sisa -= $request->nominal;

            if ($hutang->sisa <= 0) {
                $hutang->status = 'lunas';
                $hutang->sisa = 0; // Jaga-jaga biar ga minus
            }

            $hutang->save();
        });

        return redirect()->back()->with('success', 'Cicilan berhasil dibayar.');
    }

    public function destroy(Hutang $hutang)
    {
        $hutang->delete();
        return redirect()->back()->with('success', 'Data dihapus.');
    }
}
