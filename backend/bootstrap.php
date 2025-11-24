<?php

declare(strict_types=1);

require_once __DIR__ . '/src/Utils/helpers.php';
require_once __DIR__ . '/src/Utils/Jwt.php';

// Simple environment loader (.env key=value)
function load_env(string $path): void
{
    if (!file_exists($path)) {
        return;
    }
    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (str_starts_with(trim($line), '#')) {
            continue;
        }
        [$name, $value] = array_map('trim', explode('=', $line, 2));
        if (!array_key_exists($name, $_ENV)) {
            $_ENV[$name] = $value;
        }
    }
}

function env(string $key, mixed $default = null): mixed
{
    return $_ENV[$key] ?? getenv($key) ?: $default;
}

load_env(__DIR__ . '/.env');

// Shared PDO connection
function db(): PDO
{
    static $pdo = null;
    if ($pdo instanceof PDO) {
        return $pdo;
    }

    $host = env('DB_HOST', '127.0.0.1');
    $port = env('DB_PORT', '3306');
    $db = env('DB_DATABASE', 'reclame_lu');
    $user = env('DB_USERNAME', 'root');
    $pass = env('DB_PASSWORD', '');

    $dsn = "mysql:host=$host;port=$port;dbname=$db;charset=utf8mb4";
    $options = [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ];

    $pdo = new PDO($dsn, $user, $pass, $options);
    return $pdo;
}
