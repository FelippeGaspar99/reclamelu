<?php

declare(strict_types=1);

namespace App\Controllers;

class UserController
{
    public static function index(): void
    {
        require_auth(['admin']);
        $pdo = db();
        $rows = $pdo->query('SELECT id, name, email, role, active, created_at, updated_at FROM users')->fetchAll();
        json_response($rows);
    }

    public static function show(array $params): void
    {
        require_auth(['admin']);
        $pdo = db();
        $stmt = $pdo->prepare('SELECT id, name, email, role, active, created_at, updated_at FROM users WHERE id = :id');
        $stmt->execute(['id' => $params['id']]);
        $user = $stmt->fetch();
        if (!$user) {
            json_response(['message' => 'Usuário não encontrado'], 404);
        }
        json_response($user);
    }

    public static function store(): void
    {
        require_auth(['admin']);
        $pdo = db();
        $data = read_json();
        $stmt = $pdo->prepare('INSERT INTO users (name, email, password_hash, role, active) VALUES (:name, :email, :password_hash, :role, :active)');
        $stmt->execute([
            'name' => $data['name'] ?? '',
            'email' => $data['email'] ?? '',
            'password_hash' => password_hash($data['password'] ?? '', PASSWORD_BCRYPT),
            'role' => $data['role'] ?? 'viewer',
            'active' => $data['active'] ?? 1,
        ]);
        json_response(['id' => $pdo->lastInsertId()], 201);
    }

    public static function update(array $params): void
    {
        require_auth(['admin']);
        $pdo = db();
        $data = read_json();
        $fields = ['name', 'email', 'role', 'active'];
        $sets = [];
        $bind = ['id' => $params['id']];
        foreach ($fields as $f) {
            if (array_key_exists($f, $data)) {
                $sets[] = "$f = :$f";
                $bind[$f] = $data[$f];
            }
        }
        if (isset($data['password'])) {
            $sets[] = 'password_hash = :password_hash';
            $bind['password_hash'] = password_hash($data['password'], PASSWORD_BCRYPT);
        }
        if (!$sets) {
            json_response(['message' => 'Nada para atualizar'], 400);
        }
        $sql = 'UPDATE users SET ' . implode(', ', $sets) . ' WHERE id = :id';
        $pdo->prepare($sql)->execute($bind);
        json_response(['message' => 'Usuário atualizado']);
    }

    public static function destroy(array $params): void
    {
        require_auth(['admin']);
        $pdo = db();
        $pdo->prepare('DELETE FROM users WHERE id = :id')->execute(['id' => $params['id']]);
        json_response(['message' => 'Usuário removido']);
    }
}
