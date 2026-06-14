<?php

namespace App\Traits;

use App\Scopes\TenantScope;
use Illuminate\Support\Facades\Schema;

trait BelongsToTenant
{
    /**
     * S'exécute automatiquement au démarrage du modèle.
     */
    protected static function bootBelongsToTenant()
    {
        static::addGlobalScope(new TenantScope);

        // Remplissage automatique de user_id lors de la création d'un enregistrement
        static::creating(function ($model) {
            if (auth()->check()) {
                $user = auth()->user();
                if (Schema::hasColumn($model->getTable(), 'user_id')) {
                    $model->user_id = $user->id;
                }
            }
        });
    }
}
