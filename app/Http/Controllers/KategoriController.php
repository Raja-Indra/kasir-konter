<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Kategori;
use Inertia\Inertia;
use Illuminate\Support\Facades\Gate;

class KategoriController extends Controller
{
    public function index()
    {
        Gate::authorize('view categories');
        $kategoris = Kategori::orderBy('nama_kategori')->get();
        return Inertia::render('Kategori/Index', [
            'kategoris' => $kategoris
        ]);
    }

    public function store(Request $request)
    {
        Gate::authorize('create categories');
        $validated = $request->validate([
            'nama_kategori' => 'required|string|max:255|unique:kategoris,nama_kategori',
        ]);

        Kategori::create($validated);
        return redirect()->back();
    }

    public function update(Request $request, Kategori $kategori)
    {
        Gate::authorize('edit categories');
        $validated = $request->validate([
            'nama_kategori' => 'required|string|max:255|unique:kategoris,nama_kategori,' . $kategori->id,
        ]);

        $kategori->update($validated);
        return redirect()->back();
    }

    public function destroy(Kategori $kategori)
    {
        Gate::authorize('delete categories');
        $kategori->delete();
        return redirect()->back();
    }
}
