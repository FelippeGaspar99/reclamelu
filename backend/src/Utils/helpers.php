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

function read_json_body(): array
{
    $input = file_get_contents('php://input');
    $data = json_decode($input ?? '', true);
    return is_array($data) ? $data : [];
}

function current_user(): ?array
{
    return $GLOBALS['auth_user'] ?? null;
}

function is_admin_owner(array $user): bool
{
    $allowed = strtolower(env('ADMIN_OWNER_EMAIL', 'felippe@luembalagens.com'));
    return strtolower($user['email'] ?? '') === $allowed;
}

function require_admin_owner(): array
{
    $user = require_auth(['admin']);
    if (!is_admin_owner($user)) {
        json_response(['message' => 'Apenas Felippe pode acessar a administração'], 403);
    }
    return $user;
}

function require_auth(array $roles = []): array
{
    $headers = getallheaders();
    $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
    if (!str_starts_with($authHeader, 'Bearer ')) {
        json_response(['message' => 'Não autorizado'], 401);
    }
    $token = substr($authHeader, 7);
    $user = \App\Utils\Jwt::verify($token);
    if (!$user) {
        json_response(['message' => 'Token inválido'], 401);
    }
    if (!empty($roles) && !in_array($user['role'], $roles, true)) {
        json_response(['message' => 'Acesso negado'], 403);
    }
    $GLOBALS['auth_user'] = $user;
    return $user;
}

function validate(array $data, array $rules): array
{
    $errors = [];
    foreach ($rules as $field => $rule) {
        $required = str_contains($rule, 'required');
        if ($required && (!isset($data[$field]) || $data[$field] === '')) {
            $errors[$field] = 'obrigatório';
        }
    }
    if ($errors) {
        json_response(['message' => 'Falha de validação', 'errors' => $errors], 422);
    }
    return $data;
}
