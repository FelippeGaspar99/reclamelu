<?php

declare(strict_types=1);

require_once __DIR__ . '/../bootstrap.php';

$pdo = db();

// Seed complaint statuses
$statuses = [
    ['name' => 'Novo', 'old' => 'New', 'is_final' => 0],
    ['name' => 'Em andamento', 'old' => 'In Progress', 'is_final' => 0],
    ['name' => 'Aguardando cliente', 'old' => 'Waiting for Customer', 'is_final' => 0],
    ['name' => 'Resolvido', 'old' => 'Resolved', 'is_final' => 1],
    ['name' => 'Fechado sem solução', 'old' => 'Closed Without Solution', 'is_final' => 1],
    ['name' => 'Cancelado', 'old' => 'Canceled', 'is_final' => 1],
];

$stmt = $pdo->prepare('UPDATE complaint_statuses SET name = :name WHERE name = :old');
foreach ($statuses as $s) {
    if (!empty($s['old'])) {
        $stmt->execute(['name' => $s['name'], 'old' => $s['old']]);
    }
}
$stmt = $pdo->prepare('INSERT INTO complaint_statuses (name, is_final) VALUES (:name, :is_final) ON DUPLICATE KEY UPDATE is_final = VALUES(is_final), name = VALUES(name)');
foreach ($statuses as $s) {
    $stmt->execute(['name' => $s['name'], 'is_final' => $s['is_final']]);
}

// Seed complaint types
$types = [
    ['name' => 'Atendimento', 'old' => 'Customer Service', 'description' => 'Atendimento ao cliente'],
    ['name' => 'Produto', 'old' => 'Product', 'description' => 'Produto ou serviço'],
    ['name' => 'Entrega', 'old' => 'Delivery', 'description' => 'Entrega e logística'],
    ['name' => 'Cobrança', 'old' => 'Billing', 'description' => 'Cobrança e pagamentos'],
    ['name' => 'Site/App', 'old' => 'Website', 'description' => 'Problemas no site ou app'],
];
$stmt = $pdo->prepare('UPDATE complaint_types SET name = :name, description = :description WHERE name = :old');
foreach ($types as $t) {
    if (!empty($t['old'])) {
        $stmt->execute(['name' => $t['name'], 'description' => $t['description'], 'old' => $t['old']]);
    }
}
$stmt = $pdo->prepare('INSERT INTO complaint_types (name, description, active) VALUES (:name, :description, 1) ON DUPLICATE KEY UPDATE name = VALUES(name), description = VALUES(description), active = 1');
foreach ($types as $t) {
    $stmt->execute(['name' => $t['name'], 'description' => $t['description']]);
}

// Seed channels
$channels = [
    ['name' => 'WhatsApp', 'old' => null],
    ['name' => 'Instagram', 'old' => null],
    ['name' => 'Loja física', 'old' => 'Physical Store'],
    ['name' => 'E-mail', 'old' => 'Email'],
    ['name' => 'Telefone', 'old' => 'Phone'],
    ['name' => 'Site', 'old' => 'Website'],
];
$stmt = $pdo->prepare('UPDATE channels SET name = :name WHERE name = :old');
foreach ($channels as $c) {
    if (!empty($c['old'])) {
        $stmt->execute(['name' => $c['name'], 'old' => $c['old']]);
    }
}
$stmt = $pdo->prepare('INSERT INTO channels (name) VALUES (:name) ON DUPLICATE KEY UPDATE name = VALUES(name)');
foreach ($channels as $c) {
    $stmt->execute(['name' => $c['name']]);
}

// Seed stores
$stores = [
    ['name' => 'Matriz', 'old' => 'Headquarters', 'code' => 'MAT'],
    ['name' => 'Loja 01', 'old' => 'Store 01', 'code' => 'L01'],
];
$stmt = $pdo->prepare('UPDATE stores SET name = :name, code = :code WHERE name = :old');
foreach ($stores as $s) {
    if (!empty($s['old'])) {
        $stmt->execute(['name' => $s['name'], 'code' => $s['code'], 'old' => $s['old']]);
    }
}
$stmt = $pdo->prepare('INSERT INTO stores (name, code, active) VALUES (:name, :code, 1) ON DUPLICATE KEY UPDATE name = VALUES(name), code = VALUES(code), active = 1');
foreach ($stores as $s) {
    $stmt->execute(['name' => $s['name'], 'code' => $s['code']]);
}

// Seed admin user
$adminEmail = 'admin@company.com';
$exists = $pdo->prepare('SELECT id FROM users WHERE email = :email LIMIT 1');
$exists->execute(['email' => $adminEmail]);
if (!$exists->fetch()) {
    $insert = $pdo->prepare('INSERT INTO users (name, email, password_hash, role, active) VALUES (:name, :email, :password_hash, :role, 1)');
    $insert->execute([
        'name' => 'System Admin',
        'email' => $adminEmail,
        'password_hash' => password_hash('admin123', PASSWORD_BCRYPT),
        'role' => 'admin',
    ]);
}

echo "Seed completed\n";
