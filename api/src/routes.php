<?php

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

// Exemple de route GET
$app->get('/api/hello', function (Request $request, Response $response) {
    $response->getBody()->write(json_encode(['message' => 'Hello, World!']));
    return $response->withHeader('Content-Type', 'application/json');
});

// Exemple de route POST
$app->post('/api/data', function (Request $request, Response $response) {
    $data = $request->getParsedBody();
    $response->getBody()->write(json_encode(['received' => $data]));
    return $response->withHeader('Content-Type', 'application/json');
});

// Route pour l'authentification
$app->post('/api/auth', function (Request $request, Response $response) {
    $data = $request->getParsedBody();
    $email = $data['email'] ?? '';
    $password = $data['password'] ?? '';

    // Exemple de vérification (remplacez par une vraie logique)
    if ($email === 'admin@example.com' && $password === 'password') {
        $response->getBody()->write(json_encode(['token' => 'your-secret-token']));
    } else {
        return $response->withStatus(401)->withJson(['error' => 'Invalid credentials']);
    }
    return $response->withHeader('Content-Type', 'application/json');
});

require __DIR__ . '/services/fiscal_years.php';
require __DIR__ . '/services/users.php';