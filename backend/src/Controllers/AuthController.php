<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Services\JwtService;

class AuthController
{
    public static function login(): void
    {
        $pdo = db();
        $data = read_json();
        $email = $data['email'] ?? '';
        $password = $data['password'] ?? '';

        $stmt = $pdo->prepare('SELECT * FROM users WHERE email = :email LIMIT 1');
        $stmt->execute(['email' => $email]);
        $user = $stmt->fetch();
        if (!$user || !password_verify($password, $user['password_hash']) || !(int)$user['active']) {
            json_response(['message' => 'Credenciais inválidas'], 401);
        }
        $payload = [
            'sub' => $user['id'],
            'name' => $user['name'],
            'email' => $user['email'],
            'role' => $user['role'],
        ];
        $token = JwtService::encode($payload);
        unset($user['password_hash']);
        json_response(['token' => $token, 'user' => $user]);
    }

    public static function me(): void
    {
        $user = require_auth();
        json_response(['user' => $user]);
    }

    public static function logout(): void
    {
        json_response(['message' => 'Logout realizado']);
    }
}
