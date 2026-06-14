<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Exécuter les migrations.
     */
    public function up(): void
    {
        Schema::create('vehicles', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('uuid_generate_v4()'));
            $table->uuid('user_id');
            $table->string('license_plate', 20)->unique();
            $table->string('brand_model', 100);
            $table->integer('current_mileage');
            $table->integer('last_oil_change_mileage');
            $table->integer('pending_mileage')->nullable();
            $table->string('status', 20)->default('active');
            $table->timestamps();

            // Clé étrangère vers users
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });

        // Contraintes CHECK de base appliquées après la création
        DB::statement("ALTER TABLE vehicles ADD CONSTRAINT chk_vehicle_current_mileage CHECK (current_mileage >= 0)");
        DB::statement("ALTER TABLE vehicles ADD CONSTRAINT chk_vehicle_last_oil_change_mileage CHECK (last_oil_change_mileage >= 0)");
        DB::statement("ALTER TABLE vehicles ADD CONSTRAINT chk_vehicle_pending_mileage CHECK (pending_mileage >= 0 OR pending_mileage IS NULL)");
        DB::statement("ALTER TABLE vehicles ADD CONSTRAINT chk_vehicle_status CHECK (status IN ('active', 'broken', 'maintenance'))");
        
        // Contrainte CHECK de cohérence kilométrique
        DB::statement("ALTER TABLE vehicles ADD CONSTRAINT chk_mileage_consistency CHECK (current_mileage >= last_oil_change_mileage)");

        // Index explicite pour les performances
        Schema::table('vehicles', function (Blueprint $table) {
            $table->index('user_id', 'idx_vehicles_user');
        });
    }

    /**
     * Annuler les migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vehicles');
    }
};
