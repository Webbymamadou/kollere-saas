<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\HasUuid;
use App\Traits\BelongsToTenant;

class Incident extends Model
{
    use HasUuid, BelongsToTenant;

    protected $fillable = [
        'vehicle_id',
        'driver_id',
        'type',
        'description',
        'status',
    ];

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class);
    }

    public function driver()
    {
        return $this->belongsTo(Driver::class);
    }
}
