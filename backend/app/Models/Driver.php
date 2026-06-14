<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\HasUuid;
use App\Traits\BelongsToTenant;
use Laravel\Sanctum\HasApiTokens;

class Driver extends Model
{
    use HasUuid, BelongsToTenant, HasApiTokens;

    protected $fillable = [
        'vehicle_id',
        'name',
        'phone',
        'pin_code',
        'status',
        'magic_token',
        'daily_income',
    ];

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class);
    }

    public function incidents()
    {
        return $this->hasMany(Incident::class);
    }

    public function auditLogs()
    {
        return $this->hasMany(AuditLog::class);
    }
}

