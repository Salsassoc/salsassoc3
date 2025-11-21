<?php

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

// List members (persons)
$app->get('/api/members/list', function (Request $request, Response $response)
{
    $db = $this->get('db');

    // Read filters
    $params = $request->getQueryParams();
    $fiscalYearId = $params['fiscalyear_id'] ?? ($params['fiscal_year_id'] ?? null);

    // Base SQL
    $sql = 'SELECT p.*,
        (
            SELECT COUNT(1)
            FROM membership m
            WHERE m.person_id = p.id
        ) AS membership_count,
        (
            SELECT IFNULL(SUM(mc.amount), 0)
            FROM membership m
            LEFT JOIN membership_cotisation mc ON mc.membership_id = m.id
            WHERE m.person_id = p.id
        ) AS collected_amount
        FROM person p
        WHERE 1=1';

    $binds = [];

    // Filter by fiscal year: keep members having at least one membership in the given fiscal year
    if ($fiscalYearId !== null && $fiscalYearId !== '') {
        $sql .= ' AND EXISTS (SELECT 1 FROM membership mf WHERE mf.person_id = p.id AND mf.fiscal_year_id = ?)';
        $binds[] = (int)$fiscalYearId;
    }

    // Order by lastname/firstname
    $sql .= ' ORDER BY p.lastname ASC, p.firstname ASC';

    $stmt = $db->prepare($sql);
    $stmt->execute($binds);
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($rows as &$row) {
        if (isset($row['id'])) { $row['id'] = (int)$row['id']; }
        if (isset($row['gender'])) { $row['gender'] = (int)$row['gender']; }
        if (isset($row['zipcode']) && $row['zipcode'] !== null && $row['zipcode'] !== '') { $row['zipcode'] = (int)$row['zipcode']; }
        if (isset($row['is_member'])) { $row['is_member'] = (bool)($row['is_member'] == 'true' || $row['is_member'] == 1); }
        if (isset($row['image_rights'])) { $row['image_rights'] = (bool)($row['image_rights'] == 'true' || $row['image_rights'] == 1); }
        if (isset($row['membership_count'])) { $row['membership_count'] = (int)$row['membership_count']; }
        if (isset($row['collected_amount'])) { $row['collected_amount'] = (float)$row['collected_amount']; }
    }

    $response->getBody()->write(json_encode(['members' => $rows]));
    return $response->withHeader('Content-Type', 'application/json');
})->add($adminMiddleware);

// Get single member
$app->get('/api/members/get', function (Request $request, Response $response) {
    $params = $request->getQueryParams();
    $id = $params['id'] ?? null;

    if (!$id) {
        $response = $response->withStatus(400);
        $response->getBody()->write(json_encode(['error' => 'Missing id']));
        return $response->withHeader('Content-Type', 'application/json');
    }

    $db = $this->get('db');
    $stmt = $db->prepare('SELECT * FROM person WHERE id = ?');
    $stmt->execute([$id]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($row) {
        if (isset($row['id'])) { $row['id'] = (int)$row['id']; }
        if (isset($row['gender'])) { $row['gender'] = (int)$row['gender']; }
        if (isset($row['zipcode']) && $row['zipcode'] !== null && $row['zipcode'] !== '') { $row['zipcode'] = (int)$row['zipcode']; }
        if (isset($row['is_member'])) { $row['is_member'] = (bool)($row['is_member'] == 'true' || $row['is_member'] == 1); }
        if (isset($row['image_rights'])) { $row['image_rights'] = (bool)($row['image_rights'] == 'true' || $row['image_rights'] == 1); }
        $response->getBody()->write(json_encode(['member' => $row]));
    } else {
        $response = $response->withStatus(404);
        $response->getBody()->write(json_encode(['error' => 'Member not found']));
    }

    return $response->withHeader('Content-Type', 'application/json');
})->add($adminMiddleware);

// Add or update a member
$app->post('/api/members/save', function (Request $request, Response $response)
{
    $res = true;
    $error = null;

    $data = $request->getParsedBody();
    $params = $request->getQueryParams();
    $id = $params['id'] ?? ($data['id'] ?? null);

    // Read fields (align on DB columns)
    $lastname = $data['lastname'] ?? null;
    $firstname = $data['firstname'] ?? null;
    $gender = isset($data['gender']) ? (int)$data['gender'] : 0; // 0: not defined
    $birthdate = $data['birthdate'] ?? null;
    $email = $data['email'] ?? null;
    $phonenumber = $data['phonenumber'] ?? null;
    $creationDate = $data['creation_date'] ?? null; // allow client to set; if null, keep existing or set to NOW() on insert
    $password = $data['password'] ?? null;
    $isMember = isset($data['is_member']) ? ($data['is_member'] ? 'true' : 'false') : 'false';
    $imageRights = isset($data['image_rights']) ? ($data['image_rights'] ? 'true' : 'false') : null;
    $comments = $data['comments'] ?? null;
    $address = $data['address'] ?? null;
    $zipcode = array_key_exists('zipcode', $data) && $data['zipcode'] !== null && $data['zipcode'] !== '' ? (int)$data['zipcode'] : null;
    $city = $data['city'] ?? null;
    $phonenumber2 = $data['phonenumber2'] ?? null;

    // Minimal validation
    if (!$lastname || !$firstname) {
        $res = false;
        $error = 'Missing required fields';
    }

    if ($res) {
        $db = $this->get('db');
        $db->beginTransaction();
        try {
            if ($id) {
                $stmt = $db->prepare('UPDATE person 
                    SET lastname = ?, firstname = ?, gender = ?, birthdate = ?, email = ?, phonenumber = ?, creation_date = COALESCE(?, creation_date), password = ?, is_member = ?, image_rights = ?, comments = ?, address = ?, zipcode = ?, city = ?, phonenumber2 = ?
                    WHERE id = ?');
                $stmt->execute([$lastname, $firstname, $gender, $birthdate, $email, $phonenumber, $creationDate, $password, $isMember, $imageRights, $comments, $address, $zipcode, $city, $phonenumber2, $id]);
            } else {
                // Default creation_date to current timestamp if not provided
                if (!$creationDate) {
                    $creationDate = date('Y-m-d H:i:s');
                }
                $stmt = $db->prepare('INSERT INTO person (lastname, firstname, gender, birthdate, email, phonenumber, creation_date, password, is_member, image_rights, comments, address, zipcode, city, phonenumber2)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
                $stmt->execute([$lastname, $firstname, $gender, $birthdate, $email, $phonenumber, $creationDate, $password, $isMember, $imageRights, $comments, $address, $zipcode, $city, $phonenumber2]);
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

// Delete a member (only if not used in membership)
$app->delete('/api/members/delete', function (Request $request, Response $response)
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

    // Check if not used in membership
    $stmt = $db->prepare('SELECT COUNT(*) FROM membership WHERE person_id = ?');
    $stmt->execute([$id]);
    $count = (int)$stmt->fetchColumn();

    if ($count > 0) {
        $res = false;
        $error = 'Cannot delete member associated with membership';
    }

    if ($res) {
        try {
            $stmt = $db->prepare('DELETE FROM person WHERE id = ?');
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
