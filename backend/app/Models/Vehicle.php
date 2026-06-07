<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Vehicle extends Model
{
    // TODO: Utiliser le trait BelongsToTenant pour l'isolation multi-tenant

    protected $fillable = [
        'user_id',
        'license_plate',
        'brand_model',
        'current_mileage',
        'last_oil_change_mileage',
        'pending_mileage',
        'status',
    ];

    public function owner()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function driver()
    {
        return $this->hasOne(Driver::class);
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    public function maintenances()
    {
        return $this->hasMany(Maintenance::class);
    }

    public function incidents()
    {
        return $this->hasMany(Incident::class);
    }

    public function documents()
    {
        return $this->hasMany(Document::class);
    }
}

