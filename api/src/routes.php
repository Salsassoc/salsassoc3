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

// Simple session-based authentication routes
$app->post('/api/authenticate', function (Request $request, Response $response) use ($app) {
    require __DIR__ . '/password.php';
    $data = $request->getParsedBody();
    $username = $data['username'] ?? '';
    $password = $data['password'] ?? '';

    if ($username === $LOGIN_USERNAME && $password === $LOGIN_PASSWORD) {
        $_SESSION['user'] = true;
        $response->getBody()->write(json_encode(['success' => true, 'user' => ['username' => $username]]));
        return $response->withHeader('Content-Type', 'application/json');
    }

    $resp = $app->getResponseFactory()->createResponse(401);
    $resp->getBody()->write(json_encode(['error' => 'Invalid credentials']));
    return $resp->withHeader('Content-Type', 'application/json');
});

require __DIR__ . '/services/fiscal_years.php';
require __DIR__ . '/services/users.php';
