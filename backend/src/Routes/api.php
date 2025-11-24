<?php

declare(strict_types=1);

namespace App\Routes;

use App\Controllers\AuthController;
use App\Controllers\UserController;
use App\Controllers\ComplaintController;
use App\Controllers\MetricsController;

class ApiRouter
{
    private array $routes = [];

    public function __construct()
    {
        $this->register();
    }

    private function add(string $method, string $path, callable $handler): void
    {
        $this->routes[] = [
            'method' => strtoupper($method),
            'path' => $path,
            'regex' => $this->compile($path),
            'handler' => $handler,
        ];
    }

    private function compile(string $path): string
    {
        $pattern = preg_replace('#\{([a-zA-Z0-9_]+)\}#', '(?P<$1>[^/]+)', $path);
        return '#^' . $pattern . '$#';
    }

    private function register(): void
    {
        // Auth
        $this->add('POST', '/api/login', fn() => AuthController::login());
        $this->add('GET', '/api/me', fn() => AuthController::me());
        $this->add('POST', '/api/logout', fn() => AuthController::logout());

        // Users
        $this->add('GET', '/api/users', fn() => UserController::index());
        $this->add('POST', '/api/users', fn() => UserController::store());
        $this->add('GET', '/api/users/{id}', fn($p) => UserController::show($p));
        $this->add('PUT', '/api/users/{id}', fn($p) => UserController::update($p));
        $this->add('DELETE', '/api/users/{id}', fn($p) => UserController::destroy($p));

        // Complaints
        $this->add('GET', '/api/complaints', fn() => ComplaintController::index());
        $this->add('GET', '/api/complaints/{id}', fn($p) => ComplaintController::show($p));
        $this->add('POST', '/api/complaints', fn() => ComplaintController::store());
        $this->add('PUT', '/api/complaints/{id}', fn($p) => ComplaintController::update($p));
        $this->add('PATCH', '/api/complaints/{id}/status', fn($p) => ComplaintController::updateStatus($p));
        $this->add('PATCH', '/api/complaints/{id}/assign', fn($p) => ComplaintController::assign($p));

        // Metrics
        $this->add('GET', '/api/metrics/days-without-complaints/global', fn() => MetricsController::daysGlobal());
        $this->add('GET', '/api/metrics/days-without-complaints/by-store', fn() => MetricsController::daysByStore());
        $this->add('GET', '/api/metrics/days-without-complaints/by-type', fn() => MetricsController::daysByType());
        $this->add('GET', '/api/metrics/record-days-without-complaints/global', fn() => MetricsController::recordGlobal());
        $this->add('GET', '/api/metrics/record-days-without-complaints/by-store', fn() => MetricsController::recordByStore());
        $this->add('GET', '/api/metrics/record-days-without-complaints/by-type', fn() => MetricsController::recordByType());
    }

    public function dispatch(string $method, string $uri): void
    {
        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            http_response_code(204);
            exit;
        }

        $path = parse_url($uri, PHP_URL_PATH);
        foreach ($this->routes as $route) {
            if ($route['method'] !== $method) {
                continue;
            }
            if (preg_match($route['regex'], $path, $matches)) {
                $params = array_filter(
                    $matches,
                    fn($k) => !is_int($k),
                    ARRAY_FILTER_USE_KEY
                );
                ($route['handler'])($params);
                return;
            }
        }
        http_response_code(404);
        echo json_encode(['message' => 'Rota não encontrada']);
    }
}
