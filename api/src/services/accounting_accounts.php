<?php

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

// List accounting accounts
$app->get('/api/accounting/accounts/list', function (Request $request, Response $response)
{
    $db = $this->get('db');

    $sql = 'SELECT a.*, 
        (
            SELECT COUNT(1)
            FROM accounting_operation ao
            WHERE ao.account_id = a.id
        ) AS operation_count,
        (
            SELECT IFNULL(SUM(ao.amount_credit), 0)
            FROM accounting_operation ao
            WHERE ao.account_id = a.id
            AND ao.date_effective IS NOT NULL
        ) AS income_amount,
        (
            SELECT IFNULL(SUM(ao.amount_debit), 0)
            FROM accounting_operation ao
            WHERE ao.account_id = a.id
            AND ao.date_effective IS NOT NULL
        ) AS outcome_amount
        FROM accounting_account a
        ORDER BY a.type DESC, a.label ASC';

    $stmt = $db->query($sql);
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($rows as &$row) {
        if (isset($row['type'])) { $row['type'] = (int)$row['type']; }
        if (isset($row['operation_count'])) { $row['operation_count'] = (int)$row['operation_count']; }
        if (isset($row['income_amount'])) { $row['income_amount'] = (float)$row['income_amount']; }
        if (isset($row['outcome_amount'])) { $row['outcome_amount'] = (float)$row['outcome_amount']; }
        // Compute balance = income - outcome
        $income = isset($row['income_amount']) ? (float)$row['income_amount'] : 0.0;
        $outcome = isset($row['outcome_amount']) ? (float)$row['outcome_amount'] : 0.0;
    }

    $response->getBody()->write(json_encode(['accounting_accounts' => $rows]));
    return $response->withHeader('Content-Type', 'application/json');
})->add($adminMiddleware);

// Get single accounting account
$app->get('/api/accounting/accounts/get', function (Request $request, Response $response) {
    $params = $request->getQueryParams();
    $id = $params['id'] ?? null;

    if (!$id) {
        $response = $response->withStatus(400);
        $response->getBody()->write(json_encode(['error' => 'Missing id']));
        return $response->withHeader('Content-Type', 'application/json');
    }

    $db = $this->get('db');
    $stmt = $db->prepare('SELECT * FROM accounting_account WHERE id = ?');
    $stmt->execute([$id]);
    $acc = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($acc) {
        if (isset($acc['type'])) {
            $acc['type'] = (int)$acc['type'];
        }
        $response->getBody()->write(json_encode(['accounting_account' => $acc]));
    } else {
        $response = $response->withStatus(404);
        $response->getBody()->write(json_encode(['error' => 'Accounting account not found']));
    }

    return $response->withHeader('Content-Type', 'application/json');
})->add($adminMiddleware);

// Add or update an accounting account
$app->post('/api/accounting/accounts/save', function (Request $request, Response $response)
{
    $res = true;
    $error = null;

    // payload can be form or json
    $data = $request->getParsedBody();

    // id can be query param or body
    $params = $request->getQueryParams();
    $id = $params['id'] ?? ($data['id'] ?? null);

    $label = $data['label'] ?? null;
    $type = isset($data['type']) ? (int)$data['type'] : 0; // 0 Autre, 1 Caisse, 2 Compte bancaire

    if (!$label) {
        $res = false;
        $error = 'Label is required';
    }

    if ($res) {
        $db = $this->get('db');
        $db->beginTransaction();
        try {
            if ($id) {
                $stmt = $db->prepare('UPDATE accounting_account 
                    SET label = ?, type = ?
                    WHERE id = ?');
                $stmt->execute([$label, $type, $id]);
            } else {
                $stmt = $db->prepare('INSERT INTO accounting_account (label, type)
                    VALUES (?, ?)');
                $stmt->execute([$label, $type]);
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

// Delete an accounting account (only if not used)
$app->delete('/api/accounting/accounts/delete', function (Request $request, Response $response)
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

    // Check if not used in accounting_operation
    $stmt = $db->prepare('SELECT COUNT(*) FROM accounting_operation WHERE account_id = ?');
    $stmt->execute([$id]);
    $count = (int)$stmt->fetchColumn();

    if ($count > 0) {
        $res = false;
        $error = 'Cannot delete account associated with accounting_operation';
    }

    if ($res) {
        try {
            $stmt = $db->prepare('DELETE FROM accounting_account WHERE id = ?');
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
