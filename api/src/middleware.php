<?php

namespace App\Middleware;

use Slim\Exception\HttpException;
use Slim\Exception\HttpUnauthorizedException;
use Slim\Exception\HttpForbiddenException;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Server\MiddlewareInterface as MiddlewareInterface;
use Psr\Http\Server\RequestHandlerInterface as RequestHandlerInterface;

// Middleware to handle CORS errors
/*
$app->add(function ($req, $res, $next) {
    $response = $next($req, $res);
    return $response
        ->withHeader('Access-Control-Allow-Origin', '*')
        ->withHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept, Origin, Authorization')
        ->withHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
});
*/

// Middleware to handle errors
$app->addErrorMiddleware(true, true, true);
/*
    ->setDefaultErrorHandler(function (Request $request, Throwable $exception, bool $displayErrorDetails) use ($app): Response {
        $response = $app->getResponseFactory()->createResponse();
        $statusCode = $exception instanceof HttpException ? $exception->getCode() : 500;

        $response->getBody()->write(json_encode([
            'error' => $exception->getMessage(),
            'status' => $statusCode,
        ]));

        return $response->withHeader('Content-Type', 'application/json')->withStatus($statusCode);
    });
*/

final class Authorization
{
    public function __invoke(Request $request, Response $response, callable $next)
    {
        $isAllowed = false;
        if (!$isAllowed) {
            // Not authenticated and must be authenticated to access this resource
            return $response->withStatus(401);
        }

        return $next($request, $response);
    }
}

/**
 * Validate HTTP Basic Authorization header against credentials
 */
function isBasicAuthValid(Request $request): bool
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
    [$username, $password] = $parts;

    // Load expected credentials
    require __DIR__ . '/password.php';
    // Use timing-safe comparison when available
    $userOk = function_exists('hash_equals') ? hash_equals($LOGIN_USERNAME, $username) : ($LOGIN_USERNAME === $username);
    $passOk = function_exists('hash_equals') ? hash_equals($LOGIN_PASSWORD, $password) : ($LOGIN_PASSWORD === $password);

    return $userOk && $passOk;
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

// Middleware to check authentication via HTTP Basic
$authMiddleware = function (Request $request, $handler) use ($app) {
    $hasBasic = isBasicAuthValid($request);

    if (!($hasBasic)) {
        return buildUnauthorizedResponse($app);
    }

    return $handler->handle($request);
};

// Middleware to check if the user is admin (same as authenticated for now)
$adminMiddleware = function (Request $request, $handler) use ($app) {
    $hasBasic = isBasicAuthValid($request);
    if (!($hasBasic)) {
        return buildUnauthorizedResponse($app);
    }

    return $handler->handle($request);
};
