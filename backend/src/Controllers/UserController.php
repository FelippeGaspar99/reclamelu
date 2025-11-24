<?php

declare(strict_types=1);

namespace App\Controllers;

class UserController
{
    public static function index(): void
    {
        require_admin_owner();
        $pdo = db();
        $users = $pdo->query('SELECT id, name, email, role, active, created_at, updated_at FROM users')->fetchAll();
        json_response($users);
    }

    public static function show(array $params): void
    {
        require_admin_owner();
        $pdo = db();
        $stmt = $pdo->prepare('SELECT id, name, email, role, active, created_at, updated_at FROM users WHERE id = :id');
        $stmt->execute(['id' => $params['id']]);
        $user = $stmt->fetch();
        if (!$user) {
            json_response(['message' => 'Registro não encontrado'], 404);
        }
        json_response($user);
    }

    public static function store(): void
    {
        require_admin_owner();
        $pdo = db();
        $data = read_json_body();
        validate($data, [
            'name' => 'required',
            'email' => 'required',
            'password' => 'required',
            'role' => 'required',
        ]);
        $stmt = $pdo->prepare('INSERT INTO users (name, email, password_hash, role, active) VALUES (:name, :email, :password_hash, :role, :active)');
        try {
            $stmt->execute([
                'name' => $data['name'],
                'email' => $data['email'],
                'password_hash' => password_hash($data['password'], PASSWORD_BCRYPT),
                'role' => $data['role'],
                'active' => $data['active'] ?? 1,
            ]);
        } catch (\PDOException $e) {
            json_response(['message' => 'Falha ao criar usuário', 'error' => $e->getMessage()], 400);
        }
        json_response(['id' => $pdo->lastInsertId()], 201);
    }

    public static function update(array $params): void
    {
        require_admin_owner();
        $pdo = db();
        $data = read_json_body();
        $fields = ['name', 'email', 'role', 'active'];
        $sets = [];
        $bind = ['id' => $params['id']];
        foreach ($fields as $field) {
            if (array_key_exists($field, $data)) {
                $sets[] = "$field = :$field";
                $bind[$field] = $data[$field];
            }
        }
        if (isset($data['password'])) {
            $sets[] = "password_hash = :password_hash";
            $bind['password_hash'] = password_hash($data['password'], PASSWORD_BCRYPT);
        }
        if (empty($sets)) {
            json_response(['message' => 'Nada a atualizar'], 400);
        }
        $sql = 'UPDATE users SET ' . implode(', ', $sets) . ' WHERE id = :id';
        $pdo->prepare($sql)->execute($bind);
        json_response(['message' => 'Usuário atualizado']);
    }

    public static function destroy(array $params): void
    {
        require_admin_owner();
        $pdo = db();
        $pdo->prepare('UPDATE users SET active = 0 WHERE id = :id')->execute(['id' => $params['id']]);
        json_response(['message' => 'Usuário desativado']);
    }
}
