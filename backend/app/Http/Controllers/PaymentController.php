<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class PaymentController extends Controller
{
    public function index()
    {
        // Liste des versements (Multi-tenant automatique)
    }

    /**
     * Déclaration quotidienne du chauffeur (Kilométrage + Transaction Wave)
     */
    public function store(Request $request)
    {
        // TODO: Vérifier l'unicité de la transaction_reference
        // TODO: Vérifier la cohérence kilométrique croissante
    }

    public function show($id)
    {
        // Visualisation d'un reçu/versement
    }

    /**
     * Double validation propriétaire : Marquer comme approuvé
     */
    public function approve($id)
    {
        // TODO: Mettre à jour le statut du versement et les kilomètres du véhicule
    }

    /**
     * Rejeter un versement douteux (fausse preuve, mauvaise transaction)
     */
    public function reject($id)
    {
        // TODO: Marquer comme rejeté
    }
}
