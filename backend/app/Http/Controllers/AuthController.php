<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Driver;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    /**
     * Inscription sécurisée pour les nouveaux Propriétaires (avec essai gratuit)
     */
    public function ownerRegister(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'phone' => 'required|string|max:20',
            'password' => 'required|string|min:6',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'password' => Hash::make($request->password),
            'role' => 'owner',
        ]);

        // Start the 7-day free trial automatically!
        $user->startTrial();

        $token = $user->createToken('owner-token', ['role:owner'])->plainTextToken;

        return response()->json([
            'token' => $token,
            'role' => $user->role,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'subscription_status' => $user->subscription_status,
                'trial_start' => $user->trial_start,
                'trial_end' => $user->trial_end,
                'days_left_on_trial' => $user->days_left_on_trial,
            ]
        ], 201);
    }

    /**
     * Connexion sécurisée pour les Propriétaires (Sanctum)
     */
    public function ownerLogin(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'Identifiants incorrects.'
            ], 401);
        }

        if (!in_array($user->role, ['owner', 'admin'])) {
            return response()->json([
                'message' => 'Accès non autorisé.'
            ], 403);
        }

        $token = $user->createToken('owner-token', ['role:owner'])->plainTextToken;

        return response()->json([
            'token' => $token,
            'role' => $user->role,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'subscription_status' => $user->subscription_status,
                'trial_start' => $user->trial_start,
                'trial_end' => $user->trial_end,
                'days_left_on_trial' => $user->days_left_on_trial,
                'has_active_access' => $user->hasActiveAccess(),
            ]
        ]);
    }

    /**
     * Get current authenticated user with subscription info
     */
    public function getMe(Request $request)
    {
        $user = $request->user();
        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'subscription_status' => $user->subscription_status,
                'trial_start' => $user->trial_start,
                'trial_end' => $user->trial_end,
                'days_left_on_trial' => $user->days_left_on_trial,
                'has_active_access' => $user->hasActiveAccess(),
            ]
        ]);
    }

    /**
     * Connexion simplifiée par numéro et PIN pour les Chauffeurs (Lien Magique ou PIN)
     */
    public function driverLogin(Request $request)
    {
        // Option 1 : Connexion via Magic Token (Lien magique WhatsApp)
        if ($request->has('magic_token') || $request->has('token')) {
            $tokenValue = $request->input('magic_token', $request->input('token'));
            
            $driverQuery = Driver::withoutGlobalScopes()->where('magic_token', $tokenValue);
            
            if (Str::isUuid($tokenValue)) {
                $driverQuery->orWhere('id', $tokenValue);
            }
            
            $driver = $driverQuery->first();

            if (!$driver) {
                return response()->json([
                    'message' => 'Lien magique invalide ou expiré.'
                ], 401);
            }
        } else {
            // Option 2 : Connexion classique par Téléphone et Code PIN
            $request->validate([
                'phone' => 'required',
                'pin_code' => 'required|string|size:4',
            ]);

            $driver = Driver::withoutGlobalScopes()->where('phone', $request->phone)->first();

            if (!$driver || !$driver->checkPin($request->pin_code)) {
                return response()->json([
                    'message' => 'Code PIN ou numéro de téléphone incorrect.'
                ], 401);
            }
        }

        if ($driver->status !== 'active') {
            return response()->json([
                'message' => 'Ce compte chauffeur est inactif.'
            ], 403);
        }

        $token = $driver->createToken('driver-token', ['role:driver'])->plainTextToken;
        $vehicle = $driver->vehicle;

        return response()->json([
            'token' => $token,
            'role' => 'driver',
            'driver' => [
                'id' => $driver->id,
                'name' => $driver->name,
                'phone' => $driver->phone,
                'status' => $driver->status,
                'vehicle' => $vehicle ? [
                    'id' => $vehicle->id,
                    'license_plate' => $vehicle->license_plate,
                    'brand_model' => $vehicle->brand_model,
                    'current_mileage' => $vehicle->current_mileage,
                    'last_oil_change_mileage' => $vehicle->last_oil_change_mileage,
                    'pending_mileage' => $vehicle->pending_mileage,
                ] : null
            ]
        ]);
    }
}
