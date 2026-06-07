<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('drivers', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('uuid_generate_v4()'));
            $table->uuid('vehicle_id')->nullable();
            $table->string('name', 100);
            $table->string('phone', 20)->unique();
            $table->string('pin_code', 4);
            $table->string('status', 20)->default('active');
            $table->string('magic_token', 255)->nullable()->unique();
            $table->decimal('daily_income', 10, 2)->default(0.00);
            $table->timestamps();

            // Clé étrangère vers vehicles
            $table->foreign('vehicle_id')->references('id')->on('vehicles')->onDelete('set null');
        });

        // Contraintes CHECK appliquées après la création
        DB::statement("ALTER TABLE drivers ADD CONSTRAINT chk_driver_pin_code CHECK (LENGTH(pin_code) = 4)");
        DB::statement("ALTER TABLE drivers ADD CONSTRAINT chk_driver_status CHECK (status IN ('active', 'inactive'))");

        // Index explicite pour les performances
        Schema::table('drivers', function (Blueprint $table) {
            $table->index('phone', 'idx_drivers_phone');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('drivers');
    }
};
