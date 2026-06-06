<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class MaintenanceController extends Controller
{
    public function index()
    {
        // Historique de maintenance (vidanges, freins, etc.)
    }

    public function store(Request $request)
    {
        // Enregistrer une nouvelle intervention
    }

    public function show($id)
    {
        // Détails d'une intervention
    }

    public function update(Request $request, $id)
    {
        // Mettre à jour une intervention
    }

    public function destroy($id)
    {
        // Supprimer une intervention
    }
}
