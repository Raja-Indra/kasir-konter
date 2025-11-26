<?php

namespace App\Http\Controllers;

use App\Models\Provider;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProviderController extends Controller
{
    public function index()
    {
        return Inertia::render('Provider/Index', [
            'providers' => Provider::latest()->get()
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama_provider' => 'required|string|max:255',
            'saldo' => 'required|numeric',
        ]);

        // HAPUS baris manual UUID: $validated['uid'] = ... (Sudah otomatis di Model)

        Provider::create($validated);

        return redirect()->back();
    }

    public function update(Request $request, Provider $provider)
    {
        // Validasi normal
        $validated = $request->validate([
            'nama_provider' => 'required|string|max:255',
            'saldo' => 'required|numeric',
        ]);

        $provider->update($validated);

        return redirect()->back();
    }

    public function destroy(Provider $provider)
    {
        $provider->delete();
        return redirect()->back();
    }
}
