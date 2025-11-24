<?php

declare(strict_types=1);

namespace App\Services;

class MetricsService
{
    public static function daysGlobal(): array
    {
        $pdo = db();
        $row = $pdo->query('SELECT MAX(opened_at) AS last_date FROM complaints')->fetch();
        $last = $row['last_date'] ?? null;
        $days = null;
        if ($last) {
            $stmt = $pdo->prepare('SELECT TIMESTAMPDIFF(DAY, :dt, NOW()) FROM dual');
            $stmt->execute(['dt' => $last]);
            $days = (int)$stmt->fetchColumn();
        }
        return [
            'days_without_complaints' => $days,
            'last_complaint_date' => $last ? date('c', strtotime($last)) : null,
        ];
    }

    public static function daysByStore(): array
    {
        $pdo = db();
        $sql = 'SELECT s.id, s.name, s.active, MAX(c.opened_at) AS last_date, COUNT(c.id) AS total
                FROM stores s
                LEFT JOIN complaints c ON c.store_id = s.id
                GROUP BY s.id, s.name, s.active';
        $rows = $pdo->query($sql)->fetchAll();
        $out = [];
        foreach ($rows as $r) {
            $last = $r['last_date'] ?? null;
            $days = null;
            if ($last) {
                $stmt = $pdo->prepare('SELECT TIMESTAMPDIFF(DAY, :dt, NOW()) FROM dual');
                $stmt->execute(['dt' => $last]);
                $days = (int)$stmt->fetchColumn();
            }
            $out[] = [
                'store_id' => (int)$r['id'],
                'store_name' => $r['name'],
                'days_without_complaints' => $days,
                'last_complaint_date' => $last ? date('c', strtotime($last)) : null,
                'never_had_complaints' => ((int)$r['total']) === 0,
            ];
        }
        return $out;
    }

    public static function daysByType(): array
    {
        $pdo = db();
        $sql = 'SELECT ct.id, ct.name, ct.active, MAX(c.opened_at) AS last_date, COUNT(c.id) AS total
                FROM complaint_types ct
                LEFT JOIN complaints c ON c.complaint_type_id = ct.id
                GROUP BY ct.id, ct.name, ct.active';
        $rows = $pdo->query($sql)->fetchAll();
        $out = [];
        foreach ($rows as $r) {
            $last = $r['last_date'] ?? null;
            $days = null;
            if ($last) {
                $stmt = $pdo->prepare('SELECT TIMESTAMPDIFF(DAY, :dt, NOW()) FROM dual');
                $stmt->execute(['dt' => $last]);
                $days = (int)$stmt->fetchColumn();
            }
            $out[] = [
                'complaint_type_id' => (int)$r['id'],
                'complaint_type_name' => $r['name'],
                'days_without_complaints' => $days,
                'last_complaint_date' => $last ? date('c', strtotime($last)) : null,
                'never_had_complaints' => ((int)$r['total']) === 0,
            ];
        }
        return $out;
    }

    private static function recordCalc(array $dates): array
    {
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
            $gap = $start->diff($end)->days;
            return [
                'record_days_without_complaints' => $gap,
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
        // do último até agora
        $last = new \DateTime(end($dates));
        $now = new \DateTime('now');
        $gapNow = $last->diff($now)->days;
        if ($gapNow > $recordDays) {
            $recordDays = $gapNow;
            $recordStart = $last;
            $recordEnd = $now;
        }
        return [
            'record_days_without_complaints' => $recordDays,
            'record_start_date' => $recordStart?->format(\DateTime::ATOM),
            'record_end_date' => $recordEnd?->format(\DateTime::ATOM),
            'never_had_complaints' => false,
        ];
    }

    public static function recordGlobal(): array
    {
        $pdo = db();
        $dates = $pdo->query('SELECT opened_at FROM complaints ORDER BY opened_at ASC')->fetchAll(\PDO::FETCH_COLUMN);
        return self::recordCalc($dates);
    }

    public static function recordByStore(): array
    {
        $pdo = db();
        $stores = $pdo->query('SELECT id, name FROM stores')->fetchAll();
        $complaints = $pdo->query('SELECT store_id, opened_at FROM complaints ORDER BY store_id ASC, opened_at ASC')->fetchAll();
        $grouped = [];
        foreach ($complaints as $c) {
            $grouped[$c['store_id']][] = $c['opened_at'];
        }
        $out = [];
        foreach ($stores as $s) {
            $record = self::recordCalc($grouped[$s['id']] ?? []);
            $record['store_id'] = (int)$s['id'];
            $record['store_name'] = $s['name'];
            $out[] = $record;
        }
        return $out;
    }

    public static function recordByType(): array
    {
        $pdo = db();
        $types = $pdo->query('SELECT id, name FROM complaint_types')->fetchAll();
        $complaints = $pdo->query('SELECT complaint_type_id, opened_at FROM complaints ORDER BY complaint_type_id ASC, opened_at ASC')->fetchAll();
        $grouped = [];
        foreach ($complaints as $c) {
            $grouped[$c['complaint_type_id']][] = $c['opened_at'];
        }
        $out = [];
        foreach ($types as $t) {
            $record = self::recordCalc($grouped[$t['id']] ?? []);
            $record['complaint_type_id'] = (int)$t['id'];
            $record['complaint_type_name'] = $t['name'];
            $out[] = $record;
        }
        return $out;
    }
}
