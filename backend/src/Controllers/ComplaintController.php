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
        foreach ($filters as $filter) {
            if (!empty($params[$filter])) {
                $where .= " AND c.$filter = :$filter";
                $bind[$filter] = $params[$filter];
            }
        }

        if (!empty($params['date_from'])) {
            $where .= " AND c.opened_at >= :date_from";
            $bind['date_from'] = $params['date_from'];
        }
        if (!empty($params['date_to'])) {
            // incluir o final do dia: usar menor que dia seguinte
            $where .= " AND c.opened_at < :date_to_end";
            $bind['date_to_end'] = date('Y-m-d', strtotime($params['date_to'] . ' +1 day'));
        }
        if (!empty($params['q'])) {
            $searchFields = [
                'c.title',
                'c.description',
                'c.customer_name',
                'c.protocol',
                's.name',
                'ct.name',
                'ch.name',
                'u.name',
                'au.name',
            ];
            $parts = [];
            $i = 0;
            foreach ($searchFields as $field) {
                $key = "q{$i}";
                $parts[] = "{$field} LIKE :{$key}";
                $bind[$key] = '%' . $params['q'] . '%';
                $i++;
            }
            $where .= ' AND (' . implode(' OR ', $parts) . ')';
        }

        $page = max(1, (int)($params['page'] ?? 1));
        $perPage = max(1, min(100, (int)($params['per_page'] ?? 20)));
        $offset = ($page - 1) * $perPage;

        $countSql = "SELECT COUNT(*) FROM complaints c
            JOIN stores s ON c.store_id = s.id
            JOIN complaint_types ct ON c.complaint_type_id = ct.id
            JOIN channels ch ON c.channel_id = ch.id
            JOIN complaint_statuses st ON c.status_id = st.id
            JOIN users u ON c.created_by_user_id = u.id
            LEFT JOIN users au ON c.assigned_to_user_id = au.id" . $where;
        $countStmt = $pdo->prepare($countSql);
        $countStmt->execute($bind);
        $total = (int)$countStmt->fetchColumn();

        $sql = $select . $where . " ORDER BY c.created_at DESC LIMIT :limit OFFSET :offset";
        $stmt = $pdo->prepare($sql);
        foreach ($bind as $k => $v) {
            $type = is_int($v) ? \PDO::PARAM_INT : \PDO::PARAM_STR;
            $stmt->bindValue(':' . $k, $v, $type);
        }
        $stmt->bindValue(':limit', $perPage, \PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, \PDO::PARAM_INT);
        $stmt->execute();
        $data = $stmt->fetchAll();

        json_response([
            'data' => $data,
            'meta' => [
                'page' => $page,
                'per_page' => $perPage,
                'total' => $total,
            ],
        ]);
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
            json_response(['message' => 'Registro não encontrado'], 404);
        }
        json_response($complaint);
    }

    public static function store(): void
    {
        $user = require_auth(['admin', 'sac']);
        $pdo = db();
        $data = read_json_body();
        validate($data, [
            'customer_name' => 'required',
            'store_id' => 'required',
            'complaint_type_id' => 'required',
            'channel_id' => 'required',
            'priority' => 'required',
            'title' => 'required',
            'description' => 'required',
        ]);

        $protocol = self::generateProtocol($pdo);
        $stmt = $pdo->prepare('INSERT INTO complaints (protocol, customer_name, customer_contact, order_id, store_id, complaint_type_id, channel_id, status_id, priority, title, description, created_by_user_id, assigned_to_user_id, opened_at) VALUES (:protocol, :customer_name, :customer_contact, :order_id, :store_id, :complaint_type_id, :channel_id, :status_id, :priority, :title, :description, :created_by_user_id, :assigned_to_user_id, NOW())');
        $stmt->execute([
            'protocol' => $protocol,
            'customer_name' => $data['customer_name'],
            'customer_contact' => $data['customer_contact'] ?? null,
            'order_id' => $data['order_id'] ?? null,
            'store_id' => $data['store_id'],
            'complaint_type_id' => $data['complaint_type_id'],
            'channel_id' => $data['channel_id'],
            'status_id' => $data['status_id'] ?? 1,
            'priority' => $data['priority'],
            'title' => $data['title'],
            'description' => $data['description'],
            'created_by_user_id' => $user['sub'],
            'assigned_to_user_id' => $data['assigned_to_user_id'] ?? null,
        ]);
        json_response(['id' => $pdo->lastInsertId(), 'protocol' => $protocol], 201);
    }

    private static function generateProtocol(\PDO $pdo): string
    {
        $year = date('Y');
        $next = (int)$pdo->query('SELECT IFNULL(MAX(id),0)+1 AS next_id FROM complaints')->fetchColumn();
        $sequence = str_pad((string)$next, 4, '0', STR_PAD_LEFT);
        return "RA-{$year}-{$sequence}";
    }

    public static function update(array $params): void
    {
        require_auth(['admin', 'sac']);
        $pdo = db();
        $data = read_json_body();
        $fields = ['customer_name', 'customer_contact', 'order_id', 'store_id', 'complaint_type_id', 'channel_id', 'priority', 'title', 'description', 'assigned_to_user_id'];
        $pairs = [];
        $bind = ['id' => $params['id']];
        foreach ($fields as $field) {
            if (array_key_exists($field, $data)) {
                $pairs[] = "$field = :$field";
                $bind[$field] = $data[$field];
            }
        }
        if (empty($pairs)) {
            json_response(['message' => 'Nada a atualizar'], 400);
        }
        $sql = 'UPDATE complaints SET ' . implode(', ', $pairs) . ' WHERE id = :id';
        $pdo->prepare($sql)->execute($bind);
        json_response(['message' => 'Atualizado com sucesso']);
    }

    public static function updateStatus(array $params): void
    {
        $user = require_auth(['admin', 'sac']);
        $pdo = db();
        $data = read_json_body();
        validate($data, ['status_id' => 'required']);
        $toStatus = $data['status_id'];
        $fromStatus = $pdo->prepare('SELECT status_id FROM complaints WHERE id = :id');
        $fromStatus->execute(['id' => $params['id']]);
        $prev = $fromStatus->fetchColumn();
        if (!$prev) {
            json_response(['message' => 'Reclamação não encontrada'], 404);
        }
        $closeDate = null;
        $finalCheck = $pdo->prepare('SELECT is_final FROM complaint_statuses WHERE id = :id');
        $finalCheck->execute(['id' => $toStatus]);
        $isFinal = (bool)$finalCheck->fetchColumn();
        if ($isFinal) {
            $closeDate = date('Y-m-d H:i:s');
        }

        $stmt = $pdo->prepare('UPDATE complaints SET status_id = :status_id, closed_at = :closed_at WHERE id = :id');
        $stmt->execute([
            'status_id' => $toStatus,
            'closed_at' => $closeDate,
            'id' => $params['id'],
        ]);

        $pdo->prepare('INSERT INTO complaint_interactions (complaint_id, user_id, type, from_status_id, to_status_id, message) VALUES (:complaint_id, :user_id, :type, :from_status_id, :to_status_id, :message)')
            ->execute([
                'complaint_id' => $params['id'],
                'user_id' => $user['sub'],
                'type' => 'status_change',
                'from_status_id' => $prev,
                'to_status_id' => $toStatus,
                'message' => $data['message'] ?? null,
            ]);

        json_response(['message' => 'Status atualizado']);
    }

    public static function assign(array $params): void
    {
        require_auth(['admin', 'sac']);
        $pdo = db();
        $data = read_json_body();
        $assigned = $data['assigned_to_user_id'] ?? null;
        $pdo->prepare('UPDATE complaints SET assigned_to_user_id = :assigned WHERE id = :id')
            ->execute(['assigned' => $assigned, 'id' => $params['id']]);
        json_response(['message' => 'Responsável atualizado']);
    }

    public static function interactions(array $params): void
    {
        require_auth();
        $pdo = db();
        $stmt = $pdo->prepare('SELECT ci.*, u.name AS user_name FROM complaint_interactions ci JOIN users u ON ci.user_id = u.id WHERE ci.complaint_id = :id ORDER BY ci.created_at ASC');
        $stmt->execute(['id' => $params['id']]);
        json_response($stmt->fetchAll());
    }

    public static function addInteraction(array $params): void
    {
        $user = require_auth(['admin', 'sac']);
        $pdo = db();
        $data = read_json_body();
        validate($data, ['message' => 'required', 'type' => 'required']);
        $type = in_array($data['type'], ['customer_reply', 'internal_note'], true) ? $data['type'] : 'internal_note';

        $pdo->prepare('INSERT INTO complaint_interactions (complaint_id, user_id, type, message) VALUES (:complaint_id, :user_id, :type, :message)')
            ->execute([
                'complaint_id' => $params['id'],
                'user_id' => $user['sub'],
                'type' => $type,
                'message' => $data['message'],
            ]);
        json_response(['message' => 'Interação registrada'], 201);
    }

    public static function summary(): void
    {
        require_auth();
        $pdo = db();
        $params = $_GET;
        $where = ' WHERE 1=1';
        $bind = [];
        if (!empty($params['date_from'])) {
            $where .= ' AND opened_at >= :date_from';
            $bind['date_from'] = $params['date_from'];
        }
        if (!empty($params['date_to'])) {
            $where .= ' AND opened_at < :date_to_end';
            $bind['date_to_end'] = date('Y-m-d', strtotime($params['date_to'] . ' +1 day'));
        }

        $totStmt = $pdo->prepare("SELECT COUNT(*) FROM complaints {$where}");
        $totStmt->execute($bind);
        $total = (int)$totStmt->fetchColumn();

        $statusStmt = $pdo->prepare("SELECT st.name, COUNT(*) as total FROM complaints c JOIN complaint_statuses st ON c.status_id = st.id {$where} GROUP BY st.name");
        $statusStmt->execute($bind);
        $byStatus = $statusStmt->fetchAll();

        $typeStmt = $pdo->prepare("SELECT ct.name, COUNT(*) as total FROM complaints c JOIN complaint_types ct ON c.complaint_type_id = ct.id {$where} GROUP BY ct.name");
        $typeStmt->execute($bind);
        $byType = $typeStmt->fetchAll();

        $storeStmt = $pdo->prepare("SELECT s.name, COUNT(*) as total FROM complaints c JOIN stores s ON c.store_id = s.id {$where} GROUP BY s.name");
        $storeStmt->execute($bind);
        $byStore = $storeStmt->fetchAll();

        $resolutionStmt = $pdo->prepare("SELECT AVG(TIMESTAMPDIFF(HOUR, opened_at, closed_at)) FROM complaints WHERE closed_at IS NOT NULL");
        $resolutionStmt->execute();
        $avgResolutionHours = (float)$resolutionStmt->fetchColumn();

        json_response([
            'total' => $total,
            'by_status' => $byStatus,
            'by_type' => $byType,
            'by_store' => $byStore,
            'avg_resolution_hours' => $avgResolutionHours,
        ]);
    }
}
