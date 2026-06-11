<?php

use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Message\ResponseInterface as Response;

/**
 * Validate HTTP Basic Authorization header against credentials
 */
function isBasicAuthValid(Request $request, &$userData = null): bool
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

	// Access database from the app container (via global $app if needed or passing $db)
	global $app;
	$container = $app->getContainer();
	$db = $container->get('db');

    $res = true;
    $bUseUserTable = false;

    // Check if user table exists
    if($res){
        $stmt = $db->prepare('SELECT name FROM sqlite_master WHERE type=\'table\' AND name=\'user\';');
        $res = $stmt->execute();
        if($res && $stmt->rowCount() == 1){
            $stmt = $db->prepare('SELECT count(id) FROM user');
            $res = $stmt->execute();
            if($res){
                $count = $stmt->fetch(PDO::FETCH_ASSOC);
                error_log("count: $count");
                if($count > 0){
                    $bUseUserTable = true;
                }
            }
        }
    }

	if($res){
	    if($bUseUserTable){
            // Search for user in database (email is used as username)
            $stmt = $db->prepare('SELECT id, email, password, first_name, last_name, is_admin FROM user WHERE email = ? AND deleted = 0');
            $stmt->execute([$authUsername]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($user && password_verify($authPassword, $user['password'])) {
                // Remove password from user data before returning
                unset($user['password']);
                $user['is_admin'] = (bool)$user['is_admin'];
                $userData = $user;
                return true;
            }
        }else{
            require __DIR__ . '/config.php';
            if(isset($LOGIN_USERNAME) && isset($LOGIN_PASSWORD)){
                // Load expected credentials and config
                // Use timing-safe comparison when available
                $userOk = function_exists('hash_equals') ? hash_equals($LOGIN_USERNAME, $authUsername) : ($LOGIN_USERNAME === $username);
                $passOk = function_exists('hash_equals') ? hash_equals($LOGIN_PASSWORD, $authPassword) : ($LOGIN_PASSWORD === $password);

                if($userOk && $passOk){
                    $userData['username'] = $authUsername;
                    $userData['is_admin'] = true;
                    return true;
                }
            }else{
                $userData['username'] = 'admin';
                $userData['is_admin'] = true;
                // If no user defined in database or config file, allow access admin
                return true;
            }
        }
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