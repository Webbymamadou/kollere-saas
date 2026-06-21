<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use App\Traits\HasUuid;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Support\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class User extends Authenticatable
{
    use HasApiTokens, Notifiable, HasUuid, HasFactory;

    protected $fillable = [
        'name',
        'email',
        'password',
        'phone',
        'role',
        'trial_start',
        'trial_end',
        'subscription_status',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'trial_start' => 'datetime',
        'trial_end' => 'datetime',
    ];

    /**
     * Un propriétaire possède plusieurs véhicules
     */
    public function vehicles()
    {
        return $this->hasMany(Vehicle::class);
    }

    public function subscriptions()
    {
        return $this->hasMany(Subscription::class);
    }

    public function subscriptionPayments()
    {
        return $this->hasMany(SubscriptionPayment::class);
    }

    // Check if user has active subscription or trial
    public function hasActiveAccess(): bool
    {
        // If subscription is active
        if ($this->subscription_status === 'active') {
            return true;
        }

        // If trial active
        if ($this->subscription_status === 'trial' && $this->trial_end) {
            return Carbon::now()->lt($this->trial_end);
        }

        return false;
    }

    // Start 7-day free trial
    public function startTrial(): void
    {
        $this->trial_start = Carbon::now();
        $this->trial_end = Carbon::now()->addDays(7);
        $this->subscription_status = 'trial';
        $this->save();
    }

    // Calculate days left on trial
    public function getDaysLeftOnTrialAttribute(): ?int
    {
        if (!$this->trial_end || $this->subscription_status !== 'trial') {
            return null;
        }
        $daysLeft = Carbon::now()->diffInDays($this->trial_end, false);
        return max(0, $daysLeft);
    }
}
