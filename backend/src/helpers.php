<?php

declare(strict_types=1);

function json_response(mixed $data, int $status = 200): void
{
    http_response_code($status);
    header('Content-Type: application/json');
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
    header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
    echo json_encode($data);
    exit;
}

function read_json(): array
{
    $raw = file_get_contents('php://input');
    $data = json_decode($raw ?: '[]', true);
    return is_array($data) ? $data : [];
}

function require_auth(array $roles = []): array
{
    $headers = getallheaders();
    $auth = $headers['Authorization'] ?? $headers['authorization'] ?? '';
    if (!str_starts_with($auth, 'Bearer ')) {
        json_response(['message' => 'Não autorizado'], 401);
    }
    $token = substr($auth, 7);
    $user = \App\Services\JwtService::verify($token);
    if (!$user) {
        json_response(['message' => 'Token inválido'], 401);
    }
    if ($roles && !in_array($user['role'], $roles, true)) {
        json_response(['message' => 'Acesso negado'], 403);
    }
    $GLOBALS['auth_user'] = $user;
    return $user;
}

function current_user(): ?array
{
    return $GLOBALS['auth_user'] ?? null;
}
