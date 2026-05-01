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
            'saldo' => 'nullable|numeric',
            'is_digital' => 'boolean',
        ]);

        if (!$request->boolean('is_digital')) {
            $validated['saldo'] = 0;
        } else {
            $validated['saldo'] = $validated['saldo'] ?? 0;
        }

        Provider::create($validated);

        return redirect()->back();
    }

    public function update(Request $request, Provider $provider)
    {
        $validated = $request->validate([
            'nama_provider' => 'required|string|max:255',
            'saldo' => 'nullable|numeric',
            'is_digital' => 'boolean',
        ]);

        if (!$request->boolean('is_digital')) {
            $validated['saldo'] = 0;
        } else {
            $validated['saldo'] = $validated['saldo'] ?? 0;
        }

        $provider->update($validated);

        return redirect()->back();
    }

    public function addSaldo(Request $request, Provider $provider)
    {
        $validated = $request->validate([
            'tambah_saldo' => 'required|numeric|min:1',
        ]);

        $provider->increment('saldo', $validated['tambah_saldo']);

        return redirect()->back();
    }

    public function destroy(Provider $provider)
    {
        $provider->delete();
        return redirect()->back();
    }
}
