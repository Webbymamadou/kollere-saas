<?php

namespace App\Http\Controllers;

use App\Models\Vehicle;
use App\Models\Payment;
use App\Models\Maintenance;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class VehicleController extends Controller
{
    /**
     * Liste des véhicules de l'utilisateur (filtrée automatiquement par TenantScope)
     */
    public function index()
    {
        $vehicles = Vehicle::with(['driver', 'documents'])->get();
        return response()->json($vehicles);
    }

    /**
     * Ajouter un véhicule
     */
    public function store(Request $request)
    {
        $request->validate([
            'license_plate' => 'required|string|unique:vehicles,license_plate|max:20',
            'brand_model' => 'required|string|max:100',
            'current_mileage' => 'required|integer|min:0',
            'last_oil_change_mileage' => 'required|integer|min:0|lte:current_mileage',
            'status' => ['nullable', Rule::in(['active', 'broken', 'maintenance'])],
        ], [
            'last_oil_change_mileage.lte' => 'Le kilométrage de la dernière vidange ne peut pas être supérieur au kilométrage actuel.',
        ]);

        $vehicle = Vehicle::create($request->all());

        return response()->json($vehicle, 201);
    }

    /**
     * Détail d'un véhicule
     */
    public function show($id)
    {
        $vehicle = Vehicle::with(['driver', 'documents', 'payments', 'maintenances', 'incidents'])->findOrFail($id);
        return response()->json($vehicle);
    }

    /**
     * Mettre à jour un véhicule
     */
    public function update(Request $request, $id)
    {
        $vehicle = Vehicle::findOrFail($id);

        $request->validate([
            'license_plate' => ['sometimes', 'required', 'string', 'max:20', Rule::unique('vehicles')->ignore($vehicle->id)],
            'brand_model' => 'sometimes|required|string|max:100',
            'current_mileage' => 'sometimes|required|integer|min:0',
            'last_oil_change_mileage' => 'sometimes|required|integer|min:0',
            'status' => ['sometimes', 'required', Rule::in(['active', 'broken', 'maintenance'])],
        ]);

        // Validation croisée si les deux kilométrages sont fournis ou modifiés
        $current = $request->input('current_mileage', $vehicle->current_mileage);
        $lastOil = $request->input('last_oil_change_mileage', $vehicle->last_oil_change_mileage);

        if ($current < $lastOil) {
            return response()->json([
                'errors' => [
                    'last_oil_change_mileage' => ['Le kilométrage de la dernière vidange ne peut pas être supérieur au kilométrage actuel.']
                ]
            ], 422);
        }

        $vehicle->update($request->all());

        return response()->json($vehicle);
    }

    /**
     * Supprimer un véhicule
     */
    public function destroy($id)
    {
        $vehicle = Vehicle::findOrFail($id);
        $vehicle->delete();

        return response()->json(null, 204);
    }

    /**
     * Métriques financières consolidées (Dashboard Propriétaire)
     */
    public function getFinancialMetrics()
    {
        // En raison du TenantScope global, les paiements et maintenances sont automatiquement filtrés par propriétaire
        $totalIncome = (float) Payment::where('status', 'approved')->sum('amount');
        $totalExpenses = (float) Maintenance::sum('cost');
        $netProfit = $totalIncome - $totalExpenses;

        // Gains par véhicule
        $incomeByVehicle = Vehicle::withSum(['payments' => function ($q) {
            $q->where('status', 'approved');
        }], 'amount')->get()->map(function ($v) {
            return [
                'vehicle_id' => $v->id,
                'license_plate' => $v->license_plate,
                'brand_model' => $v->brand_model,
                'amount' => (float) ($v->payments_sum_amount ?? 0),
            ];
        });

        // Dépenses par type de maintenance
        $expensesByType = Maintenance::selectRaw('type, SUM(cost) as total_cost')
            ->groupBy('type')
            ->get()
            ->map(function ($m) {
                return [
                    'type' => $m->type,
                    'cost' => (float) $m->total_cost,
                ];
            });

        return response()->json([
            'total_income' => $totalIncome,
            'total_expenses' => $totalExpenses,
            'net_profit' => $netProfit,
            'income_by_vehicle' => $incomeByVehicle,
            'expenses_by_type' => $expensesByType,
        ]);
    }
}
