<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    // TODO: Utiliser le trait BelongsToTenant pour l'isolation multi-tenant

    protected $fillable = [
        'vehicle_id',
        'payment_date',
        'amount',
        'status',
        'transaction_reference',
        'receipt_image_url',
        'odometer',
        'submitted_at',
        'validated_at',
    ];

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class);
    }
}

