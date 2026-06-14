<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\HasUuid;
use App\Traits\BelongsToTenant;

class Maintenance extends Model
{
    use HasUuid, BelongsToTenant;

    protected $table = 'maintenance';

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
