<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes - Versé VTC Management
|--------------------------------------------------------------------------
|
| Ici se trouvent toutes les routes de l'API REST de Versé. 
| Elles sont toutes protégées par le middleware de sécurité correspondant.
|
*/

// --- AUTHENTIFICATION PUBLIC ---
Route::post('/auth/login', [App\Http\Controllers\AuthController::class, 'ownerLogin']);
Route::post('/auth/driver/login', [App\Http\Controllers\AuthController::class, 'driverLogin']);

// --- ROUTES SECURISEES PAR SANCTUM (PROPRIÉTAIRES) ---
Route::middleware('auth:sanctum')->group(function () {
    
    // Multi-tenant check automatique s'exécute sur ces ressources
    Route::apiResource('vehicles', App\Http\Controllers\VehicleController::class);
    Route::apiResource('drivers', App\Http\Controllers\DriverController::class);
    
    // Validation des versements par le propriétaire
    Route::post('/payments/{payment}/approve', [App\Http\Controllers\PaymentController::class, 'approve']);
    Route::post('/payments/{payment}/reject', [App\Http\Controllers\PaymentController::class, 'reject']);
    Route::apiResource('payments', App\Http\Controllers\PaymentController::class)->except(['store']);
    
    // Suivi de maintenance
    Route::apiResource('maintenance', App\Http\Controllers\MaintenanceController::class);
    
    // Métriques dashboard
    Route::get('/dashboard/financials', [App\Http\Controllers\VehicleController::class, 'getFinancialMetrics']);
});

// --- PORTAIL MOBILE CHAUFFEUR (Sécurisé par token ou PIN) ---
Route::middleware('auth:sanctum')->group(function () {
    // Déclaration de versement quotidien & incident chauffeur
    Route::post('/driver/payments', [App\Http\Controllers\PaymentController::class, 'store']);
});
