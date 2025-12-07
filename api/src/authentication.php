<?php

use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Message\ResponseInterface as Response;

/**
 * Validate HTTP Basic Authorization header against credentials
 */
function isBasicAuthValid(Request $request, &$username): bool
{
    // Extract Authorization header
    $header = $request->getHeaderLine('Authorization');
    if (!$header) {
        return false;
    }
    // Must start with "Basic "
    if (stripos($header, 'Basic ') !== 0) {
        return false;
    }

    $b64 = trim(substr($header, 6));
    if ($b64 === '') {
        return false;
    }

    $decoded = base64_decode($b64, true);
    if ($decoded === false) {
        return false;
    }

    // Expect format username:password
    $parts = explode(':', $decoded, 2);
    if (count($parts) !== 2) {
        return false;
    }
    [$authUsername, $authPassword] = $parts;

    // Load expected credentials and config
    require __DIR__ . '/config.php';
    // Use timing-safe comparison when available
    $userOk = function_exists('hash_equals') ? hash_equals($LOGIN_USERNAME, $authUsername) : ($LOGIN_USERNAME === $username);
    $passOk = function_exists('hash_equals') ? hash_equals($LOGIN_PASSWORD, $authPassword) : ($LOGIN_PASSWORD === $password);

    if($userOk && $passOk){
        $username = $authUsername;
        return true;
    }

    return false;
}

/**
 * Build a 401 Unauthorized JSON response with WWW-Authenticate header
 */
function buildUnauthorizedResponse($app): Response
{
    $response = $app->getResponseFactory()->createResponse(401);
    $response->getBody()->write(json_encode(['error' => 'Unauthorized']));
    return $response
        ->withHeader('Content-Type', 'application/json')
        ->withHeader('WWW-Authenticate', 'Basic realm="API", charset="UTF-8"');
}