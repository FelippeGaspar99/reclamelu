<?php

declare(strict_types=1);

namespace App\Controllers;

class CatalogController
{
    private static array $schemas = [
        'stores' => ['fields' => ['name', 'code', 'active']],
        'complaint_types' => ['fields' => ['name', 'description', 'active']],
        'channels' => ['fields' => ['name']],
        'complaint_statuses' => ['fields' => ['name', 'is_final']],
    ];

    private static function ensureResource(string $resource): array
    {
        if (!isset(self::$schemas[$resource])) {
            json_response(['message' => 'Recurso não encontrado'], 404);
        }
        return self::$schemas[$resource];
    }

    public static function index(array $params): void
    {
        require_auth(); // allow all authenticated to read
        $resource = $params['resource'];
        self::ensureResource($resource);
        $pdo = db();
        $items = $pdo->query("SELECT * FROM {$resource}")->fetchAll();
        json_response($items);
    }

    public static function store(array $params): void
    {
        require_admin_owner();
        $resource = $params['resource'];
        $schema = self::ensureResource($resource);
        $data = read_json_body();
        $fields = [];
        $bind = [];
        foreach ($schema['fields'] as $field) {
            if (array_key_exists($field, $data)) {
                $fields[$field] = $data[$field];
            }
        }
        if (empty($fields)) {
            json_response(['message' => 'Dados obrigatórios ausentes'], 400);
        }
        $cols = implode(',', array_keys($fields));
        $placeholders = implode(',', array_map(fn($f) => ':' . $f, array_keys($fields)));
        $stmt = db()->prepare("INSERT INTO {$resource} ({$cols}) VALUES ({$placeholders})");
        $stmt->execute($fields);
        json_response(['id' => db()->lastInsertId()], 201);
    }

    public static function update(array $params): void
    {
        require_admin_owner();
        $resource = $params['resource'];
        $schema = self::ensureResource($resource);
        $data = read_json_body();
        $pairs = [];
        $bind = ['id' => $params['id']];
        foreach ($schema['fields'] as $field) {
            if (array_key_exists($field, $data)) {
                $pairs[] = "$field = :$field";
                $bind[$field] = $data[$field];
            }
        }
        if (empty($pairs)) {
            json_response(['message' => 'Nada a atualizar'], 400);
        }
        $sql = "UPDATE {$resource} SET " . implode(', ', $pairs) . " WHERE id = :id";
        db()->prepare($sql)->execute($bind);
        json_response(['message' => 'Atualizado com sucesso']);
    }

    public static function destroy(array $params): void
    {
        require_admin_owner();
        $resource = $params['resource'];
        self::ensureResource($resource);
        db()->prepare("DELETE FROM {$resource} WHERE id = :id")->execute(['id' => $params['id']]);
        json_response(['message' => 'Removido com sucesso']);
    }
}
