<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Services\MetricsService;

class MetricsController
{
    public static function global(): void
    {
        require_auth();
        $data = MetricsService::globalDaysWithoutComplaints();
        json_response($data);
    }

    public static function byStore(): void
    {
        require_auth();
        $data = MetricsService::daysWithoutComplaintsByStore();
        json_response(['data' => $data]);
    }

    public static function byType(): void
    {
        require_auth();
        $data = MetricsService::daysWithoutComplaintsByType();
        json_response(['data' => $data]);
    }

    public static function recordGlobal(): void
    {
        require_auth();
        $data = MetricsService::globalRecord();
        json_response($data);
    }

    public static function recordByStore(): void
    {
        require_auth();
        $data = MetricsService::recordByStore();
        json_response(['data' => $data]);
    }

    public static function recordByType(): void
    {
        require_auth();
        $data = MetricsService::recordByType();
        json_response(['data' => $data]);
    }
}
