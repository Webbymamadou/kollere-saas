<?php
try {
    $pdo = new PDO('pgsql:host=127.0.0.1;port=5432;dbname=postgres', 'postgres', 'seck21!');
    // Vérifier si la base existe déjà
    $stmt = $pdo->query("SELECT 1 FROM pg_database WHERE datname = 'verse_db_test'");
    if ($stmt->fetch()) {
        echo "La base de données verse_db_test existe déjà.\n";
    } else {
        $pdo->exec('CREATE DATABASE verse_db_test');
        echo "Base de données verse_db_test créée avec succès.\n";
    }
} catch (Exception $e) {
    echo "Erreur : " . $e->getMessage() . "\n";
}
