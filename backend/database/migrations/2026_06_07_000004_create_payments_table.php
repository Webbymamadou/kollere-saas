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
        Schema::create('payments', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('uuid_generate_v4()'));
            $table->uuid('vehicle_id');
            $table->date('payment_date')->default(DB::raw('CURRENT_DATE'));
            $table->decimal('amount', 10, 2);
            $table->string('status', 20)->default('pending');
            $table->string('transaction_reference', 100)->unique();
            $table->string('receipt_image_url', 255)->nullable();
            $table->integer('odometer');
            $table->timestamp('submitted_at')->default(DB::raw('CURRENT_TIMESTAMP'));
            $table->timestamp('validated_at')->nullable();
            $table->timestamps();

            // Clé étrangère
            $table->foreign('vehicle_id')->references('id')->on('vehicles')->onDelete('cascade');
        });

        // Contraintes CHECK appliquées après la création
        DB::statement("ALTER TABLE payments ADD CONSTRAINT chk_payment_amount CHECK (amount >= 0)");
        DB::statement("ALTER TABLE payments ADD CONSTRAINT chk_payment_status CHECK (status IN ('pending', 'approved', 'rejected'))");
        DB::statement("ALTER TABLE payments ADD CONSTRAINT chk_payment_odometer CHECK (odometer >= 0)");

        // Index de performance conformes aux specs
        Schema::table('payments', function (Blueprint $table) {
            $table->index('payment_date', 'idx_payments_date');
            $table->index('vehicle_id', 'idx_payments_vehicle');
            $table->index('transaction_reference', 'idx_payments_reference');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
