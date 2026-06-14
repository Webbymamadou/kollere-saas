<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\Maintenance;
use App\Models\Vehicle;
use Illuminate\Validation\Rule;

class MaintenanceController extends Controller
{
    /**
     * Historique de maintenance (vidanges, freins, etc.)
     */
    public function index()
    {
        $maintenances = Maintenance::with('vehicle')->orderBy('maintenance_date', 'desc')->get();
        return response()->json($maintenances);
    }

    /**
     * Enregistrer une nouvelle intervention
     */
    public function store(Request $request)
    {
        $request->validate([
            'vehicle_id' => 'required|uuid|exists:vehicles,id',
            'type' => ['required', Rule::in(['oil_change', 'brakes', 'tires', 'engine', 'other'])],
            'mileage_at_maintenance' => 'required|integer|min:0',
            'cost' => 'required|numeric|min:0',
            'maintenance_date' => 'required|date',
            'description' => 'nullable|string',
        ]);

        $vehicle = Vehicle::findOrFail($request->vehicle_id);

        // Vérifier que le kilométrage de maintenance n'est pas supérieur au kilométrage actuel du véhicule
        // (On accepte qu'il soit légèrement supérieur au cas où le chauffeur a continué à rouler, mais restons cohérents)
        if ($request->mileage_at_maintenance > $vehicle->current_mileage) {
            // Optionnel : Mettre à jour le kilométrage actuel du véhicule s'il est supérieur
            $vehicle->update(['current_mileage' => $request->mileage_at_maintenance]);
        }

        $maintenance = Maintenance::create($request->all());

        // Si c'est une vidange, mettre à jour le kilométrage de la dernière vidange du véhicule
        if ($request->type === 'oil_change') {
            if ($request->mileage_at_maintenance >= $vehicle->last_oil_change_mileage) {
                $vehicle->update(['last_oil_change_mileage' => $request->mileage_at_maintenance]);
            }
        }

        return response()->json($maintenance, 201);
    }

    /**
     * Détails d'une intervention
     */
    public function show($id)
    {
        $maintenance = Maintenance::with('vehicle')->findOrFail($id);
        return response()->json($maintenance);
    }

    /**
     * Mettre à jour une intervention
     */
    public function update(Request $request, $id)
    {
        $maintenance = Maintenance::findOrFail($id);

        $request->validate([
            'type' => ['sometimes', 'required', Rule::in(['oil_change', 'brakes', 'tires', 'engine', 'other'])],
            'mileage_at_maintenance' => 'sometimes|required|integer|min:0',
            'cost' => 'sometimes|required|numeric|min:0',
            'maintenance_date' => 'sometimes|required|date',
            'description' => 'nullable|string',
        ]);

        $maintenance->update($request->all());

        // Si le type a été changé ou mis à jour en vidange
        if ($maintenance->type === 'oil_change') {
            $vehicle = $maintenance->vehicle;
            if ($vehicle && $maintenance->mileage_at_maintenance >= $vehicle->last_oil_change_mileage) {
                $vehicle->update(['last_oil_change_mileage' => $maintenance->mileage_at_maintenance]);
            }
        }

        return response()->json($maintenance);
    }

    /**
     * Supprimer une intervention
     */
    public function destroy($id)
    {
        $maintenance = Maintenance::findOrFail($id);
        $maintenance->delete();

        return response()->json(null, 204);
    }
}
