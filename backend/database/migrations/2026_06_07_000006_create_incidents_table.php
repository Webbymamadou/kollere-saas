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
        Schema::create('incidents', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('uuid_generate_v4()'));
            $table->uuid('vehicle_id')->nullable();
            $table->uuid('driver_id')->nullable();
            $table->string('type', 30);
            $table->text('description');
            $table->string('status', 20)->default('pending');
            $table->timestamps();

            // Clés étrangères
            $table->foreign('vehicle_id')->references('id')->on('vehicles')->onDelete('set null');
            $table->foreign('driver_id')->references('id')->on('drivers')->onDelete('set null');
        });

        // Contraintes CHECK appliquées après la création
        DB::statement("ALTER TABLE incidents ADD CONSTRAINT chk_incident_type CHECK (type IN ('engine', 'accident', 'police', 'other'))");
        DB::statement("ALTER TABLE incidents ADD CONSTRAINT chk_incident_status CHECK (status IN ('pending', 'resolved'))");
    }

    /**
     * Annuler les migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('incidents');
    }
};
