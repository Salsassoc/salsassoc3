<?php

use Slim\Psr7\Response;
use Slim\Exception\HttpUnauthorizedException;
use Slim\Exception\HttpForbiddenException;
use Psr\Http\Message\ServerRequestInterface as Request;

// Middleware to handle CORS errors
$app->add(function ($request, $handler) {
    $response = $handler->handle($request);
    return $response
        ->withHeader('Access-Control-Allow-Origin', '*')
        ->withHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept, Origin, Authorization')
        ->withHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
});

// Middleware to check authentication
$authMiddleware = function (Request $request, $handler) {
    /*
    $headers = $request->getHeader('Authorization');
    if (empty($headers)) {
        throw new HttpUnauthorizedException($request, "Unauthorized");
    }
    $token = str_replace('Bearer ', '', $headers[0]);
    if ($token !== 'your-secret-token') { // Remplacez par une vraie logique d'authentification
        throw new HttpUnauthorizedException($request, "Invalid token");
    }*/
    return $handler->handle($request);
};

// Middleware to check if the user is admin
$adminMiddleware = function (Request $request, $handler) {
    /*
    $isAdmin = true; // Remplacez par une vraie vérification d'utilisateur admin
    if (!$isAdmin) {
        throw new HttpForbiddenException($request, "Forbidden");
    }*/
    return $handler->handle($request);
};
