<?php

declare(strict_types=1);

$basePath = dirname(__DIR__); // aponta para /backend
require $basePath . '/config/bootstrap.php';

set_exception_handler(function ($e) {
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode(['message' => 'Erro interno', 'error' => $e->getMessage()]);
    exit;
});

$router = new App\Routes\ApiRouter();
$router->dispatch($_SERVER['REQUEST_METHOD'], $_SERVER['REQUEST_URI']);
