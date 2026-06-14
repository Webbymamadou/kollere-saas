<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\HasUuid;
use App\Traits\BelongsToTenant;

class AuditLog extends Model
{
    use HasUuid, BelongsToTenant;

    // Pas de colonne updated_at
    const UPDATED_AT = null;

    protected $fillable = [
        'user_id',
        'driver_id',
        'type',
        'details',
        'ip_address',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function driver()
    {
        return $this->belongsTo(Driver::class);
    }
}
