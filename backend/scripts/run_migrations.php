<?php

declare(strict_types=1);

require_once __DIR__ . '/../bootstrap.php';

$pdo = db();
$sql = file_get_contents(__DIR__ . '/../database/migrations.sql');

try {
    $pdo->exec($sql);
    echo "Migrations executed successfully.\n";
} catch (PDOException $e) {
    echo "Migration error: " . $e->getMessage() . "\n";
    exit(1);
}
