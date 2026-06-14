<?php

namespace App\Scopes;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Scope;

class TenantScope implements Scope
{
    /**
     * Appliquer le scope global pour filtrer les données du locataire (owner) actuel.
     */
    public function apply(Builder $builder, Model $model)
    {
        if (auth()->check()) {
            $user = auth()->user();

            // Si l'utilisateur est un admin, on ne restreint pas les requêtes
            if ($user->role === 'admin') {
                return;
            }

            $table = $model->getTable();

            // 1. Modèle avec colonne directe 'user_id' (ex: vehicles)
            if (\Schema::hasColumn($table, 'user_id')) {
                $builder->where($table . '.user_id', $user->id);
                return;
            }

            // 2. Modèle relié à un véhicule via 'vehicle_id' (ex: drivers, payments, maintenance, incidents, documents)
            if (\Schema::hasColumn($table, 'vehicle_id')) {
                $builder->whereHas('vehicle', function (Builder $query) use ($user) {
                    $query->where('user_id', $user->id);
                });
                return;
            }

            // 3. Cas particulier de AuditLog
            if ($table === 'audit_logs') {
                $builder->where(function (Builder $query) use ($user) {
                    $query->where('user_id', $user->id)
                          ->orWhereHas('driver.vehicle', function (Builder $q) use ($user) {
                              $q->where('user_id', $user->id);
                          });
                });
            }
        }
    }
}
