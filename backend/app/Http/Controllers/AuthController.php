<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class AuthController extends Controller
{
    /**
     * Connexion sécurisée pour les Propriétaires (Sanctum)
     */
    public function ownerLogin(Request $request)
    {
        // TODO: Implémenter la validation et la connexion propriétaire
    }

    /**
     * Connexion simplifiée par numéro et PIN pour les Chauffeurs (Lien Magique)
     */
    public function driverLogin(Request $request)
    {
        // TODO: Implémenter la connexion sans mot de passe chauffeur
    }
}
