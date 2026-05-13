<?php

namespace App\Http\Controllers;

use App\Models\Hutang;
use App\Models\RiwayatCicilan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Illuminate\Support\Facades\Gate;

class HutangController extends Controller
{
    public function index(Request $request)
    {
        Gate::authorize('view debt');
        
        $search = $request->input('search');

        // Tampilkan hutang yang belum lunas di atas
        $hutangs = Hutang::with(['cicilan', 'riwayatHutang'])
            ->when($search, function ($query, $search) {
                $query->where('nama_pelanggan', 'like', "%{$search}%")
                    ->orWhere('keterangan', 'like', "%{$search}%")
                    ->orWhere('no_hp', 'like', "%{$search}%");
            })
            ->orderByRaw("FIELD(status, 'belum_lunas', 'lunas')")
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Hutang/Index', [
            'hutangs' => $hutangs,
            'filters' => $request->only(['search'])
        ]);
    }

    public function store(Request $request)
    {
        Gate::authorize('create debt');
        
        // Tambah Hutang Baru Manual
        $validated = $request->validate([
            'nama_pelanggan' => 'required|string',
            'total_hutang' => 'required|numeric|min:1',
            'keterangan' => 'nullable|string',
            'no_hp' => 'nullable|string',
            'jatuh_tempo' => 'nullable|date',
        ]);

        $existingHutang = Hutang::where('nama_pelanggan', $validated['nama_pelanggan'])
            ->first();

        if ($existingHutang) {
            $existingHutang->update([
                'total_hutang' => $existingHutang->total_hutang + $validated['total_hutang'],
                'sisa' => $existingHutang->sisa + $validated['total_hutang'],
                'keterangan' => $existingHutang->keterangan . ($validated['keterangan'] ? ' | ' . $validated['keterangan'] : ''),
                'no_hp' => $validated['no_hp'] ?? $existingHutang->no_hp,
                'jatuh_tempo' => $validated['jatuh_tempo'] ?? $existingHutang->jatuh_tempo,
                'status' => 'belum_lunas',
            ]);

            \App\Models\RiwayatHutang::create([
                'hutang_id' => $existingHutang->id,
                'nominal_hutang' => $validated['total_hutang'],
                'keterangan' => $validated['keterangan'] ?? 'Penambahan hutang manual',
            ]);
        } else {
            $validated['sisa'] = $validated['total_hutang'];
            $validated['status'] = 'belum_lunas';
            $newHutang = Hutang::create($validated);

            \App\Models\RiwayatHutang::create([
                'hutang_id' => $newHutang->id,
                'nominal_hutang' => $validated['total_hutang'],
                'keterangan' => $validated['keterangan'] ?? 'Hutang awal',
            ]);
        }
        return redirect()->back()->with('success', 'Data hutang dicatat.');
    }

    public function cicil(Request $request, Hutang $hutang)
    {
        Gate::authorize('pay debt');
        
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
        Gate::allowIf(fn($user) => $user->hasRole('owner'));
        
        $hutang->delete();
        return redirect()->back()->with('success', 'Data dihapus.');
    }
}
