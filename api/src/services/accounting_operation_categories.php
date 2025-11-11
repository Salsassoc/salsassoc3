<?php

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

// List categories
$app->get('/api/accounting/operations/categories/list', function (Request $request, Response $response)
{
    $db = $this->get('db');

    $sql = 'SELECT c.*,
        (
            SELECT COUNT(1)
            FROM accounting_operation ao
            WHERE ao.category = c.id
        ) AS operation_count
        FROM accounting_operation_category c
        ORDER BY c.label ASC';

    $stmt = $db->query($sql);
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Cast/normalize types
    foreach ($rows as &$row) {
        if (isset($row['is_internal_move'])) {
            $row['is_internal_move'] = (bool)($row['is_internal_move'] == "true" || $row['is_internal_move'] == 1);
        }
        if (isset($row['account_type'])) {
            $row['account_type'] = (int)$row['account_type'];
        }
        if (isset($row['operation_count'])) {
            $row['operation_count'] = (int)$row['operation_count'];
        }
    }

    $response->getBody()->write(json_encode(['accounting_operations_categories' => $rows]));
    return $response->withHeader('Content-Type', 'application/json');
})->add($adminMiddleware);

// Get single category
$app->get('/api/accounting/operations/categories/get', function (Request $request, Response $response) {
    $params = $request->getQueryParams();
    $id = $params['id'] ?? null;

    if (!$id) {
        $response = $response->withStatus(400);
        $response->getBody()->write(json_encode(['error' => 'Missing id']));
        return $response->withHeader('Content-Type', 'application/json');
    }

    $db = $this->get('db');
    $stmt = $db->prepare('SELECT * FROM accounting_operation_category WHERE id = ?');
    $stmt->execute([$id]);
    $cat = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($cat) {
        $cat['is_internal_move'] = (bool)($cat['is_internal_move'] == "true" || $cat['is_internal_move'] == 1);
        $cat['account_type'] = isset($cat['account_type']) ? (int)$cat['account_type'] : 0;
        $response->getBody()->write(json_encode(['accounting_operations_category' => $cat]));
    } else {
        $response = $response->withStatus(404);
        $response->getBody()->write(json_encode(['error' => 'Category not found']));
    }

    return $response->withHeader('Content-Type', 'application/json');
})->add($adminMiddleware);

// Add or update a category
$app->post('/api/accounting/operations/categories/save', function (Request $request, Response $response)
{
    $res = true;
    $error = null;

    // payload can be form or json
    $data = $request->getParsedBody();

    // id can be query param or body
    $params = $request->getQueryParams();
    $id = $params['id'] ?? ($data['id'] ?? null);

    $label = $data['label'] ?? null;
    $accountNumber = $data['account_number'] ?? null;
    $accountName = $data['account_name'] ?? null;
    $accountType = isset($data['account_type']) ? (int)$data['account_type'] : 0; // 6 Charges, 7 Produits, 0 Inconnu
    $isInternalMove = isset($data['is_internal_move']) ? ($data['is_internal_move'] ? 'true' : 'false') : 'false';

    if (!$label) {
        $res = false;
        $error = 'Label is required';
    }

    if ($res) {
        $db = $this->get('db');
        $db->beginTransaction();
        try {
            if ($id) {
                $stmt = $db->prepare('UPDATE accounting_operation_category 
                    SET label = ?, account_number = ?, account_name = ?, account_type = ?, is_internal_move = ?
                    WHERE id = ?');
                $stmt->execute([$label, $accountNumber, $accountName, $accountType, $isInternalMove, $id]);
            } else {
                $stmt = $db->prepare('INSERT INTO accounting_operation_category (label, account_number, account_name, account_type, is_internal_move)
                    VALUES (?, ?, ?, ?, ?)');
                $stmt->execute([$label, $accountNumber, $accountName, $accountType, $isInternalMove]);
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

// Delete a category (only if not used)
$app->delete('/api/accounting/operations/categories/delete', function (Request $request, Response $response)
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
    $stmt = $db->prepare('SELECT COUNT(*) FROM accounting_operation WHERE category = ?');
    $stmt->execute([$id]);
    $count = (int)$stmt->fetchColumn();

    if ($count > 0) {
        $res = false;
        $error = 'Cannot delete category associated with accounting_operation';
    }

    if ($res) {
        try {
            $stmt = $db->prepare('DELETE FROM accounting_operation_category WHERE id = ?');
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
