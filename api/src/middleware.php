<?php

namespace App\Middleware;

use Slim\Exception\HttpException;
use Slim\Exception\HttpUnauthorizedException;
use Slim\Exception\HttpForbiddenException;
use Slim\Exception\HttpNotFoundException;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Server\MiddlewareInterface as MiddlewareInterface;
use Psr\Http\Server\RequestHandlerInterface as RequestHandlerInterface;

require_once("authentication.php");

// Middleware to handle CORS errors
$app->options('/{routes:.+}', function ($request, $response, $args) {
    return $response;
});
$app->add(function ($request, $handler) {
    $response = $handler->handle($request);

    $origin = $request->getHeaderLine('Origin');
    if($origin != ""){
        $response = $response->withHeader('Access-Control-Allow-Origin', $origin);
    }

    return $response
        ->withHeader('Access-Control-Allow-Credentials', 'true')
        ->withHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept, Origin, Authorization')
        ->withHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
});

/*
$app->map(['GET', 'POST', 'PUT', 'DELETE', 'PATCH'], '/{routes:.+}', function ($request, $response) {
    throw new HttpNotFoundException($request);
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
    $username = null;
    $hasBasic = isBasicAuthValid($request, $username);
    if (!($hasBasic)) {
        return buildUnauthorizedResponse($app);
    }
    return $handler->handle($request);
};
