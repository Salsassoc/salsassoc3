<?php

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

// Liste des utilisateurs
$app->get('/api/users/list', $authMiddleware, function (Request $request, Response $response) use ($db) {
    $stmt = $db->query('SELECT id, email, is_admin FROM users');
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
    $response->getBody()->write(json_encode($users));
    return $response->withHeader('Content-Type', 'application/json');
});

// Ajouter ou modifier un utilisateur
$app->post('/api/users/save', $authMiddleware, $adminMiddleware, function (Request $request, Response $response) use ($db) {
    $data = $request->getParsedBody();
    $id = $data['id'] ?? null;
    $email = $data['email'];
    $password = password_hash($data['password'], PASSWORD_BCRYPT);
    $isAdmin = $data['is_admin'] ?? 0;

    if ($id) {
        $stmt = $db->prepare('UPDATE users SET email = ?, password = ?, is_admin = ? WHERE id = ?');
        $stmt->execute([$email, $password, $isAdmin, $id]);
    } else {
        $stmt = $db->prepare('INSERT INTO users (email, password, is_admin) VALUES (?, ?, ?)');
        $stmt->execute([$email, $password, $isAdmin]);
    }

    $response->getBody()->write(json_encode(['success' => true]));
    return $response->withHeader('Content-Type', 'application/json');
});