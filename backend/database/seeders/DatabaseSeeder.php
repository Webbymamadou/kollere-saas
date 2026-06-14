<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Nettoyer les tables existantes pour repartir à zéro (fresh seed)
        DB::table('audit_logs')->delete();
        DB::table('documents')->delete();
        DB::table('incidents')->delete();
        DB::table('maintenance')->delete();
        DB::table('payments')->delete();
        DB::table('drivers')->delete();
        DB::table('vehicles')->delete();
        DB::table('users')->delete();

        // 1. Création du propriétaire par défaut
        $ownerId = (string) Str::uuid();
        DB::table('users')->insert([
            'id' => $ownerId,
            'name' => 'Propriétaire Kollëré',
            'email' => 'owner@verse.local',
            'password' => Hash::make('password'),
            'phone' => '771234567',
            'role' => 'owner',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // 2. Création des véhicules
        $v1Id = (string) Str::uuid();
        $v2Id = (string) Str::uuid();
        $v3Id = (string) Str::uuid();

        DB::table('vehicles')->insert([
            [
                'id' => $v1Id,
                'user_id' => $ownerId,
                'license_plate' => 'DK-3421-A',
                'brand_model' => 'Peugeot 301',
                'current_mileage' => 48900,
                'last_oil_change_mileage' => 44100,
                'pending_mileage' => null,
                'status' => 'active',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => $v2Id,
                'user_id' => $ownerId,
                'license_plate' => 'DK-8854-B',
                'brand_model' => 'Toyota Corolla',
                'current_mileage' => 125600,
                'last_oil_change_mileage' => 124900,
                'pending_mileage' => null,
                'status' => 'active',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => $v3Id,
                'user_id' => $ownerId,
                'license_plate' => 'DK-9921-C',
                'brand_model' => 'Hyundai Accent',
                'current_mileage' => 83200,
                'last_oil_change_mileage' => 78500,
                'pending_mileage' => null,
                'status' => 'maintenance',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);

        // 3. Création des chauffeurs
        $d1Id = (string) Str::uuid();
        $d2Id = (string) Str::uuid();
        $d3Id = (string) Str::uuid();

        DB::table('drivers')->insert([
            [
                'id' => $d1Id,
                'vehicle_id' => $v1Id,
                'name' => 'Moussa Diop',
                'phone' => '771234567',
                'pin_code' => '1234',
                'status' => 'active',
                'magic_token' => 'mt_moussa_8a7b9c2d3e4f',
                'daily_income' => 42500.00,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => $d2Id,
                'vehicle_id' => $v2Id,
                'name' => 'Amadou Sow',
                'phone' => '779876543',
                'pin_code' => '5678',
                'status' => 'active',
                'magic_token' => 'mt_amadou_1e2f3g4h5i6j',
                'daily_income' => 38000.00,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => $d3Id,
                'vehicle_id' => $v3Id,
                'name' => 'Ibrahima Ndiaye',
                'phone' => '764532109',
                'pin_code' => '0000',
                'status' => 'active',
                'magic_token' => 'mt_ibrahima_9x8y7z6w5v4u',
                'daily_income' => 0.00,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);

        // 4. Création des versements (Payments)
        DB::table('payments')->insert([
            [
                'id' => (string) Str::uuid(),
                'vehicle_id' => $v1Id,
                'payment_date' => '2026-06-05',
                'amount' => 15000.00,
                'status' => 'approved',
                'transaction_reference' => 'WAVE_TR_98273A',
                'receipt_image_url' => 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400',
                'odometer' => 48780,
                'submitted_at' => '2026-06-05 21:05:00',
                'validated_at' => '2026-06-05 21:10:00',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => (string) Str::uuid(),
                'vehicle_id' => $v2Id,
                'payment_date' => '2026-06-05',
                'amount' => 15000.00,
                'status' => 'approved',
                'transaction_reference' => 'WAVE_TR_88231B',
                'receipt_image_url' => 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400',
                'odometer' => 125480,
                'submitted_at' => '2026-06-05 21:12:00',
                'validated_at' => '2026-06-05 21:15:00',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);

        // 5. Création des maintenances
        DB::table('maintenance')->insert([
            [
                'id' => (string) Str::uuid(),
                'vehicle_id' => $v1Id,
                'type' => 'oil_change',
                'mileage_at_maintenance' => 44100,
                'cost' => 25000.00,
                'maintenance_date' => '2026-05-15',
                'description' => 'Vidange complète',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => (string) Str::uuid(),
                'vehicle_id' => $v3Id,
                'type' => 'brakes',
                'mileage_at_maintenance' => 82100,
                'cost' => 45000.00,
                'maintenance_date' => '2026-06-02',
                'description' => 'Changement plaquettes',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);

        // 6. Création des incidents
        DB::table('incidents')->insert([
            [
                'id' => (string) Str::uuid(),
                'vehicle_id' => $v3Id,
                'driver_id' => $d3Id,
                'type' => 'engine',
                'description' => 'Voyant moteur allumé et perte de puissance',
                'status' => 'pending',
                'created_at' => '2026-06-05 14:30:00',
                'updated_at' => '2026-06-05 14:30:00',
            ]
        ]);

        // 7. Création des documents administratifs (4 par véhicule)
        $vehicles = [
            'v1' => ['id' => $v1Id, 'plate' => 'dk3421a'],
            'v2' => ['id' => $v2Id, 'plate' => 'dk8854b'],
            'v3' => ['id' => $v3Id, 'plate' => 'dk9921c'],
        ];

        $docTypes = [
            ['type' => 'Assurance RCA Flotte', 'expiry' => '2026-12-31', 'file_prefix' => 'assurance_'],
            ['type' => 'Carte Grise', 'expiry' => '2029-03-15', 'file_prefix' => 'cartegrise_'],
            ['type' => 'Licence Transport VTC', 'expiry' => '2026-09-10', 'file_prefix' => 'licence_'],
            ['type' => 'Visite Technique Annuelle', 'expiry' => '2026-07-01', 'file_prefix' => 'visite_'],
        ];

        foreach ($vehicles as $vKey => $vInfo) {
            foreach ($docTypes as $dInfo) {
                // Ajuster légèrement les dates d'expiration pour v2 et v3 pour correspondre aux mocks
                $expiry = $dInfo['expiry'];
                if ($vKey === 'v2') {
                    if ($dInfo['type'] === 'Assurance RCA Flotte') $expiry = '2027-01-20';
                    if ($dInfo['type'] === 'Carte Grise') $expiry = '2028-04-15';
                    if ($dInfo['type'] === 'Licence Transport VTC') $expiry = '2027-02-28';
                    if ($dInfo['type'] === 'Visite Technique Annuelle') $expiry = '2026-06-25';
                } elseif ($vKey === 'v3') {
                    if ($dInfo['type'] === 'Assurance RCA Flotte') $expiry = '2026-08-05';
                    if ($dInfo['type'] === 'Carte Grise') $expiry = '2027-11-30';
                    if ($dInfo['type'] === 'Licence Transport VTC') $expiry = '2026-08-20';
                    if ($dInfo['type'] === 'Visite Technique Annuelle') $expiry = '2027-05-12';
                }

                DB::table('documents')->insert([
                    'id' => (string) Str::uuid(),
                    'vehicle_id' => $vInfo['id'],
                    'type' => $dInfo['type'],
                    'expiry_date' => $expiry,
                    'file_path' => $dInfo['file_prefix'] . $vInfo['plate'] . '.pdf',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }

        // 8. Création des logs d'audit
        DB::table('audit_logs')->insert([
            [
                'id' => (string) Str::uuid(),
                'user_id' => null,
                'driver_id' => $d1Id,
                'type' => 'login',
                'details' => 'Connexion réussie via Magic Link',
                'ip_address' => '127.0.0.1',
                'created_at' => '2026-06-05 07:12:00',
            ],
            [
                'id' => (string) Str::uuid(),
                'user_id' => null,
                'driver_id' => $d1Id,
                'type' => 'payment_declared',
                'details' => 'Déclaration versement 15,000 FCFA (Wave)',
                'ip_address' => '127.0.0.1',
                'created_at' => '2026-06-05 21:05:00',
            ],
        ]);
    }
}
