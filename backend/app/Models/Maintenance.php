<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Maintenance extends Model
{
    // TODO: Utiliser le trait BelongsToTenant pour l'isolation multi-tenant

    protected $fillable = [
        'vehicle_id',
        'type',
        'mileage_at_maintenance',
        'cost',
        'maintenance_date',
        'description',
    ];

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class);
    }
}
