<?php

declare(strict_types=1);

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

require_once __DIR__ . '/../bootstrap.php';
require_once __DIR__ . '/../src/Router.php';
require_once __DIR__ . '/../src/Controllers/AuthController.php';
require_once __DIR__ . '/../src/Controllers/UserController.php';
require_once __DIR__ . '/../src/Controllers/CatalogController.php';
require_once __DIR__ . '/../src/Controllers/ComplaintController.php';
require_once __DIR__ . '/../src/Controllers/MetricsController.php';
require_once __DIR__ . '/../src/Services/MetricsService.php';

use App\Router;
use App\Controllers\AuthController;
use App\Controllers\UserController;
use App\Controllers\CatalogController;
use App\Controllers\ComplaintController;
use App\Controllers\MetricsController;

$router = new Router();

// Auth
$router->add('POST', '/api/auth/login', fn() => AuthController::login());
$router->add('POST', '/api/auth/logout', fn() => AuthController::logout());
$router->add('GET', '/api/auth/me', fn() => AuthController::me());

// Users (admin)
$router->add('GET', '/api/users', fn() => UserController::index());
$router->add('POST', '/api/users', fn() => UserController::store());
$router->add('GET', '/api/users/{id}', fn($p) => UserController::show($p));
$router->add('PUT', '/api/users/{id}', fn($p) => UserController::update($p));
$router->add('DELETE', '/api/users/{id}', fn($p) => UserController::destroy($p));

// Catalog resources
$router->add('GET', '/api/{resource:(stores|complaint_types|channels|complaint_statuses)}', fn($p) => CatalogController::index($p));
$router->add('POST', '/api/{resource:(stores|complaint_types|channels|complaint_statuses)}', fn($p) => CatalogController::store($p));
$router->add('PUT', '/api/{resource:(stores|complaint_types|channels|complaint_statuses)}/{id}', fn($p) => CatalogController::update($p));
$router->add('DELETE', '/api/{resource:(stores|complaint_types|channels|complaint_statuses)}/{id}', fn($p) => CatalogController::destroy($p));

// Complaints
$router->add('GET', '/api/complaints', fn() => ComplaintController::index());
$router->add('GET', '/api/complaints/{id}', fn($p) => ComplaintController::show($p));
$router->add('POST', '/api/complaints', fn() => ComplaintController::store());
$router->add('PUT', '/api/complaints/{id}', fn($p) => ComplaintController::update($p));
$router->add('PATCH', '/api/complaints/{id}/status', fn($p) => ComplaintController::updateStatus($p));
$router->add('PATCH', '/api/complaints/{id}/assign', fn($p) => ComplaintController::assign($p));

// Interactions
$router->add('GET', '/api/complaints/{id}/interactions', fn($p) => ComplaintController::interactions($p));
$router->add('POST', '/api/complaints/{id}/interactions', fn($p) => ComplaintController::addInteraction($p));

// Dashboard
$router->add('GET', '/api/dashboard/summary', fn() => ComplaintController::summary());

// Metrics
$router->add('GET', '/api/metrics/days-without-complaints/global', fn() => MetricsController::global());
$router->add('GET', '/api/metrics/days-without-complaints/by-store', fn() => MetricsController::byStore());
$router->add('GET', '/api/metrics/days-without-complaints/by-type', fn() => MetricsController::byType());
$router->add('GET', '/api/metrics/record-days-without-complaints/global', fn() => MetricsController::recordGlobal());
$router->add('GET', '/api/metrics/record-days-without-complaints/by-store', fn() => MetricsController::recordByStore());
$router->add('GET', '/api/metrics/record-days-without-complaints/by-type', fn() => MetricsController::recordByType());

try {
    $router->dispatch($_SERVER['REQUEST_METHOD'], $_SERVER['REQUEST_URI']);
} catch (Throwable $e) {
    json_response(['message' => 'Erro interno do servidor', 'error' => $e->getMessage()], 500);
}
