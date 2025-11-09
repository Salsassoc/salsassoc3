<?php

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

// List fiscal years
$app->get('/api/fiscal_years/list', function (Request $request, Response $response) {
    $db = $this->get('db');
    $stmt = $db->query('SELECT * FROM fiscal_year');
    $fiscalYears = $stmt->fetchAll(PDO::FETCH_ASSOC);
    foreach ($fiscalYears as &$year) {
        $year['is_current'] = (bool)($year['is_current'] == "true");
    }
    $response->getBody()->write(json_encode($fiscalYears));
    return $response->withHeader('Content-Type', 'application/json');
})->add($adminMiddleware);

// Add or update a fiscal year
$app->post('/api/fiscal_years/save', function (Request $request, Response $response) {
    $data = $request->getParsedBody();
    $id = $data['id'] ?? null;
    $startDate = $data['start_date'];
    $endDate = $data['end_date'];

    $db = $this->get('db');
    if ($id) {
        $stmt = $db->prepare('UPDATE fiscal_year SET start_date = ?, end_date = ? WHERE id = ?');
        $stmt->execute([$startDate, $endDate, $id]);
    } else {
        $stmt = $db->prepare('INSERT INTO fiscal_year (start_date, end_date) VALUES (?, ?)');
        $stmt->execute([$startDate, $endDate]);
    }

    $response->getBody()->write(json_encode(['success' => true]));
    return $response->withHeader('Content-Type', 'application/json');
})->add($adminMiddleware);

// Delete a fiscal year
$app->delete('/api/fiscal_years/delete', function (Request $request, Response $response) {
    $data = $request->getParsedBody();
    $id = $data['id'];

    $db = $this->get('db');
    $stmt = $db->prepare('SELECT COUNT(*) FROM related_table WHERE fiscal_year_id = ?'); 
    $stmt->execute([$id]);
    if ($stmt->fetchColumn() > 0) {
        return $response->withStatus(400)->withJson(['error' => 'Cannot delete fiscal year associated with other entities']);
    }

    $stmt = $db->prepare('DELETE FROM fiscal_year WHERE id = ?');
    $stmt->execute([$id]);

    $response->getBody()->write(json_encode(['success' => true]));
    return $response->withHeader('Content-Type', 'application/json');
})->add($adminMiddleware);