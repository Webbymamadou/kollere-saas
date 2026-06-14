<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Driver;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
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
            
            $driverQuery = Driver::where('magic_token', $tokenValue);
            
            if (\Illuminate\Support\Str::isUuid($tokenValue)) {
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

            $driver = Driver::where('phone', $request->phone)
                ->where('pin_code', $request->pin_code)
                ->first();

            if (!$driver) {
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
                ] : null
            ]
        ]);
    }
}
