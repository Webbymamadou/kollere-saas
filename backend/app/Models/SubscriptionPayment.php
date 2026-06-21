<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Traits\HasUuid;

class SubscriptionPayment extends Model
{
    use HasFactory, HasUuid;

    protected $fillable = [
        'user_id',
        'plan',
        'amount',
        'payment_method',
        'status',
        'notes',
        'paid_at',
        'validated_by',
        'validated_at',
    ];

    protected $casts = [
        'paid_at' => 'datetime',
        'validated_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function validatedBy()
    {
        return $this->belongsTo(User::class, 'validated_by');
    }
}
