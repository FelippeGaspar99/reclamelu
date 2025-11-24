<?php

declare(strict_types=1);

namespace App\Services;

class MetricsService
{
    public static function globalDaysWithoutComplaints(): array
    {
        $pdo = db();
        $row = $pdo->query('SELECT MAX(opened_at) AS last_date FROM complaints')->fetch();
        $last = $row['last_date'] ?? null;
        if ($last) {
            $stmt = $pdo->prepare('SELECT TIMESTAMPDIFF(DAY, :last, NOW()) AS days');
            $stmt->execute(['last' => $last]);
            $days = (int)$stmt->fetchColumn();
        } else {
            $days = null;
        }

        return [
            'days_without_complaints' => $days,
            'last_complaint_date' => $last ? date('c', strtotime($last)) : null,
        ];
    }

    private static function calculateRecord(array $dates): array
    {
        // $dates: array of datetime strings ASC
        if (empty($dates)) {
            return [
                'record_days_without_complaints' => null,
                'record_start_date' => null,
                'record_end_date' => null,
                'never_had_complaints' => true,
            ];
        }

        $count = count($dates);
        if ($count === 1) {
            $start = new \DateTime($dates[0]);
            $end = new \DateTime('now');
            $diffDays = $start->diff($end)->days;
            return [
                'record_days_without_complaints' => $diffDays,
                'record_start_date' => $start->format(\DateTime::ATOM),
                'record_end_date' => $end->format(\DateTime::ATOM),
                'never_had_complaints' => false,
            ];
        }

        $recordDays = -1;
        $recordStart = null;
        $recordEnd = null;

        for ($i = 1; $i < $count; $i++) {
            $prev = new \DateTime($dates[$i - 1]);
            $curr = new \DateTime($dates[$i]);
            $gap = $prev->diff($curr)->days;
            if ($gap > $recordDays) {
                $recordDays = $gap;
                $recordStart = $prev;
                $recordEnd = $curr;
            }
        }

        // Consider período do último até agora como possível recorde
        $lastDate = new \DateTime(end($dates));
        $now = new \DateTime('now');
        $gapToNow = $lastDate->diff($now)->days;
        if ($gapToNow > $recordDays) {
            $recordDays = $gapToNow;
            $recordStart = $lastDate;
            $recordEnd = $now;
        }

        return [
            'record_days_without_complaints' => $recordDays,
            'record_start_date' => $recordStart?->format(\DateTime::ATOM),
            'record_end_date' => $recordEnd?->format(\DateTime::ATOM),
            'never_had_complaints' => false,
        ];
    }

    public static function globalRecord(): array
    {
        $pdo = db();
        $dates = $pdo->query('SELECT opened_at FROM complaints ORDER BY opened_at ASC')->fetchAll(\PDO::FETCH_COLUMN);
        return self::calculateRecord($dates);
    }

    public static function recordByStore(): array
    {
        $pdo = db();
        $stores = $pdo->query('SELECT id, name, active FROM stores')->fetchAll();
        $complaints = $pdo->query('SELECT store_id, opened_at FROM complaints ORDER BY store_id ASC, opened_at ASC')->fetchAll();

        $grouped = [];
        foreach ($complaints as $c) {
            $grouped[$c['store_id']][] = $c['opened_at'];
        }

        $data = [];
        foreach ($stores as $s) {
            $dates = $grouped[$s['id']] ?? [];
            $record = self::calculateRecord($dates);
            $data[] = array_merge($record, [
                'store_id' => (int)$s['id'],
                'store_name' => $s['name'],
                'active' => (int)$s['active'] === 1,
            ]);
        }
        return $data;
    }

    public static function recordByType(): array
    {
        $pdo = db();
        $types = $pdo->query('SELECT id, name, active FROM complaint_types')->fetchAll();
        $complaints = $pdo->query('SELECT complaint_type_id, opened_at FROM complaints ORDER BY complaint_type_id ASC, opened_at ASC')->fetchAll();

        $grouped = [];
        foreach ($complaints as $c) {
            $grouped[$c['complaint_type_id']][] = $c['opened_at'];
        }

        $data = [];
        foreach ($types as $t) {
            $dates = $grouped[$t['id']] ?? [];
            $record = self::calculateRecord($dates);
            $data[] = array_merge($record, [
                'complaint_type_id' => (int)$t['id'],
                'complaint_type_name' => $t['name'],
                'active' => (int)$t['active'] === 1,
            ]);
        }
        return $data;
    }

    public static function daysWithoutComplaintsByStore(): array
    {
        $pdo = db();
        $sql = 'SELECT s.id, s.name, s.active, MAX(c.opened_at) AS last_date, COUNT(c.id) AS total
                FROM stores s
                LEFT JOIN complaints c ON c.store_id = s.id
                GROUP BY s.id, s.name, s.active';
        $rows = $pdo->query($sql)->fetchAll();
        $data = [];
        foreach ($rows as $row) {
            $last = $row['last_date'] ?? null;
            $never = ((int)$row['total']) === 0;
            $days = null;
            if ($last) {
                $stmt = $pdo->prepare('SELECT TIMESTAMPDIFF(DAY, :last, NOW()) AS days');
                $stmt->execute(['last' => $last]);
                $days = (int)$stmt->fetchColumn();
            }
            $data[] = [
                'store_id' => (int)$row['id'],
                'store_name' => $row['name'],
                'active' => (int)$row['active'] === 1,
                'days_without_complaints' => $days,
                'last_complaint_date' => $last ? date('c', strtotime($last)) : null,
                'never_had_complaints' => $never,
            ];
        }
        return $data;
    }

    public static function daysWithoutComplaintsByType(): array
    {
        $pdo = db();
        $sql = 'SELECT ct.id, ct.name, ct.active, MAX(c.opened_at) AS last_date, COUNT(c.id) AS total
                FROM complaint_types ct
                LEFT JOIN complaints c ON c.complaint_type_id = ct.id
                GROUP BY ct.id, ct.name, ct.active';
        $rows = $pdo->query($sql)->fetchAll();
        $data = [];
        foreach ($rows as $row) {
            $last = $row['last_date'] ?? null;
            $never = ((int)$row['total']) === 0;
            $days = null;
            if ($last) {
                $stmt = $pdo->prepare('SELECT TIMESTAMPDIFF(DAY, :last, NOW()) AS days');
                $stmt->execute(['last' => $last]);
                $days = (int)$stmt->fetchColumn();
            }
            $data[] = [
                'complaint_type_id' => (int)$row['id'],
                'complaint_type_name' => $row['name'],
                'active' => (int)$row['active'] === 1,
                'days_without_complaints' => $days,
                'last_complaint_date' => $last ? date('c', strtotime($last)) : null,
                'never_had_complaints' => $never,
            ];
        }
        return $data;
    }
}
