<?php

use Psr\Container\ContainerInterface;

// Configuration des dépendances
$container = $app->getContainer();

// Exemple : Ajouter une instance de PDO pour la base de données
$container->set('db', function (ContainerInterface $container) {
    // Load configuration to get database path
    require __DIR__ . '/config.php';
    $db = new PDO('sqlite:' . $DATABASE_PATH);
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    return $db;
});