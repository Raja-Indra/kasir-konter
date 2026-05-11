<?php

namespace App\Http\Controllers;

use App\Models\Provider;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Gate;

class ProviderController extends Controller
{
    public function index()
    {
        Gate::authorize('view providers');
        
        return Inertia::render('Provider/Index', [
            'providers' => Provider::latest()->get()
        ]);
    }

    public function store(Request $request)
    {
        Gate::authorize('create providers');
        
        $validated = $request->validate([
            'nama_provider' => 'required|string|max:255|unique:providers,nama_provider',
            'saldo' => 'nullable|numeric',
            'is_digital' => 'boolean',
        ], [
            'nama_provider.unique' => 'Nama provider sudah ada, silakan gunakan nama lain.',
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
        Gate::authorize('edit providers');
        
        $validated = $request->validate([
            'nama_provider' => 'required|string|max:255|unique:providers,nama_provider,' . $provider->id,
            'saldo' => 'nullable|numeric',
            'is_digital' => 'boolean',
        ], [
            'nama_provider.unique' => 'Nama provider sudah ada, silakan gunakan nama lain.',
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
        Gate::authorize('edit providers');
        
        $validated = $request->validate([
            'tambah_saldo' => 'required|numeric|min:1',
        ]);

        $provider->increment('saldo', $validated['tambah_saldo']);

        return redirect()->back();
    }

    public function destroy(Provider $provider)
    {
        Gate::authorize('delete providers');
        
        $provider->delete();
        return redirect()->back();
    }
}
