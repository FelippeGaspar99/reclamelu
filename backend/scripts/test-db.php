<?php

declare(strict_types=1);

// Script simples para testar conexão com o banco usando config/env
$basePath = dirname(__DIR__);
require $basePath . '/config/bootstrap.php';

try {
    $pdo = db();
    $row = $pdo->query('SELECT NOW() as agora')->fetch();
    echo "Conexão OK. Hora do servidor DB: " . ($row['agora'] ?? '---') . PHP_EOL;
} catch (Throwable $e) {
    echo "Falha na conexão: " . $e->getMessage() . PHP_EOL;
    exit(1);
}
