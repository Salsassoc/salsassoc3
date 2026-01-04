<?php

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

// List memberships
$app->get('/api/memberships/list', function (Request $request, Response $response)
{
    $db = $this->get('db');

    // Read filters
    $params = $request->getQueryParams();
    $fiscalYearId = $params['fiscalyear_id'] ?? ($params['fiscal_year_id'] ?? null);
    $memberId = $params['member_id'] ?? null; // Filter by member (person) id
    $sort = $params['sort'] ?? null; // 'date' to sort by membership_date

    // Build query
    $sql = 'SELECT m.*,
        fy.title AS fiscal_year_title,
        (
            SELECT IFNULL(SUM(mc.amount), 0)
            FROM membership_cotisation mc
            WHERE mc.membership_id = m.id
        ) AS collected_amount,
        (
            SELECT GROUP_CONCAT(DISTINCT mc.payment_method)
            FROM membership_cotisation mc
            WHERE mc.membership_id = m.id AND mc.payment_method IS NOT NULL
        ) AS payment_methods_concat,
        (
            SELECT pm.payment_method FROM (
                SELECT mc.payment_method, COUNT(*) AS cnt
                FROM membership_cotisation mc
                WHERE mc.membership_id = m.id AND mc.payment_method IS NOT NULL
                GROUP BY mc.payment_method
                ORDER BY cnt DESC, mc.payment_method DESC
                LIMIT 1
            ) pm
        ) AS primary_payment_method
        FROM membership m
        INNER JOIN person p ON p.id = m.person_id
        LEFT JOIN fiscal_year fy ON fy.id = m.fiscal_year_id
        WHERE 1=1';
    $binds = [];

    if ($fiscalYearId !== null && $fiscalYearId !== '') {
        $sql .= ' AND m.fiscal_year_id = ?';
        $binds[] = (int)$fiscalYearId;
    }

    if ($memberId !== null && $memberId !== '') {
        $sql .= ' AND m.person_id = ?';
        $binds[] = (int)$memberId;
    }

    // Order
    if ($sort === 'date') {
        // Sort strictly by membership date (desc), then lastname/firstname
        $sql .= ' ORDER BY m.membership_date DESC, p.lastname ASC, p.firstname ASC';
    } else {
        // Default: fiscal year desc, then date, then lastname/firstname
        $sql .= ' ORDER BY m.fiscal_year_id DESC, m.membership_date DESC, p.lastname ASC, p.firstname ASC';
    }

    $stmt = $db->prepare($sql);
    $stmt->execute($binds);
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($rows as &$row) {
        // Casts
        if (isset($row['id'])) { $row['id'] = (int)$row['id']; }
        if (isset($row['person_id'])) { $row['person_id'] = (int)$row['person_id']; }
        if (isset($row['gender'])) { $row['gender'] = (int)$row['gender']; }
        if (isset($row['zipcode']) && $row['zipcode'] !== null && $row['zipcode'] !== '') { $row['zipcode'] = (int)$row['zipcode']; }
        if (isset($row['image_rights'])) { $row['image_rights'] = (bool)($row['image_rights'] == 'true' || $row['image_rights'] == 1); }
        if (isset($row['membership_type'])) { $row['membership_type'] = (int)$row['membership_type']; }
        if (isset($row['fiscal_year_id'])) { $row['fiscal_year_id'] = (int)$row['fiscal_year_id']; }
        if (isset($row['collected_amount'])) { $row['collected_amount'] = (float)$row['collected_amount']; }
        if (array_key_exists('primary_payment_method', $row)) {
            // Could be null
            $row['primary_payment_method'] = ($row['primary_payment_method'] === null || $row['primary_payment_method'] === '')
                ? null
                : (int)$row['primary_payment_method'];
        }
        // Build payment methods array and label
        $methods = [];
        if (!empty($row['payment_methods_concat'])) {
            $parts = explode(',', $row['payment_methods_concat']);
            foreach ($parts as $pm) {
                if ($pm === '' || $pm === null) { continue; }
                $methods[] = (int)$pm;
            }
        }
        $row['payment_methods'] = array_values(array_unique($methods));
        unset($row['payment_methods_concat']);
    }

    $response->getBody()->write(json_encode(['memberships' => $rows]));
    return $response->withHeader('Content-Type', 'application/json');
})->add($adminMiddleware);

// Get one membership (with its cotisations)
$app->get('/api/memberships/get', function (Request $request, Response $response) {
    $params = $request->getQueryParams();
    $id = $params['id'] ?? null;

    if (!$id) {
        $response = $response->withStatus(400);
        $response->getBody()->write(json_encode(['error' => 'Missing id']));
        return $response->withHeader('Content-Type', 'application/json');
    }

    $db = $this->get('db');
    $stmt = $db->prepare('SELECT * FROM membership WHERE id = ?');
    $stmt->execute([$id]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($row) {
        if (isset($row['id'])) {
            $row['id'] = (int)$row['id'];
        }
        if (isset($row['person_id'])) {
            $row['person_id'] = (int)$row['person_id'];
        }
        if (isset($row['gender'])) {
            $row['gender'] = (int)$row['gender'];
        }
        if (isset($row['zipcode']) && $row['zipcode'] !== null && $row['zipcode'] !== '') {
            $row['zipcode'] = (int)$row['zipcode'];
        }
        if (isset($row['image_rights'])) {
            $row['image_rights'] = (bool)($row['image_rights'] == 'true' || $row['image_rights'] == 1);
        }
        if (isset($row['membership_type'])) {
            $row['membership_type'] = (int)$row['membership_type'];
        }
        if (isset($row['fiscal_year_id'])) {
            $row['fiscal_year_id'] = (int)$row['fiscal_year_id'];
        }

        // Load person
        $stmt2 = $db->prepare('SELECT * FROM person WHERE id = ?');
        $stmt2->execute([$row['person_id']]);
        $row2 = $stmt2->fetch(PDO::FETCH_ASSOC);
        if($row2){
            $row['person'] = $row2;
        }

        // Load cotisations lines
        $stmt2 = $db->prepare('SELECT mc.cotisation_id, c.label, mc.date, mc.amount, mc.payment_method
            FROM membership_cotisation mc LEFT JOIN cotisation c ON c.id = mc.cotisation_id WHERE mc.membership_id = ? ORDER BY mc.date ASC, mc.cotisation_id ASC');
        $stmt2->execute([$id]);
        $rows2 = $stmt2->fetchAll(PDO::FETCH_ASSOC);
        foreach ($rows2 as &$l) {
            if (isset($l['cotisation_id'])) { $l['cotisation_id'] = (int)$l['cotisation_id']; }
            if (isset($l['amount'])) { $l['amount'] = (float)$l['amount']; }
            if (isset($l['payment_method'])) { $l['payment_method'] = ($l['payment_method'] !== null ? (int)$l['payment_method'] : null); }
        }
        $row['cotisations'] = $rows2;

        $response->getBody()->write(json_encode(['membership' => $row]));
    } else {
        $response = $response->withStatus(404);
        $response->getBody()->write(json_encode(['error' => 'Membership not found']));
    }

    return $response->withHeader('Content-Type', 'application/json');
})->add($adminMiddleware);

// Save (insert/update) a membership with person and cotisations
$app->post('/api/memberships/save', function (Request $request, Response $response)
{
    $res = true;
    $error = null;

    $data = $request->getParsedBody();
    $params = $request->getQueryParams();
    $id = $params['id'] ?? ($data['id'] ?? null);

    // Person fields (from payload)
    $personId = isset($data['person_id']) ? (int)$data['person_id'] : null;
    $lastname = $data['lastname'] ?? null;
    $firstname = $data['firstname'] ?? null;
    $gender = isset($data['gender']) ? (int)$data['gender'] : 0;
    $birthdate = $data['birthdate'] ?? null;
    $address = $data['address'] ?? null;
    $zipcode = array_key_exists('zipcode', $data) && $data['zipcode'] !== null && $data['zipcode'] !== '' ? (int)$data['zipcode'] : null;
    $city = $data['city'] ?? null;
    $email = $data['email'] ?? null;
    $phonenumber = $data['phonenumber'] ?? null;
    $phonenumber2 = $data['phonenumber2'] ?? null;
    $imageRights = isset($data['image_rights']) ? ($data['image_rights'] ? 'true' : 'false') : null;

    // Membership fields
    $membershipDate = $data['membership_date'] ?? null;
    $membershipType = isset($data['membership_type']) ? (int)$data['membership_type'] : 0; // 0 unknown
    $fiscalYearId = isset($data['fiscal_year_id']) ? (int)$data['fiscal_year_id'] : (isset($data['fiscalyear_id']) ? (int)$data['fiscalyear_id'] : null);
    $comments = $data['comments'] ?? null;

    $cotisations = $data['cotisations'] ?? [];
    if (!is_array($cotisations)) { $cotisations = []; }

    // Minimal validation
    if (!$lastname || !$firstname || $fiscalYearId === null || !$membershipDate) {
        $res = false;
        $error = 'Missing required fields';
    }

    if ($res) {
        $db = $this->get('db');
        $db->beginTransaction();
        try {
            // Upsert or create person
            if ($personId) {
                $stmt = $db->prepare('UPDATE person 
                    SET lastname = ?, firstname = ?, gender = ?, birthdate = ?, email = ?, phonenumber = ?, image_rights = ?, comments = ?, address = ?, zipcode = ?, city = ?, phonenumber2 = ?
                    WHERE id = ?');
                $stmt->execute([$lastname, $firstname, $gender, $birthdate, $email, $phonenumber, $imageRights, $comments, $address, $zipcode, $city, $phonenumber2, $personId]);
            } else {
                // creation_date set to now, is_member true by default for a membership
                $creationDate = date('Y-m-d H:i:s');
                $isMember = 'true';
                $stmt = $db->prepare('INSERT INTO person (lastname, firstname, gender, birthdate, email, phonenumber, creation_date, password, is_member, image_rights, comments, address, zipcode, city, phonenumber2)
                    VALUES (?, ?, ?, ?, ?, ?, ?, NULL, ?, ?, ?, ?, ?, ?, ?)');
                $stmt->execute([$lastname, $firstname, $gender, $birthdate, $email, $phonenumber, $creationDate, $isMember, $imageRights, $comments, $address, $zipcode, $city, $phonenumber2]);
                $personId = (int)$db->lastInsertId();
            }

            // Upsert membership
            if ($id) {
                $stmt = $db->prepare('UPDATE membership 
                    SET person_id = ?, lastname = ?, firstname = ?, gender = ?, birthdate = ?, address = ?, zipcode = ?, city = ?, email = ?, phonenumber = ?, image_rights = ?, membership_date = ?, membership_type = ?, fiscal_year_id = ?
                    WHERE id = ?');
                $stmt->execute([$personId, $lastname, $firstname, $gender, $birthdate, $address, $zipcode, $city, $email, $phonenumber, $imageRights, $membershipDate, $membershipType, $fiscalYearId, $id]);
                $membershipId = (int)$id;
                // Replace cotisations set
                $stmt = $db->prepare('DELETE FROM membership_cotisation WHERE membership_id = ?');
                $stmt->execute([$membershipId]);
            } else {
                $stmt = $db->prepare('INSERT INTO membership (person_id, lastname, firstname, gender, birthdate, address, zipcode, city, email, phonenumber, image_rights, membership_date, membership_type, fiscal_year_id)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
                $stmt->execute([$personId, $lastname, $firstname, $gender, $birthdate, $address, $zipcode, $city, $email, $phonenumber, $imageRights, $membershipDate, $membershipType, $fiscalYearId]);
                $membershipId = (int)$db->lastInsertId();
            }

            // Insert cotisations provided (only those with truthy amount or explicit include flag)
            if (!empty($cotisations)) {
                $ins = $db->prepare('INSERT INTO membership_cotisation (membership_id, cotisation_id, date, amount, payment_method) VALUES (?, ?, ?, ?, ?)');
                foreach ($cotisations as $line) {
                    // Allowed keys: cotisation_id (or id), date, amount, payment_method, checked
                    $cotId = isset($line['cotisation_id']) ? (int)$line['cotisation_id'] : (isset($line['id']) ? (int)$line['id'] : null);
                    if ($cotId === null) { continue; }
                    $checked = isset($line['checked']) ? (bool)$line['checked'] : true; // default include
                    if (!$checked) { continue; }
                    $date = $line['date'] ?? $membershipDate;
                    $amount = isset($line['amount']) ? (float)$line['amount'] : 0.0;
                    $pm = array_key_exists('payment_method', $line) && $line['payment_method'] !== null && $line['payment_method'] !== '' ? (int)$line['payment_method'] : null;
                    $ins->execute([$membershipId, $cotId, $date, $amount, $pm]);
                }
            }

            $db->commit();
            $savedId = $membershipId;
        } catch (Exception $e) {
            $db->rollBack();
            $res = false;
            $error = $e->getMessage();
        }
    }

    if ($res) {
        $response->getBody()->write(json_encode(['success' => true, 'id' => (int)($savedId ?? $id ?? 0)]));
    } else {
        $response = $response->withStatus(400);
        $response->getBody()->write(json_encode(['success' => false, 'error' => $error]));
    }

    return $response->withHeader('Content-Type', 'application/json');
})->add($adminMiddleware);

// Delete a membership (delete its cotisations as well)
$app->delete('/api/memberships/delete', function (Request $request, Response $response)
{
    $params = $request->getQueryParams();
    $id = $params['id'] ?? null;

    if (!$id) {
        $response = $response->withStatus(400);
        $response->getBody()->write(json_encode(['error' => 'Missing id']));
        return $response->withHeader('Content-Type', 'application/json');
    }

    $db = $this->get('db');
    $res = true; $error = null;

    try {
        $db->beginTransaction();
        $stmt = $db->prepare('DELETE FROM membership_cotisation WHERE membership_id = ?');
        $stmt->execute([$id]);
        $stmt = $db->prepare('DELETE FROM membership WHERE id = ?');
        $stmt->execute([$id]);
        $db->commit();
    } catch (Exception $e) {
        $db->rollBack();
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
