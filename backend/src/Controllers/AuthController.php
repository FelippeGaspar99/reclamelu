<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Utils\Jwt;

class AuthController
{
    public static function login(): void
    {
        $pdo = db();
        $data = read_json_body();
        validate($data, [
            'email' => 'required',
            'password' => 'required',
        ]);

        $stmt = $pdo->prepare('SELECT * FROM users WHERE email = :email LIMIT 1');
        $stmt->execute(['email' => $data['email']]);
        $user = $stmt->fetch();
        if (!$user || !password_verify($data['password'], $user['password_hash']) || !$user['active']) {
            json_response(['message' => 'Credenciais inválidas'], 401);
        }
        $payload = [
            'sub' => $user['id'],
            'name' => $user['name'],
            'email' => $user['email'],
            'role' => $user['role'],
        ];
        $token = Jwt::encode($payload);
        unset($user['password_hash']);
        json_response(['token' => $token, 'user' => $user]);
    }

    public static function logout(): void
    {
        json_response(['message' => 'Sessão encerrada']);
    }

    public static function me(): void
    {
        $user = require_auth();
        json_response(['user' => $user]);
    }
}
