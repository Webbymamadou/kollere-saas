<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use App\Models\Vehicle;
use App\Models\Driver;
use App\Models\Incident;
use App\Models\Maintenance;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function getFinancialMetrics()
    {
        // Récupérer tous les paiements approuvés
        $approvedPayments = Payment::where('status', 'approved')->get();
        
        // Calculer le revenu total
        $totalRevenue = $approvedPayments->sum('amount');
        
        // Calculer le revenu du jour
        $today = now()->toDateString();
        $todayRevenue = $approvedPayments->filter(function($p) use ($today) {
            return $p->payment_date === $today;
        })->sum('amount');
        
        // Calculer le revenu du mois
        $currentMonthPrefix = now()->format('Y-m');
        $monthRevenue = $approvedPayments->filter(function($p) use ($currentMonthPrefix) {
            return str_starts_with($p->payment_date, $currentMonthPrefix);
        })->sum('amount');
        
        // Calculer les dépenses de maintenance
        $totalSpend = Maintenance::sum('cost');
        $netProfit = $totalRevenue - $totalSpend;
        
        // Calculer les paiements en attente
        $pendingPayments = Payment::where('status', 'pending')->count();
        
        // Nombre de véhicules actifs
        $activeVehicles = Vehicle::where('status', 'active')->count();
        
        // Nombre de chauffeurs actifs
        $activeDrivers = Driver::where('status', 'active')->count();
        
        // Taux de compliance des paiements
        $totalPayments = Payment::count();
        $complianceRate = $totalPayments > 0 ? round(($approvedPayments->count() / $totalPayments) * 100) : 0;
        $profitabilityRate = $totalRevenue > 0 ? round(($netProfit / $totalRevenue) * 100) : 100;
        
        // Incidents en attente
        $pendingIncidents = Incident::where('status', 'pending')->count();
        
        // Données du graphique (6 derniers mois)
        $revenueGraph = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = now()->subDays($i)->toDateString();
            $dayRevenue = $approvedPayments->filter(function($p) use ($date) {
                return $p->payment_date === $date;
            })->sum('amount');
            
            $revenueGraph[] = [
                'date' => $date,
                'label' => now()->subDays($i)->translatedFormat('D'),
                'amount' => $dayRevenue
            ];
        }
        
        return response()->json([
            'totalRevenue' => $totalRevenue,
            'todayRevenue' => $todayRevenue,
            'monthRevenue' => $monthRevenue,
            'totalSpend' => $totalSpend,
            'netProfit' => $netProfit,
            'pendingPayments' => $pendingPayments,
            'activeVehicles' => $activeVehicles,
            'activeDrivers' => $activeDrivers,
            'complianceRate' => $complianceRate,
            'profitabilityRate' => $profitabilityRate,
            'pendingIncidents' => $pendingIncidents,
            'revenueGraph' => $revenueGraph
        ]);
    }
}
