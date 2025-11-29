<?php

declare(strict_types=1);

$basePath = dirname(__DIR__); // /backend

// Middleware CORS global
header('Access-Control-Allow-Origin: https://reclameeluu.vercel.app');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

// Autoload simples do namespace App\
spl_autoload_register(function ($class) use ($basePath) {
    $prefix = 'App\\';
    if (str_starts_with($class, $prefix)) {
        $relative = substr($class, strlen($prefix));
        $file = $basePath . '/src/' . str_replace('\\', '/', $relative) . '.php';
        if (file_exists($file)) {
            require $file;
        }
    }
});

require $basePath . '/config/database.php';
require $basePath . '/src/helpers.php';
require $basePath . '/src/Routes/api.php';
