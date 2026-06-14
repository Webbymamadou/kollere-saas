<?php

namespace App\Traits;

use Illuminate\Support\Str;

trait HasUuid
{
    /**
     * S'exécute automatiquement au démarrage du modèle.
     */
    protected static function bootHasUuid()
    {
        static::creating(function ($model) {
            if (empty($model->{$model->getKeyName()})) {
                $model->{$model->getKeyName()} = (string) Str::uuid();
            }
        });
    }

    /**
     * Indiquer à Eloquent que la clé primaire n'est pas incrémentale.
     */
    public function getIncrementing()
    {
        return false;
    }

    /**
     * Indiquer à Eloquent que le type de clé primaire est une chaîne de caractères (UUID).
     */
    public function getKeyType()
    {
        return 'string';
    }
}
