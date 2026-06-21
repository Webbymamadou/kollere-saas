<?php

namespace Tests;

use Illuminate\Contracts\Console\Kernel;

trait CreatesApplication
{
    /**
     * Creates the application.
     *
     * @return \Illuminate\Foundation\Application
     */
    public function createApplication()
    {
        $app = require __DIR__.'/../bootstrap/app.php';

        $app->make(Kernel::class)->bootstrap();

        // Register custom SQLite functions during testing
        \Illuminate\Support\Facades\Event::listen(
            \Illuminate\Database\Events\MigrationsStarted::class,
            function () {
                $connection = \Illuminate\Support\Facades\DB::connection();
                if ($connection->getDriverName() === 'sqlite') {
                    $pdo = $connection->getPdo();
                    $pdo->sqliteCreateFunction('uuid_generate_v4', function() {
                        return (string) \Illuminate\Support\Str::uuid();
                    });
                }
            }
        );

        return $app;
    }
}
