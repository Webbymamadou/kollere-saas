<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\HasUuid;
use App\Traits\BelongsToTenant;

class Payment extends Model
{
    use HasUuid, BelongsToTenant;

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

