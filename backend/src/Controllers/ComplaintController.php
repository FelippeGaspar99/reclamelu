<?php

declare(strict_types=1);

namespace App\Controllers;

class ComplaintController
{
    public static function index(): void
    {
        require_auth();
        $pdo = db();
        $params = $_GET;

        $select = "SELECT c.*, s.name AS store_name, ct.name AS type_name, ch.name AS channel_name, st.name AS status_name, u.name AS created_by_name, au.name AS assigned_to_name
            FROM complaints c
            JOIN stores s ON c.store_id = s.id
            JOIN complaint_types ct ON c.complaint_type_id = ct.id
            JOIN channels ch ON c.channel_id = ch.id
            JOIN complaint_statuses st ON c.status_id = st.id
            JOIN users u ON c.created_by_user_id = u.id
            LEFT JOIN users au ON c.assigned_to_user_id = au.id";
        $where = " WHERE 1=1";
        $bind = [];

        $filters = ['status_id', 'complaint_type_id', 'store_id', 'channel_id', 'priority', 'assigned_to_user_id'];
        foreach ($filters as $f) {
            if (!empty($params[$f])) {
                $where .= " AND c.$f = :$f";
                $bind[$f] = $params[$f];
            }
        }
        if (!empty($params['date_from'])) {
            $where .= " AND c.opened_at >= :date_from";
            $bind['date_from'] = $params['date_from'];
        }
        if (!empty($params['date_to'])) {
            $where .= " AND c.opened_at < :date_to_end";
            $bind['date_to_end'] = date('Y-m-d', strtotime($params['date_to'] . ' +1 day'));
        }
        if (!empty($params['q'])) {
            $searchFields = ['c.title', 'c.description', 'c.customer_name', 'c.protocol', 's.name', 'ct.name', 'ch.name', 'u.name', 'au.name'];
            $parts = [];
            foreach ($searchFields as $idx => $field) {
                $key = "q$idx";
                $parts[] = "$field LIKE :$key";
                $bind[$key] = '%' . $params['q'] . '%';
            }
            $where .= ' AND (' . implode(' OR ', $parts) . ')';
        }

        $page = max(1, (int)($params['page'] ?? 1));
        $per = max(1, min(100, (int)($params['per_page'] ?? 20)));
        $offset = ($page - 1) * $per;

        $countSql = "SELECT COUNT(*) FROM complaints c
            JOIN stores s ON c.store_id = s.id
            JOIN complaint_types ct ON c.complaint_type_id = ct.id
            JOIN channels ch ON c.channel_id = ch.id
            JOIN complaint_statuses st ON c.status_id = st.id
            JOIN users u ON c.created_by_user_id = u.id
            LEFT JOIN users au ON c.assigned_to_user_id = au.id" . $where;
        $countStmt = $pdo->prepare($countSql);
        foreach ($bind as $k => $v) {
            $countStmt->bindValue(':' . $k, $v, is_int($v) ? \PDO::PARAM_INT : \PDO::PARAM_STR);
        }
        $countStmt->execute();
        $total = (int)$countStmt->fetchColumn();

        $sql = $select . $where . " ORDER BY c.created_at DESC LIMIT :limit OFFSET :offset";
        $stmt = $pdo->prepare($sql);
        foreach ($bind as $k => $v) {
            $stmt->bindValue(':' . $k, $v, is_int($v) ? \PDO::PARAM_INT : \PDO::PARAM_STR);
        }
        $stmt->bindValue(':limit', $per, \PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, \PDO::PARAM_INT);
        $stmt->execute();
        $data = $stmt->fetchAll();

        json_response(['data' => $data, 'meta' => ['page' => $page, 'per_page' => $per, 'total' => $total]]);
    }

    public static function show(array $params): void
    {
        require_auth();
        $pdo = db();
        $stmt = $pdo->prepare("SELECT c.*, s.name AS store_name, ct.name AS type_name, ch.name AS channel_name, st.name AS status_name, u.name AS created_by_name, au.name AS assigned_to_name
            FROM complaints c
            JOIN stores s ON c.store_id = s.id
            JOIN complaint_types ct ON c.complaint_type_id = ct.id
            JOIN channels ch ON c.channel_id = ch.id
            JOIN complaint_statuses st ON c.status_id = st.id
            JOIN users u ON c.created_by_user_id = u.id
            LEFT JOIN users au ON c.assigned_to_user_id = au.id
            WHERE c.id = :id");
        $stmt->execute(['id' => $params['id']]);
        $complaint = $stmt->fetch();
        if (!$complaint) {
            json_response(['message' => 'Reclamação não encontrada'], 404);
        }
        json_response($complaint);
    }

    public static function store(): void
    {
        $user = require_auth(['admin', 'sac']);
        $pdo = db();
        $data = read_json();
        $protocol = self::generateProtocol($pdo);
        $stmt = $pdo->prepare('INSERT INTO complaints (protocol, customer_name, customer_contact, order_id, store_id, complaint_type_id, channel_id, status_id, priority, title, description, created_by_user_id, assigned_to_user_id, opened_at) VALUES (:protocol, :customer_name, :customer_contact, :order_id, :store_id, :complaint_type_id, :channel_id, :status_id, :priority, :title, :description, :created_by_user_id, :assigned_to_user_id, NOW())');
        $stmt->execute([
            'protocol' => $protocol,
            'customer_name' => $data['customer_name'] ?? '',
            'customer_contact' => $data['customer_contact'] ?? null,
            'order_id' => $data['order_id'] ?? null,
            'store_id' => $data['store_id'] ?? null,
            'complaint_type_id' => $data['complaint_type_id'] ?? null,
            'channel_id' => $data['channel_id'] ?? null,
            'status_id' => $data['status_id'] ?? 1,
            'priority' => $data['priority'] ?? 'medium',
            'title' => $data['title'] ?? '',
            'description' => $data['description'] ?? '',
            'created_by_user_id' => $user['sub'],
            'assigned_to_user_id' => $data['assigned_to_user_id'] ?? null,
        ]);
        json_response(['id' => $pdo->lastInsertId(), 'protocol' => $protocol], 201);
    }

    private static function generateProtocol(\PDO $pdo): string
    {
        $year = date('Y');
        $next = (int)$pdo->query('SELECT IFNULL(MAX(id),0)+1 FROM complaints')->fetchColumn();
        return 'RA-' . $year . '-' . str_pad((string)$next, 4, '0', STR_PAD_LEFT);
    }

    public static function update(array $params): void
    {
        require_auth(['admin', 'sac']);
        $pdo = db();
        $data = read_json();
        $fields = ['customer_name', 'customer_contact', 'order_id', 'store_id', 'complaint_type_id', 'channel_id', 'priority', 'title', 'description', 'assigned_to_user_id'];
        $sets = [];
        $bind = ['id' => $params['id']];
        foreach ($fields as $f) {
            if (array_key_exists($f, $data)) {
                $sets[] = "$f = :$f";
                $bind[$f] = $data[$f];
            }
        }
        if (!$sets) {
            json_response(['message' => 'Nada para atualizar'], 400);
        }
        $sql = 'UPDATE complaints SET ' . implode(', ', $sets) . ' WHERE id = :id';
        $pdo->prepare($sql)->execute($bind);
        json_response(['message' => 'Reclamação atualizada']);
    }

    public static function updateStatus(array $params): void
    {
        $user = require_auth(['admin', 'sac']);
        $pdo = db();
        $data = read_json();
        if (empty($data['status_id'])) {
            json_response(['message' => 'status_id obrigatório'], 422);
        }
        $pdo->prepare('UPDATE complaints SET status_id = :s WHERE id = :id')->execute([
            's' => $data['status_id'],
            'id' => $params['id'],
        ]);
        $pdo->prepare('INSERT INTO complaint_interactions (complaint_id, user_id, type, from_status_id, to_status_id, message) VALUES (:c,:u,:t,:f,:to,:m)')
            ->execute([
                'c' => $params['id'],
                'u' => $user['sub'],
                't' => 'status_change',
                'f' => $data['from_status_id'] ?? null,
                'to' => $data['status_id'],
                'm' => $data['message'] ?? null,
            ]);
        json_response(['message' => 'Status atualizado']);
    }

    public static function assign(array $params): void
    {
        require_auth(['admin', 'sac']);
        $pdo = db();
        $data = read_json();
        $pdo->prepare('UPDATE complaints SET assigned_to_user_id = :u WHERE id = :id')->execute([
            'u' => $data['assigned_to_user_id'] ?? null,
            'id' => $params['id'],
        ]);
        json_response(['message' => 'Responsável atualizado']);
    }
}
