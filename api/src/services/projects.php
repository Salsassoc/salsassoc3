<?php

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

// List projects
$app->get('/api/projects/list', function (Request $request, Response $response)
{
	$params = $request->getQueryParams();
	$fyId = $params['fiscal_year_id'] ?? ($params['fiscalyear_id'] ?? null);
	$name = $params['name'] ?? null;

	$db = $this->get('db');

	// Add aggregates similar to fiscal years: operations count, income and outcome amounts
	$sql = 'SELECT p.*, 
		(
			SELECT COUNT(1)
			FROM accounting_operation ao
			WHERE ao.project_id = p.id
		) AS operation_count,
		(
			SELECT IFNULL(SUM(ao.amount_credit), 0)
			FROM accounting_operation ao, accounting_operation_category aoc
			WHERE ao.project_id = p.id
			AND aoc.id = ao.category
			AND aoc.is_internal_move = FALSE
		) AS income_amount,
		(
			SELECT IFNULL(SUM(ao.amount_debit), 0)
			FROM accounting_operation ao, accounting_operation_category aoc
			WHERE ao.project_id = p.id
			AND aoc.id = ao.category
			AND aoc.is_internal_move = FALSE
		) AS outcome_amount
		FROM project p
		WHERE 1=1';
	$binds = [];
	if ($fyId !== null && $fyId !== '') {
		$sql .= ' AND p.fiscal_year_id = ?';
		$binds[] = (int)$fyId;
	}
	if ($name !== null && $name !== '') {
		$sql .= ' AND LOWER(p.name) LIKE ?';
		$binds[] = '%' . strtolower($name) . '%';
	}

	$sql .= ' ORDER BY p.project_date DESC, p.name ASC';

	if (count($binds) > 0) {
		$stmt = $db->prepare($sql);
		$stmt->execute($binds);
	} else {
		$stmt = $db->query($sql);
	}
	$rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

	foreach ($rows as &$row) {
		if (isset($row['id'])) { $row['id'] = (int)$row['id']; }
		if (isset($row['fiscal_year_id'])) { $row['fiscal_year_id'] = (int)$row['fiscal_year_id']; }
		if (isset($row['operation_count'])) { $row['operation_count'] = (int)$row['operation_count']; }
		if (isset($row['income_amount'])) { $row['income_amount'] = (float)$row['income_amount']; }
		if (isset($row['outcome_amount'])) { $row['outcome_amount'] = (float)$row['outcome_amount']; }
	}

	$response->getBody()->write(json_encode(['projects' => $rows]));
	return $response->withHeader('Content-Type', 'application/json');
})->add($adminMiddleware);

// Get single project
$app->get('/api/projects/get', function (Request $request, Response $response) {
	$params = $request->getQueryParams();
	$id = $params['id'] ?? null;

	if (!$id) {
		$response = $response->withStatus(400);
		$response->getBody()->write(json_encode(['error' => 'Missing id']));
		return $response->withHeader('Content-Type', 'application/json');
	}

	$db = $this->get('db');
	$stmt = $db->prepare('SELECT * FROM project WHERE id = ?');
	$stmt->execute([$id]);
	$proj = $stmt->fetch(PDO::FETCH_ASSOC);

	if ($proj) {
		if (isset($proj['id'])) { $proj['id'] = (int)$proj['id']; }
		if (isset($proj['fiscal_year_id'])) { $proj['fiscal_year_id'] = (int)$proj['fiscal_year_id']; }
		$response->getBody()->write(json_encode(['project' => $proj]));
	} else {
		$response = $response->withStatus(404);
		$response->getBody()->write(json_encode(['error' => 'Project not found']));
	}

	return $response->withHeader('Content-Type', 'application/json');
})->add($adminMiddleware);

// Add or update a project
$app->post('/api/projects/save', function (Request $request, Response $response)
{
	$res = true;
	$error = null;

	$data = $request->getParsedBody();
	$params = $request->getQueryParams();
	$id = $params['id'] ?? ($data['id'] ?? null);

	$name = $data['name'] ?? null;
	$projectDate = $data['project_date'] ?? null; // can be null
	$fiscalYearId = isset($data['fiscal_year_id']) ? (int)$data['fiscal_year_id'] : (isset($data['fiscalyear_id']) ? (int)$data['fiscalyear_id'] : null);

	if (!$name || $fiscalYearId === null) {
		$res = false;
		$error = 'Missing required fields';
	}

	if ($res) {
		$db = $this->get('db');
		$db->beginTransaction();
		try {
			if ($id) {
				$stmt = $db->prepare('UPDATE project SET name = ?, project_date = ?, fiscal_year_id = ? WHERE id = ?');
				$stmt->execute([$name, $projectDate, $fiscalYearId, $id]);
			} else {
				$stmt = $db->prepare('INSERT INTO project (name, project_date, fiscal_year_id) VALUES (?, ?, ?)');
				$stmt->execute([$name, $projectDate, $fiscalYearId]);
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

// Delete a project (only if not used by accounting_operation)
$app->delete('/api/projects/delete', function (Request $request, Response $response)
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

	// Check if referenced by accounting_operation
	$stmt = $db->prepare('SELECT COUNT(*) FROM accounting_operation WHERE project_id = ?');
	$stmt->execute([$id]);
	$count = (int)$stmt->fetchColumn();

	if ($count > 0) {
		$res = false;
		$error = 'Cannot delete project referenced by accounting operations';
	}

	if ($res) {
		try {
			$stmt = $db->prepare('DELETE FROM project WHERE id = ?');
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
