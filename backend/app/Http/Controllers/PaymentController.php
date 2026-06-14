<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use App\Models\Vehicle;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class PaymentController extends Controller
{
    /**
     * Liste des versements (filtrée automatiquement via TenantScope)
     */
    public function index()
    {
        $payments = Payment::with(['vehicle.driver'])->orderBy('created_at', 'desc')->get();
        return response()->json($payments);
    }

    /**
     * Soumission d'un versement par le chauffeur
     */
    public function store(Request $request)
    {
        $driver = auth()->user();

        // S'assurer que c'est un chauffeur connecté
        if (!($driver instanceof \App\Models\Driver)) {
            return response()->json(['message' => 'Seuls les chauffeurs peuvent déclarer un versement.'], 403);
        }

        // Récupérer le véhicule du chauffeur
        $vehicle = $driver->vehicle;
        if (!$vehicle) {
            return response()->json(['message' => 'Aucun véhicule n\'est assigné à votre compte.'], 400);
        }

        $request->validate([
            'amount' => 'required|numeric|min:0',
            'transaction_reference' => 'required|string|unique:payments,transaction_reference|max:100',
            'odometer' => 'required|integer|min:0',
            'receipt_image_url' => 'nullable|string|max:255',
        ], [
            'transaction_reference.unique' => 'Cette référence de transaction a déjà été soumise.',
        ]);

        // Vérification de la cohérence kilométrique croissante
        if ($request->odometer < $vehicle->current_mileage) {
            return response()->json([
                'errors' => [
                    'odometer' => ["Le kilométrage saisi ({$request->odometer} km) ne peut pas être inférieur au kilométrage actuel du véhicule ({$vehicle->current_mileage} km)."]
                ]
            ], 422);
        }

        // Créer le paiement en attente (pending)
        $payment = Payment::create([
            'vehicle_id' => $vehicle->id,
            'payment_date' => now()->toDateString(),
            'amount' => $request->amount,
            'status' => 'pending',
            'transaction_reference' => $request->transaction_reference,
            'receipt_image_url' => $request->receipt_image_url,
            'odometer' => $request->odometer,
            'submitted_at' => now(),
        ]);

        // Loguer l'audit
        AuditLog::create([
            'driver_id' => $driver->id,
            'type' => 'payment_declared',
            'details' => "Déclaration versement de {$request->amount} FCFA (Réf: {$request->transaction_reference}) par {$driver->name}",
            'ip_address' => $request->ip(),
        ]);

        return response()->json($payment, 201);
    }

    /**
     * Détail d'un paiement
     */
    public function show($id)
    {
        $payment = Payment::with(['vehicle.driver'])->findOrFail($id);
        return response()->json($payment);
    }

    /**
     * Approbation par le propriétaire
     */
    public function approve($id)
    {
        $payment = Payment::findOrFail($id);

        if ($payment->status !== 'pending') {
            return response()->json(['message' => 'Ce versement a déjà été traité.'], 400);
        }

        $vehicle = $payment->vehicle;
        if (!$vehicle) {
            return response()->json(['message' => 'Véhicule introuvable.'], 400);
        }

        // Enregistrer en transaction SQL pour garantir la cohérence
        DB::transaction(function () use ($payment, $vehicle) {
            // Mettre à jour le statut du versement
            $payment->update([
                'status' => 'approved',
                'validated_at' => now(),
            ]);

            // Mettre à jour le kilométrage actuel du véhicule
            $vehicle->update([
                'current_mileage' => $payment->odometer,
            ]);

            // Mettre à jour le gain journalier déclaré sur le chauffeur associé
            if ($vehicle->driver) {
                $vehicle->driver->update([
                    'daily_income' => $payment->amount,
                ]);
            }

            // Loguer l'audit
            AuditLog::create([
                'user_id' => auth()->id(),
                'type' => 'payment_approved',
                'details' => "Versement approuvé pour le véhicule {$vehicle->license_plate}. Montant : {$payment->amount} FCFA.",
                'ip_address' => request()->ip(),
            ]);
        });

        return response()->json([
            'message' => 'Versement approuvé avec succès, kilométrage du véhicule mis à jour.',
            'payment' => $payment->fresh(['vehicle.driver'])
        ]);
    }

    /**
     * Rejet par le propriétaire
     */
    public function reject($id)
    {
        $payment = Payment::findOrFail($id);

        if ($payment->status !== 'pending') {
            return response()->json(['message' => 'Ce versement a déjà été traité.'], 400);
        }

        $payment->update([
            'status' => 'rejected',
            'validated_at' => now(),
        ]);

        // Loguer l'audit
        AuditLog::create([
            'user_id' => auth()->id(),
            'type' => 'payment_rejected',
            'details' => "Versement rejeté pour le véhicule {$payment->vehicle->license_plate}. Référence : {$payment->transaction_reference}.",
            'ip_address' => request()->ip(),
        ]);

        return response()->json([
            'message' => 'Versement rejeté.',
            'payment' => $payment->fresh(['vehicle.driver'])
        ]);
    }
}
