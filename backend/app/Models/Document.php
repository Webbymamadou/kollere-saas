<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\HasUuid;
use App\Traits\BelongsToTenant;

class Document extends Model
{
    use HasUuid, BelongsToTenant;

    protected $fillable = [
        'vehicle_id',
        'type',
        'expiry_date',
        'file_path',
    ];

    protected $casts = [
        'expiry_date' => 'date',
    ];

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class);
    }
}
