<?php

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

// List cotisations
$app->get('/api/cotisations/list', function (Request $request, Response $response)
{
    $db = $this->get('db');

    $sql = 'SELECT c.*, 
        (
            SELECT COUNT(DISTINCT mc.membership_id)
            FROM membership_cotisation mc
            WHERE mc.cotisation_id = c.id
        ) AS members_count,
        (
            SELECT IFNULL(SUM(mc.amount), 0)
            FROM membership_cotisation mc
            WHERE mc.cotisation_id = c.id
        ) AS collected_amount
        FROM cotisation c
        ORDER BY c.start_date DESC, c.end_date DESC, c.label ASC';

    $stmt = $db->query($sql);
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Normalize types
    foreach ($rows as &$row) {
        if (isset($row['amount'])) { $row['amount'] = (float)$row['amount']; }
        if (isset($row['type'])) { $row['type'] = (int)$row['type']; }
        if (isset($row['fiscal_year_id'])) { $row['fiscal_year_id'] = (int)$row['fiscal_year_id']; }
        if (isset($row['members_count'])) { $row['members_count'] = (int)$row['members_count']; }
        if (isset($row['collected_amount'])) { $row['collected_amount'] = (float)$row['collected_amount']; }
    }

    $response->getBody()->write(json_encode(['cotisations' => $rows]));
    return $response->withHeader('Content-Type', 'application/json');
})->add($adminMiddleware);

// Get single cotisation
$app->get('/api/cotisations/get', function (Request $request, Response $response) {
    $params = $request->getQueryParams();
    $id = $params['id'] ?? null;

    if (!$id) {
        $response = $response->withStatus(400);
        $response->getBody()->write(json_encode(['error' => 'Missing id']));
        return $response->withHeader('Content-Type', 'application/json');
    }

    $db = $this->get('db');
    $stmt = $db->prepare('SELECT * FROM cotisation WHERE id = ?');
    $stmt->execute([$id]);
    $cot = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($cot) {
        if (isset($cot['amount'])) { $cot['amount'] = (float)$cot['amount']; }
        if (isset($cot['type'])) { $cot['type'] = (int)$cot['type']; }
        if (isset($cot['fiscal_year_id'])) { $cot['fiscal_year_id'] = (int)$cot['fiscal_year_id']; }
        $response->getBody()->write(json_encode(['cotisation' => $cot]));
    } else {
        $response = $response->withStatus(404);
        $response->getBody()->write(json_encode(['error' => 'Cotisation not found']));
    }

    return $response->withHeader('Content-Type', 'application/json');
})->add($adminMiddleware);

// Add or update a cotisation
$app->post('/api/cotisations/save', function (Request $request, Response $response)
{
    $res = true;
    $error = null;

    // payload can be form or json
    $data = $request->getParsedBody();

    // id can be query param or body
    $params = $request->getQueryParams();
    $id = $params['id'] ?? ($data['id'] ?? null);

    $label = $data['label'] ?? null;
    $amount = isset($data['amount']) ? (float)$data['amount'] : null;
    $startDate = $data['start_date'] ?? null;
    $endDate = $data['end_date'] ?? null;
    // accept both fiscal_year_id and fiscalyear_id for compatibility
    $fiscalYearId = isset($data['fiscal_year_id']) ? (int)$data['fiscal_year_id'] : (isset($data['fiscalyear_id']) ? (int)$data['fiscalyear_id'] : null);
    $type = isset($data['type']) ? (int)$data['type'] : 1; // default adhesion

    if (!$label || $amount === null || !$startDate || !$endDate || $fiscalYearId === null) {
        $res = false;
        $error = 'Missing required fields';
    }

    if ($res) {
        $db = $this->get('db');
        $db->beginTransaction();
        try {
            if ($id) {
                $stmt = $db->prepare('UPDATE cotisation 
                    SET label = ?, amount = ?, start_date = ?, end_date = ?, fiscal_year_id = ?, type = ?
                    WHERE id = ?');
                $stmt->execute([$label, $amount, $startDate, $endDate, $fiscalYearId, $type, $id]);
            } else {
                $stmt = $db->prepare('INSERT INTO cotisation (label, amount, start_date, end_date, fiscal_year_id, type)
                    VALUES (?, ?, ?, ?, ?, ?)');
                $stmt->execute([$label, $amount, $startDate, $endDate, $fiscalYearId, $type]);
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

// Delete a cotisation (only if not used)
$app->delete('/api/cotisations/delete', function (Request $request, Response $response)
{
    $params = $request->getQueryParams();
    $id = $params['id'] ?? null;

    if (!$id) {
        $response = $response->withStatus(400);
        $response->getBody()->write(json_encode(['error' => 'Missing id']));
        return $response->withHeader('Content-Type', 'application/json');
    }

    $res = true;
    $error = null;

    $db = $this->get('db');

    // Check if not used in membership_cotisation
    $stmt = $db->prepare('SELECT COUNT(*) FROM membership_cotisation WHERE cotisation_id = ?');
    $stmt->execute([$id]);
    $count = (int)$stmt->fetchColumn();

    if ($count > 0) {
        $res = false;
        $error = 'Cannot delete cotisation associated with membership_cotisation';
    }

    if ($res) {
        try {
            $stmt = $db->prepare('DELETE FROM cotisation WHERE id = ?');
            $stmt->execute([$id]);
        } catch (Exception $e) {
            $res = false;
            $error = $e->getMessage();
        }
    }

    if ($res) {
        $response->getBody()->write(json_encode(['success' => true]));
    } else {
        $response = $response->withStatus(400);
        $response->getBody()->write(json_encode(['success' => false, 'error' => $error]));
    }

    return $response->withHeader('Content-Type', 'application/json');
})->add($adminMiddleware);
