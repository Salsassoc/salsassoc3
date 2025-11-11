<?php

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

require_once("authentication.php");

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
    $username = null;
    $hasBasic = isBasicAuthValid($request, $username);
    if (!($hasBasic)) {
        return buildUnauthorizedResponse($app);
    }

    $user = ['user' => ['username' => $username]];

    $resp = $app->getResponseFactory()->createResponse(200);
    $resp->getBody()->write(json_encode($user));
    return $resp->withHeader('Content-Type', 'application/json');
});

require __DIR__ . '/services/fiscal_years.php';
require __DIR__ . '/services/users.php';
require __DIR__ . '/services/accounting_operation_categories.php';
require __DIR__ . '/services/cotisations.php';
require __DIR__ . '/services/accounting_accounts.php';
