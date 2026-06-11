<?php

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

// List users
$app->get('/api/users/list', function (Request $request, Response $response)
{
	$db = $this->get('db');

	$stmt = $db->query('SELECT id, email, first_name, last_name, is_admin, created_at FROM user WHERE deleted = 0 ORDER BY last_name ASC, first_name ASC');
	$rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

	// Normalize types
	foreach ($rows as &$row) {
		if (isset($row['is_admin'])) { $row['is_admin'] = (bool)$row['is_admin']; }
	}

	$response->getBody()->write(json_encode(['users' => $rows]));
	return $response->withHeader('Content-Type', 'application/json');
})->add($adminMiddleware);

// Get single user
$app->get('/api/users/get', function (Request $request, Response $response)
{
	$params = $request->getQueryParams();
	$id = $params['id'] ?? null;

	if (!$id) {
		$response = $response->withStatus(400);
		$response->getBody()->write(json_encode(['error' => 'Missing id']));
		return $response->withHeader('Content-Type', 'application/json');
	}

	$db = $this->get('db');
	$stmt = $db->prepare('SELECT id, email, first_name, last_name, is_admin, created_at FROM user WHERE id = ? AND deleted = 0');
	$stmt->execute([$id]);
	$user = $stmt->fetch(PDO::FETCH_ASSOC);

	if ($user) {
		if (isset($user['is_admin'])) { $user['is_admin'] = (bool)$user['is_admin']; }
		$response->getBody()->write(json_encode(['user' => $user]));
	} else {
		$response = $response->withStatus(404);
		$response->getBody()->write(json_encode(['error' => 'User not found']));
	}

	return $response->withHeader('Content-Type', 'application/json');
})->add($adminMiddleware);

// Add or update a user
$app->post('/api/users/save', function (Request $request, Response $response)
{
	$res = true;
	$error = null;

	// payload can be form or json
	$data = $request->getParsedBody();

	// id can be query param or body
	$params = $request->getQueryParams();
	$id = $params['id'] ?? ($data['id'] ?? null);

	$email = $data['email'] ?? null;
	$firstName = $data['first_name'] ?? null;
	$lastName = $data['last_name'] ?? null;
	$isAdmin = isset($data['is_admin']) ? (bool)$data['is_admin'] : false;
	$password = $data['password'] ?? null;

	if (!$email || !$firstName || !$lastName || (!$id && !$password)) {
		$res = false;
		$error = 'Missing required fields';
	}

	if ($res) {
		$db = $this->get('db');

		// Check at least one admin security
		if ($id && !$isAdmin) {
			$stmt = $db->prepare('SELECT COUNT(*) FROM user WHERE is_admin = 1 AND deleted = 0 AND id <> ?');
			$stmt->execute([$id]);
            $adminCount = (int)$stmt->fetchColumn();
            if ($adminCount <= 1) {
                $res = false;
                $error = 'Must have at least one administrator';
            }
		}
    }

	if ($res) {
		$db->beginTransaction();
		try {
			if ($id) {
				if ($password) {
					$hashedPassword = password_hash($password, PASSWORD_BCRYPT);
					$stmt = $db->prepare('UPDATE user SET email = ?, first_name = ?, last_name = ?, is_admin = ?, password = ? WHERE id = ?');
					$stmt->execute([$email, $firstName, $lastName, $isAdmin ? 1 : 0, $hashedPassword, $id]);
				} else {
					$stmt = $db->prepare('UPDATE user SET email = ?, first_name = ?, last_name = ?, is_admin = ? WHERE id = ?');
					$stmt->execute([$email, $firstName, $lastName, $isAdmin ? 1 : 0, $id]);
				}
			} else {
				$hashedPassword = password_hash($password, PASSWORD_BCRYPT);
				$stmt = $db->prepare('INSERT INTO user (email, first_name, last_name, is_admin, password) VALUES (?, ?, ?, ?, ?)');
				$stmt->execute([$email, $firstName, $lastName, $isAdmin ? 1 : 0, $hashedPassword]);
				$id = $db->lastInsertId();
			}
			$db->commit();
		} catch (Exception $e) {
			$db->rollBack();
			$res = false;
			$error = $e->getMessage();
		}
	}

	if ($res) {
		$response->getBody()->write(json_encode(['success' => true, 'id' => (int)$id]));
	} else {
		$response = $response->withStatus(400);
		$response->getBody()->write(json_encode(['success' => false, 'error' => $error]));
	}

	return $response->withHeader('Content-Type', 'application/json');
})->add($adminMiddleware);

// Check if any user exists
$app->get('/api/users/count', function (Request $request, Response $response)
{
	$db = $this->get('db');
	$stmt = $db->query('SELECT COUNT(*) FROM user WHERE deleted = 0');
	$count = (int)$stmt->fetchColumn();

	$response->getBody()->write(json_encode(['count' => $count]));
	return $response->withHeader('Content-Type', 'application/json');
});

// Initial user creation (only if no user exists)
$app->post('/api/users/init', function (Request $request, Response $response)
{
	$db = $this->get('db');
	
	// Check if any user exists first
	$stmt = $db->query('SELECT COUNT(*) FROM user WHERE deleted = 0');
	$count = (int)$stmt->fetchColumn();
	
	if ($count > 0) {
		$response = $response->withStatus(403);
		$response->getBody()->write(json_encode(['success' => false, 'error' => 'Users already exist']));
		return $response->withHeader('Content-Type', 'application/json');
	}

	$data = $request->getParsedBody();
	$email = $data['email'] ?? null;
	$firstName = $data['first_name'] ?? null;
	$lastName = $data['last_name'] ?? null;
	$password = $data['password'] ?? null;

	if (!$email || !$firstName || !$lastName || !$password) {
		$response = $response->withStatus(400);
		$response->getBody()->write(json_encode(['success' => false, 'error' => 'Missing required fields']));
		return $response->withHeader('Content-Type', 'application/json');
	}

	$db->beginTransaction();
	try {
		$hashedPassword = password_hash($password, PASSWORD_BCRYPT);
		// First user is always admin
		$stmt = $db->prepare('INSERT INTO user (email, first_name, last_name, is_admin, password) VALUES (?, ?, ?, 1, ?)');
		$stmt->execute([$email, $firstName, $lastName, $hashedPassword]);
		$id = $db->lastInsertId();
		$db->commit();
		
		$response->getBody()->write(json_encode(['success' => true, 'id' => (int)$id]));
	} catch (Exception $e) {
		$db->rollBack();
		$response = $response->withStatus(400);
		$response->getBody()->write(json_encode(['success' => false, 'error' => $e->getMessage()]));
	}

	return $response->withHeader('Content-Type', 'application/json');
});

// Delete a user (soft delete)
$app->delete('/api/users/delete', function (Request $request, Response $response)
{
	$params = $request->getQueryParams();
	$id = $params['id'] ?? null;

	if (!$id) {
		$response = $response->withStatus(400);
		$response->getBody()->write(json_encode(['error' => 'Missing id']));
		return $response->withHeader('Content-Type', 'application/json');
	}

	$db = $this->get('db');

	// Check at least one admin security
	$stmt = $db->prepare('SELECT is_admin FROM user WHERE id = ? AND deleted = 0');
	$stmt->execute([$id]);
	$userToDelete = $stmt->fetch(PDO::FETCH_ASSOC);
	if ($userToDelete && (bool)$userToDelete['is_admin']) {
	    $stmt = $db->prepare('SELECT COUNT(*) FROM user WHERE is_admin = 1 AND deleted = 0 AND id <> ?');
	    $stmt->execute([$id]);
		$adminCount = (int)$stmt->fetchColumn();
        if ($adminCount <= 1) {
            $res = false;
            $error = 'Must have at least one administrator';
        }
	}

	try {
		$stmt = $db->prepare('UPDATE user SET deleted = 1 WHERE id = ?');
		$stmt->execute([$id]);
	} catch (Exception $e) {
	    $res = false;
		$error = $e->getMessage();
	}

	if ($res) {
		$response->getBody()->write(json_encode(['success' => true, 'id' => (int)$id]));
	} else {
		$response = $response->withStatus(400);
		$response->getBody()->write(json_encode(['success' => false, 'error' => $error]));
	}

	return $response->withHeader('Content-Type', 'application/json');
})->add($adminMiddleware);