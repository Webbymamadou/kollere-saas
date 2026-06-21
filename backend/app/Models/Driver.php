<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\HasUuid;
use App\Traits\BelongsToTenant;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Support\Facades\Hash;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Driver extends Model
{
    use HasUuid, BelongsToTenant, HasApiTokens, HasFactory;

    protected $fillable = [
        'vehicle_id',
        'name',
        'phone',
        'pin_code',
        'status',
        'magic_token',
        'daily_income',
    ];

    protected $hidden = [
        'pin_code',
    ];

    // Automatically hash the PIN when setting it
    public function setPinCodeAttribute($value)
    {
        $this->attributes['pin_code'] = Hash::make($value);
    }

    // Verify the PIN
    public function checkPin($pin)
    {
        return Hash::check($pin, $this->pin_code);
    }

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

