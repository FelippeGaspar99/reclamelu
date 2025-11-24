<?php

declare(strict_types=1);

namespace App;

class Router
{
    private array $routes = [];

    public function add(string $method, string $path, callable $handler): void
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
        $pattern = preg_replace('#\{([a-zA-Z0-9_]+):([^}]+)\}#', '(?P<$1>$2)', $path);
        $pattern = preg_replace('#\{([a-zA-Z0-9_]+)\}#', '(?P<$1>[^/]+)', $pattern);
        return '#^' . $pattern . '$#';
    }

    public function dispatch(string $method, string $uri): void
    {
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
