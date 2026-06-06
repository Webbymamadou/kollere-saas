<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Driver extends Model
{
    // TODO: Utiliser le trait BelongsToTenant pour l'isolation multi-tenant

    protected $fillable = [
        'vehicle_id',
        'name',
        'phone',
        'pin_code',
        'status',
    ];

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class);
    }
}
