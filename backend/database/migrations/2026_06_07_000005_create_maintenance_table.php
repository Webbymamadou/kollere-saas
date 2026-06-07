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
        Schema::create('maintenance', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('uuid_generate_v4()'));
            $table->uuid('vehicle_id');
            $table->string('type', 30);
            $table->integer('mileage_at_maintenance');
            $table->decimal('cost', 10, 2);
            $table->date('maintenance_date')->default(DB::raw('CURRENT_DATE'));
            $table->text('description')->nullable();
            $table->timestamps();

            // Clé étrangère
            $table->foreign('vehicle_id')->references('id')->on('vehicles')->onDelete('cascade');
        });

        // Contraintes CHECK appliquées après la création
        DB::statement("ALTER TABLE maintenance ADD CONSTRAINT chk_maintenance_type CHECK (type IN ('oil_change', 'brakes', 'tires', 'engine', 'other'))");
        DB::statement("ALTER TABLE maintenance ADD CONSTRAINT chk_maintenance_mileage CHECK (mileage_at_maintenance >= 0)");
        DB::statement("ALTER TABLE maintenance ADD CONSTRAINT chk_maintenance_cost CHECK (cost >= 0)");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('maintenance');
    }
};
