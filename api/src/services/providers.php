<?php

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

// List distinct providers from accounting operations (for autocomplete)
$app->get('/api/service/provider/list', function (Request $request, Response $response)
{
    $params = $request->getQueryParams();
    $orderBy = $params['order_by'] ?? null;

    $db = $this->get('db');

    $sql = 'SELECT provider AS name,
        COUNT(1) AS usage_count,
        MAX(date_value) AS last_usage
        FROM accounting_operation
        WHERE provider IS NOT NULL AND TRIM(provider) <> \'\'
        GROUP BY provider';

    if ($orderBy === 'last_usage') {
        $sql .= ' ORDER BY last_usage DESC, name ASC';
    } else {
        $sql .= ' ORDER BY name ASC';
    }

    $sql .= ' LIMIT 100';

    $stmt = $db->query($sql);
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $result = [];
    foreach ($rows as $r) {
        $result[] = [
            'name' => $r['name'],
            'usage_count' => (int)$r['usage_count'],
            'last_usage' => $r['last_usage'],
        ];
    }

    $response->getBody()->write(json_encode(['providers' => $result]));
    return $response->withHeader('Content-Type', 'application/json');
})->add($adminMiddleware);
