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


// Middleware to check authentication
$authMiddleware = function ($request, $handler) use ($app) {
    /*
    $headers = $request->getHeader('Authorization');
    if (empty($headers)) {
        error_log('No Authorization header found');
        throw new HttpUnauthorizedException($request, "Unauthorized");
    }
    error_log('Checking authentication');
    $token = str_replace('Bearer ', '', $headers[0]);
    if ($token !== 'your-secret-token') { // Remplacez par une vraie logique d'authentification
        throw new HttpUnauthorizedException($request, "Invalid token");
    }
        */
    $auth = true;
    if (!$auth) {
        // Not authenticated and must be authenticated to access this resource
        $response = $app->getResponseFactory()->createResponse();
        $response->getBody()->write('Unauthorized');
        return $response->withStatus(401);
    }
    $response = $handler->handle($request);
    return $response;
};

// Middleware to check if the user is admin
$adminMiddleware = function (Request $request, $handler) use ($app) {
    $isAdmin = true; // Remplacez par une vraie vérification d'utilisateur admin
    if (!$isAdmin) {
        throw new HttpForbiddenException($request, "Forbidden");
    }
    return $handler->handle($request);
};
