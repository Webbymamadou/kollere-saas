<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class VehicleController extends Controller
{
    public function index()
    {
        // CRUD index - Multi-tenant automatique via TenantScope
    }

    public function store(Request $request)
    {
        // CRUD store
    }

    public function show($id)
    {
        // CRUD show
    }

    public function update(Request $request, $id)
    {
        // CRUD update
    }

    public function destroy($id)
    {
        // CRUD destroy
    }

    /**
     * Métriques financières consolidées (Dashboard Propriétaire)
     */
    public function getFinancialMetrics()
    {
        // Calculs gains bruts, dépenses et bénéfice net
    }
}
