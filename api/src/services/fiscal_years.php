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

// Get fiscal year
$app->get('/api/fiscal_years/get', function (Request $request, Response $response) {
    $params = $request->getQueryParams();
    $id = $params['id'] ?? null;
    
    $db = $this->get('db');
    $stmt = $db->prepare('SELECT * FROM fiscal_year WHERE id = ?');
    $stmt->execute([$id]);
    $fiscalYear = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($fiscalYear) {
        $fiscalYear['is_current'] = (bool)($fiscalYear['is_current'] == "true");
        $response->getBody()->write(json_encode($fiscalYear));
    } else {
        $response = $response->withStatus(404);
        $response->getBody()->write(json_encode(['error' => 'Fiscal year not found']));
    }
    
    return $response->withHeader('Content-Type', 'application/json');
})->add($adminMiddleware);

// Add or update a fiscal year
$app->post('/api/fiscal_years/save', function (Request $request, Response $response)
{
    $res = true;
    $error = null;

    // Load data from body
    $data = $request->getParsedBody();
    $id = $data['id'] ?? null;
    $title = $data['title'];
    $startDate = $data['start_date'];
    $endDate = $data['end_date'];
    $isCurrent = isset($data['is_current']) ? ($data['is_current'] ? 'true' : 'false' ) : 'false';

    error_log($data['is_current']);

    // Check and update db
    if($res){
        $db = $this->get('db');
        $db->beginTransaction();

        if ($id) {
            $stmt = $db->prepare('UPDATE fiscal_year SET title = ?, start_date = ?, end_date = ?, is_current = ? WHERE id = ?');
            $stmt->execute([$title, $startDate, $endDate, $isCurrent, $id]);
        } else {
            $stmt = $db->prepare('INSERT INTO fiscal_year (title, start_date, end_date, is_current) VALUES (?, ?, ?, ?)');
            $stmt->execute([$title, $startDate, $endDate, $isCurrent]);
        }

        // Validate the transaction
        if($res){
            $db->commit();
        }else{
            $db->rollBack();
        }
    }

    // Write response
    if($res){
        $response->getBody()->write(json_encode(['success' => true]));
        return $response->withHeader('Content-Type', 'application/json');
    }else{
        return $response->withStatus(400)->withJson(['error' => $error]);
    }
})->add($adminMiddleware);

// Delete a fiscal year
$app->delete('/api/fiscal_years/delete', function (Request $request, Response $response)
{
    $res = true;
    $error = null;

    // Load params
    $params = $request->getQueryParams();
    $id = $params['id'] ?? null;
    if($id == null){
        $res = false;
        $error = 'Cannot delete fiscal year, id is null';
    }

    // Check and update db
    if($res){
        $db = $this->get('db');
        $db->beginTransaction();

        // Check if not used in cotisation
        if($res){
            $stmt = $db->prepare('SELECT COUNT(*) FROM cotisation WHERE fiscal_year_id = ?');
            $stmt->execute([$id]);
            if ($stmt->fetchColumn() > 0) {
                $res = false;
                $error = 'Cannot delete fiscal year associated with cotisation';
            }
        }
        // Check if not used in membership
        if($res){
            $stmt = $db->prepare('SELECT COUNT(*) FROM membership WHERE fiscal_year_id = ?');
            $stmt->execute([$id]);
            if ($stmt->fetchColumn() > 0) {
                $res = false;
                $error = 'Cannot delete fiscal year associated with membership';
            }
        }
        // Check if not used in accounting_operation
        if($res){
            $stmt = $db->prepare('SELECT COUNT(*) FROM accounting_operation WHERE fiscalyear_id = ?');
            $stmt->execute([$id]);
            if ($stmt->fetchColumn() > 0) {
                $res = false;
                $error = 'Cannot delete fiscal year associated with accounting_operation';
            }
        }

        // Delete the fiscal_year
        if($res){
            $stmt = $db->prepare('DELETE FROM fiscal_year WHERE id = ?');
            $stmt->execute([$id]);
        }

        // Validate the transaction
        if($res){
            $db->commit();
        }else{
            $db->rollBack();
        }
    }

    // Write response
    if($res){
        $response->getBody()->write(json_encode(['success' => true]));
        return $response->withHeader('Content-Type', 'application/json');
    }else{
        return $response->withStatus(400)->withJson(['error' => $error]);
    }

})->add($adminMiddleware);