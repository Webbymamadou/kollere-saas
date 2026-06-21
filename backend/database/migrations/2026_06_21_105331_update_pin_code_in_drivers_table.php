<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('drivers', function (Blueprint $table) {
            // Drop the CHECK constraint first
            if (DB::getDriverName() === 'pgsql') {
                DB::statement("ALTER TABLE drivers DROP CONSTRAINT chk_driver_pin_code");
            }
            
            // Change the pin_code column to string(255)
            $table->string('pin_code', 255)->change();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('drivers', function (Blueprint $table) {
            // Revert the pin_code column back to string(4)
            $table->string('pin_code', 4)->change();
            
            // Re-add the CHECK constraint
            if (DB::getDriverName() === 'pgsql') {
                DB::statement("ALTER TABLE drivers ADD CONSTRAINT chk_driver_pin_code CHECK (LENGTH(pin_code) = 4)");
            }
        });
    }
};
