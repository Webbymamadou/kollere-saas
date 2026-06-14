<?php

namespace App\Http\Controllers;

use App\Models\Driver;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Str;

class DriverController extends Controller
{
    /**
     * Liste des chauffeurs de l'utilisateur (filtrée automatiquement via TenantScope)
     */
    public function index()
    {
        $drivers = Driver::with('vehicle')->get();
        return response()->json($drivers);
    }

    /**
     * Ajouter un chauffeur
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:100',
            'phone' => 'required|string|unique:drivers,phone|max:20',
            'pin_code' => 'required|string|size:4|regex:/^[0-9]+$/',
            'status' => ['nullable', Rule::in(['active', 'inactive'])],
            'vehicle_id' => 'nullable|uuid|exists:vehicles,id',
        ]);

        $data = $request->all();
        // Générer un magic token de connexion WhatsApp
        $data['magic_token'] = 'mt_' . strtolower(Str::random(16));

        $driver = Driver::create($data);

        return response()->json($driver, 201);
    }

    /**
     * Détail d'un chauffeur
     */
    public function show($id)
    {
        $driver = Driver::with(['vehicle', 'incidents', 'auditLogs'])->findOrFail($id);
        return response()->json($driver);
    }

    /**
     * Mettre à jour un chauffeur
     */
    public function update(Request $request, $id)
    {
        $driver = Driver::findOrFail($id);

        $request->validate([
            'name' => 'sometimes|required|string|max:100',
            'phone' => ['sometimes', 'required', 'string', 'max:20', Rule::unique('drivers')->ignore($driver->id)],
            'pin_code' => 'sometimes|required|string|size:4|regex:/^[0-9]+$/',
            'status' => ['sometimes', 'required', Rule::in(['active', 'inactive'])],
            'vehicle_id' => 'nullable|uuid|exists:vehicles,id',
        ]);

        $driver->update($request->all());

        return response()->json($driver);
    }

    /**
     * Supprimer un chauffeur
     */
    public function destroy($id)
    {
        $driver = Driver::findOrFail($id);
        $driver->delete();

        return response()->json(null, 204);
    }
}
