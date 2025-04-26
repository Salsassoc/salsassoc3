<?php

use DI\Container;
use Slim\Factory\AppFactory;

require __DIR__ . '/../vendor/autoload.php';

// Create dependency container
$container = new Container();
AppFactory::setContainer($container);

// Create a new Slim app instance
$app = AppFactory::create();

// Add body parsing middleware
$app->addBodyParsingMiddleware();

// Include dependencies, middleware and routes
require __DIR__ . '/../src/dependencies.php';
require __DIR__ . '/../src/middleware.php';
require __DIR__ . '/../src/routes.php';

// Start application
$app->run();