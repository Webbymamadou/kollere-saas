<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json([
        'message' => 'Versé SaaS VTC API Backend is running successfully.',
        'version' => '1.0.0',
        'status' => 'healthy'
    ]);
});
