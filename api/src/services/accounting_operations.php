<?php

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

// List accounting operations
$app->get('/api/accounting/operations/list', function (Request $request, Response $response)
{
    $params = $request->getQueryParams();
    // Accept legacy and canonical param names
    $fiscalYearId = $params['fiscalyear_id'] ?? ($params['fiscal_year_id'] ?? null);
    $accountId = $params['account_id'] ?? ($params['accounting_account_id'] ?? null);
    $categoryId = $params['category'] ?? ($params['accounting_operations_category'] ?? null);
    $checked = $params['checked'] ?? null; // expect 'true'/'false'
    $year = $params['year'] ?? null; // civil year on date_value
    $dateStart = $params['date_start'] ?? null; // YYYY-MM-DD inclusive
    $dateEnd = $params['date_end'] ?? null;   // YYYY-MM-DD inclusive
    $amountMin = $params['amount_min'] ?? null;
    $amountMax = $params['amount_max'] ?? null;

    $db = $this->get('db');

    $sql = 'SELECT ao.*, 
        c.label AS category_label,
        c.account_number AS category_account_number,
        fy.title AS fiscal_year_title,
        acc.label AS account_label
        FROM accounting_operation ao
        LEFT JOIN accounting_operation_category c ON c.id = ao.category
        LEFT JOIN fiscal_year fy ON fy.id = ao.fiscalyear_id
        LEFT JOIN accounting_account acc ON acc.id = ao.account_id
        WHERE 1=1';
    $binds = [];

    if ($fiscalYearId !== null && $fiscalYearId !== '') {
        $sql .= ' AND ao.fiscalyear_id = ?';
        $binds[] = (int)$fiscalYearId;
    }
    if ($accountId !== null && $accountId !== '') {
        $sql .= ' AND ao.account_id = ?';
        $binds[] = (int)$accountId;
    }
    if ($categoryId !== null && $categoryId !== '') {
        $sql .= ' AND ao.category = ?';
        $binds[] = (int)$categoryId;
    }
    if ($checked !== null && $checked !== '') {
        $sql .= ' AND ao.checked = ?';
        // DB uses BOOLEAN; store as 'true'/'false' like other services
        $binds[] = ($checked === 'true' || $checked === '1') ? 'true' : 'false';
    }
    if ($year !== null && $year !== '') {
        $sql .= ' AND YEAR(ao.date_value) = ?';
        $binds[] = (int)$year;
    }
    if (($dateStart !== null && $dateStart !== '') || ($dateEnd !== null && $dateEnd !== '')) {
        if ($dateStart !== null && $dateStart !== '' && $dateEnd !== null && $dateEnd !== '') {
            $sql .= ' AND ao.date_value BETWEEN ? AND ?';
            $binds[] = $dateStart;
            $binds[] = $dateEnd;
        } elseif ($dateStart !== null && $dateStart !== '') {
            $sql .= ' AND ao.date_value >= ?';
            $binds[] = $dateStart;
        } elseif ($dateEnd !== null && $dateEnd !== '') {
            $sql .= ' AND ao.date_value <= ?';
            $binds[] = $dateEnd;
        }
    }
    if ($amountMin !== null && $amountMin !== '') {
        $sql .= ' AND (CASE WHEN ao.amount_credit IS NOT NULL THEN ao.amount_credit ELSE ao.amount_debit END) >= ?';
        $binds[] = (float)$amountMin;
    }
    if ($amountMax !== null && $amountMax !== '') {
        $sql .= ' AND (CASE WHEN ao.amount_credit IS NOT NULL THEN ao.amount_credit ELSE ao.amount_debit END) <= ?';
        $binds[] = (float)$amountMax;
    }

    // newest first
    //$sql .= ' ORDER BY ao.date_value DESC, ao.id DESC';
    $sql .= ' ORDER BY ao.id DESC';

    $stmt = $db->prepare($sql);
    $stmt->execute($binds);
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($rows as &$row) {
        // Normalize numeric/bool fields
        if (isset($row['id'])) { $row['id'] = (int)$row['id']; }
        if (isset($row['category'])) { $row['category'] = ($row['category'] !== null ? (int)$row['category'] : null); }
        if (isset($row['op_method'])) { $row['op_method'] = ($row['op_method'] !== null ? (int)$row['op_method'] : 0); }
        if (isset($row['amount_debit'])) { $row['amount_debit'] = ($row['amount_debit'] !== null ? (float)$row['amount_debit'] : null); }
        if (isset($row['amount_credit'])) { $row['amount_credit'] = ($row['amount_credit'] !== null ? (float)$row['amount_credit'] : null); }
        if (isset($row['project_id'])) { $row['project_id'] = ($row['project_id'] !== null ? (int)$row['project_id'] : null); }
        if (isset($row['fiscalyear_id'])) { $row['fiscalyear_id'] = (int)$row['fiscalyear_id']; }
        if (isset($row['account_id'])) { $row['account_id'] = ($row['account_id'] !== null ? (int)$row['account_id'] : null); }
        if (isset($row['checked'])) { $row['checked'] = (bool)($row['checked'] == 'true' || $row['checked'] == 1); }
        // expose op_number alias for op_method_number
        if (isset($row['op_method_number'])) { $row['op_number'] = $row['op_method_number']; }
        // Compute one signed amount (kept consistent with UI): prefer credit else debit
        $credit = isset($row['amount_credit']) && $row['amount_credit'] !== null ? (float)$row['amount_credit'] : 0.0;
        $debit = isset($row['amount_debit']) && $row['amount_debit'] !== null ? (float)$row['amount_debit'] : 0.0;
        if ($credit) {
            $row['amount'] = $credit;
        } else {
            $row['amount'] = $debit;
        }
    }

    $response->getBody()->write(json_encode(['accounting_operations' => $rows]));
    return $response->withHeader('Content-Type', 'application/json');
})->add($adminMiddleware);

// Get single operation
$app->get('/api/accounting/operations/get', function (Request $request, Response $response) {
    $params = $request->getQueryParams();
    $id = $params['id'] ?? null;

    if (!$id) {
        $response = $response->withStatus(400);
        $response->getBody()->write(json_encode(['error' => 'Missing id']));
        return $response->withHeader('Content-Type', 'application/json');
    }

    $db = $this->get('db');
    $stmt = $db->prepare('SELECT * FROM accounting_operation WHERE id = ?');
    $stmt->execute([$id]);
    $op = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($op) {
        if (isset($op['id'])) { $op['id'] = (int)$op['id']; }
        if (isset($op['category'])) { $op['category'] = ($op['category'] !== null ? (int)$op['category'] : null); }
        if (isset($op['op_method'])) { $op['op_method'] = ($op['op_method'] !== null ? (int)$op['op_method'] : 0); }
        if (isset($op['amount_debit'])) { $op['amount_debit'] = ($op['amount_debit'] !== null ? (float)$op['amount_debit'] : null); }
        if (isset($op['amount_credit'])) { $op['amount_credit'] = ($op['amount_credit'] !== null ? (float)$op['amount_credit'] : null); }
        if (isset($op['project_id'])) { $op['project_id'] = ($op['project_id'] !== null ? (int)$op['project_id'] : null); }
        if (isset($op['fiscalyear_id'])) { $op['fiscalyear_id'] = (int)$op['fiscalyear_id']; }
        if (isset($op['account_id'])) { $op['account_id'] = ($op['account_id'] !== null ? (int)$op['account_id'] : null); }
        if (isset($op['checked'])) { $op['checked'] = (bool)($op['checked'] == 'true' || $op['checked'] == 1); }
        // alias for API
        if (isset($op['op_method_number'])) { $op['op_number'] = $op['op_method_number']; }
        $response->getBody()->write(json_encode(['accounting_operation' => $op]));
    } else {
        $response = $response->withStatus(404);
        $response->getBody()->write(json_encode(['error' => 'Accounting operation not found']));
    }

    return $response->withHeader('Content-Type', 'application/json');
})->add($adminMiddleware);

// Add or update an accounting operation
$app->post('/api/accounting/operations/save', function (Request $request, Response $response)
{
    $res = true;
    $error = null;

    $data = $request->getParsedBody();
    $params = $request->getQueryParams();
    $id = $params['id'] ?? ($data['id'] ?? null);

    // Read payload
    $dateValue = $data['date_value'] ?? null;
    $label = $data['label'] ?? null;
    $category = isset($data['category']) ? (int)$data['category'] : null;
    $opMethod = isset($data['op_method']) ? (int)$data['op_method'] : 0;
    $opNumber = $data['op_number'] ?? null; // maps to db op_method_number
    $amountDebit = array_key_exists('amount_debit', $data) ? ($data['amount_debit'] !== null ? (float)$data['amount_debit'] : null) : null;
    $amountCredit = array_key_exists('amount_credit', $data) ? ($data['amount_credit'] !== null ? (float)$data['amount_credit'] : null) : null;
    $dateEffective = $data['date_effective'] ?? null;
    $projectId = isset($data['project_id']) ? (int)$data['project_id'] : null;
    $checked = isset($data['checked']) ? ($data['checked'] ? 'true' : 'false') : 'false';
    $fiscalYearId = isset($data['fiscalyear_id']) ? (int)$data['fiscalyear_id'] : (isset($data['fiscal_year_id']) ? (int)$data['fiscal_year_id'] : null);
    $accountId = isset($data['account_id']) ? (int)$data['account_id'] : null;
    $labelBank = $data['label_bank'] ?? null;

    // Validation minimal
    if (!$label || !$dateValue || $fiscalYearId === null) {
        $res = false;
        $error = 'Missing required fields';
    }

    // At least one of debit/credit must be provided (allow zero as explicit)
    if ($res) {
        $hasDebit = ($amountDebit !== null);
        $hasCredit = ($amountCredit !== null);
        if (!$hasDebit && !$hasCredit) {
            $res = false;
            $error = 'amount_debit or amount_credit is required';
        }
        if ($hasDebit && $hasCredit && $amountDebit > 0 && $amountCredit > 0) {
            // both filled positive is suspicious; allow but keep as is (business rule could change)
        }
    }

    if ($res) {
        $db = $this->get('db');
        $db->beginTransaction();
        try {
            if ($id) {
                $stmt = $db->prepare('UPDATE accounting_operation 
                    SET date_value = ?, label = ?, category = ?, op_method = ?, op_method_number = ?, amount_debit = ?, amount_credit = ?, date_effective = ?, project_id = ?, checked = ?, fiscalyear_id = ?, account_id = ?, label_bank = ?
                    WHERE id = ?');
                $stmt->execute([
                    $dateValue, $label, $category, $opMethod, $opNumber, $amountDebit, $amountCredit, $dateEffective, $projectId, $checked, $fiscalYearId, $accountId, $labelBank, $id
                ]);
            } else {
                $stmt = $db->prepare('INSERT INTO accounting_operation (date_value, label, category, op_method, op_method_number, amount_debit, amount_credit, date_effective, project_id, checked, fiscalyear_id, account_id, label_bank)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
                $stmt->execute([
                    $dateValue, $label, $category, $opMethod, $opNumber, $amountDebit, $amountCredit, $dateEffective, $projectId, $checked, $fiscalYearId, $accountId, $labelBank
                ]);
                $id = $db->lastInsertId();
            }
            $db->commit();
        } catch (Exception $e) {
            $db->rollBack();
            $res = false;
            $error = $e->getMessage();
        }
    }

    // Write response
    if($res){
        $response->getBody()->write(json_encode(['success' => true, 'id' => $id]));
        return $response->withHeader('Content-Type', 'application/json');
    }else{
        return $response->withStatus(400)->withJson(['error' => $error]);
    }
})->add($adminMiddleware);

// Delete an accounting operation
$app->delete('/api/accounting/operations/delete', function (Request $request, Response $response)
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

    try {
        $stmt = $db->prepare('DELETE FROM accounting_operation WHERE id = ?');
        $stmt->execute([$id]);
    } catch (Exception $e) {
        $res = false;
        $error = $e->getMessage();
    }

    if ($res) {
        $response->getBody()->write(json_encode(['success' => true]));
    } else {
        $response = $response->withStatus(400);
        $response->getBody()->write(json_encode(['success' => false, 'error' => $error]));
    }

    return $response->withHeader('Content-Type', 'application/json');
})->add($adminMiddleware);
