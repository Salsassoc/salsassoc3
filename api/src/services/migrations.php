<?php

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

// Utility to split SQL into statements while ignoring semicolons inside strings
if (!function_exists('splitSqlStatements')) {
    function splitSqlStatements(string $sql): array {
        $statements = [];
        $current = '';
        $inSingle = false;
        $inDouble = false;
        $len = strlen($sql);
        for ($i = 0; $i < $len; $i++) {
            $ch = $sql[$i];
            if ($ch === "'" && !$inDouble) {
                // Toggle single quotes unless escaped
                $escaped = ($i > 0 && $sql[$i - 1] === '\\');
                if (!$escaped) { $inSingle = !$inSingle; }
                $current .= $ch;
                continue;
            }
            if ($ch === '"' && !$inSingle) {
                // Toggle double quotes unless escaped
                $escaped = ($i > 0 && $sql[$i - 1] === '\\');
                if (!$escaped) { $inDouble = !$inDouble; }
                $current .= $ch;
                continue;
            }
            if ($ch === ';' && !$inSingle && !$inDouble) {
                $trimmed = trim($current);
                if ($trimmed !== '') { $statements[] = $trimmed; }
                $current = '';
            } else {
                $current .= $ch;
            }
        }
        $trimmed = trim($current);
        if ($trimmed !== '') { $statements[] = $trimmed; }
        return $statements;
    }
}

// Core migrations handler
$migrateHandler = function (Request $request, Response $response) {
    $db = $this->get('db');

    $result = [
        'created_database' => false,
        'applied' => [],
        'skipped' => [],
    ];

    try {
        // Ensure connection exists; for SQLite this will create the file if not present
        $driver = $db->getAttribute(PDO::ATTR_DRIVER_NAME);
        $isSqlite = ($driver === 'sqlite');

        // Ensure migrations table exists (so we can track what has been applied)
        $db->exec('CREATE TABLE IF NOT EXISTS db_migration (
            id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
            num INTEGER NOT NULL,
            migration_date DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
            filename VARCHAR(100) NOT NULL
        );');

        // Load already applied migrations
        $applied = [];
        $stmt = $db->query('SELECT num, filename FROM db_migration');
        if ($stmt) {
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                $applied[(int)$row['num']] = $row['filename'];
            }
        }

        // Locate migration files
        $rootDir = dirname(__DIR__, 3); // project root
        $migrationsDir = $rootDir . DIRECTORY_SEPARATOR . 'migrations';

        if (!is_dir($migrationsDir)) {
            throw new Exception('Migrations directory not found: ' . $migrationsDir);
        }

        $files = scandir($migrationsDir) ?: [];
        $migrations = [];
        foreach ($files as $f) {
            if ($f === '.' || $f === '..') {
                continue;
            }
            if (substr($f, -4) !== '.sql') {
                continue;
            }
            // Expect pattern NUM-description.sql, where NUM can be 000, 001, ... or integer
            $dashPos = strpos($f, '-');
            if ($dashPos === false) {
                continue;
            }
            $numStr = substr($f, 0, $dashPos);
            if (!preg_match('/^\d+$/', $numStr)) { continue; }
            $num = (int)$numStr; // treat as integer order
            $migrations[$num] = [
                'num' => $num,
                'filename' => $f,
                'path' => $migrationsDir . DIRECTORY_SEPARATOR . $f,
            ];
        }

        ksort($migrations, SORT_NUMERIC);

        // Apply pending migrations in order
        foreach ($migrations as $num => $mig) {
            if (array_key_exists($num, $applied)) {
                $result['skipped'][] = $mig['filename'];
                continue;
            }

            $sql = file_get_contents($mig['path']);
            if ($sql === false) {
                throw new Exception('Unable to read migration file: ' . $mig['filename']);
            }

            try {
                $db->beginTransaction();

                // Some drivers accept multi-statements directly; to be safe, split
                $statements = splitSqlStatements($sql);
                foreach ($statements as $st) {
                    // Skip pdo/sql comments-only statements
                    if ($st === '' || preg_match('/^--/m', $st)) { continue; }
                    $db->exec($st);
                }

                // Record migration as applied
                $stmtIns = $db->prepare('INSERT INTO db_migration (num, filename) VALUES (?, ?)');
                $stmtIns->execute([$num, $mig['filename']]);

                $db->commit();
                $result['applied'][] = $mig['filename'];
            } catch (Exception $e) {
                if ($db->inTransaction()) {
                    $db->rollBack();
                }
                throw new Exception('Migration failed for ' . $mig['filename'] . ': ' . $e->getMessage());
            }
        }

        $response->getBody()->write(json_encode(['migrate' => $result]));
        return $response->withHeader('Content-Type', 'application/json');
    } catch (Exception $e) {
        $response = $response->withStatus(500);
        $response->getBody()->write(json_encode(['error' => $e->getMessage()]));
        return $response->withHeader('Content-Type', 'application/json');
    }
};

// Expose both GET and POST for convenience under new path
$app->get('/api/migrations/migrate', $migrateHandler)->add($adminMiddleware);
$app->post('/api/migrations/migrate', $migrateHandler)->add($adminMiddleware);

// List available migrations with status (public, no auth)
$app->get('/api/migrations/list', function (Request $request, Response $response) {
    try {
        $db = $this->get('db');

        // Ensure tracking table exists
        $db->exec('CREATE TABLE IF NOT EXISTS db_migration (
            id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
            num INTEGER NOT NULL,
            migration_date DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
            filename VARCHAR(100) NOT NULL
        );');

        // Load applied migrations with their date
        $applied = [];
        $stmt = $db->query('SELECT num, filename, migration_date FROM db_migration');
        if ($stmt) {
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                $applied[(int)$row['num']] = [
                    'filename' => $row['filename'],
                    'migration_date' => $row['migration_date'],
                ];
            }
        }

        // Scan migrations directory
        $rootDir = dirname(__DIR__, 3);
        $migrationsDir = $rootDir . DIRECTORY_SEPARATOR . 'migrations';
        if (!is_dir($migrationsDir)) {
            throw new Exception('Migrations directory not found: ' . $migrationsDir);
        }

        $files = scandir($migrationsDir) ?: [];
        $items = [];
        foreach ($files as $f) {
            if ($f === '.' || $f === '..') { continue; }
            if (substr($f, -4) !== '.sql') { continue; }
            $dashPos = strpos($f, '-');
            if ($dashPos === false) { continue; }
            $numStr = substr($f, 0, $dashPos);
            if (!preg_match('/^\d+$/', $numStr)) { continue; }
            $num = (int)$numStr;

            $isPassed = array_key_exists($num, $applied);
            $migrationDate = $isPassed ? ($applied[$num]['migration_date'] ?? null) : null;

            $items[] = [
                'num' => $num,
                'filename' => $f,
                'passed' => $isPassed,
                'migration_date' => $migrationDate,
            ];
        }

        // Sort by num desc
        usort($items, function ($a, $b) {
            return $b['num'] <=> $a['num'];
        });

        $response->getBody()->write(json_encode(['migrations' => $items]));
        return $response->withHeader('Content-Type', 'application/json');
    } catch (Exception $e) {
        $response = $response->withStatus(500);
        $response->getBody()->write(json_encode(['error' => $e->getMessage()]));
        return $response->withHeader('Content-Type', 'application/json');
    }
});
