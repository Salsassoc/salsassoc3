<?php

use Psr\Container\ContainerInterface;

// Configuration des dépendances
$container = $app->getContainer();

// Exemple : Ajouter une instance de PDO pour la base de données
$container->set('db', function (ContainerInterface $container) {
    $db = new PDO('sqlite:' . __DIR__ . '/../db.sqlite');
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    return $db;
});