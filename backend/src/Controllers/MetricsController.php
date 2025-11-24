<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Services\MetricsService;

class MetricsController
{
    public static function daysGlobal(): void
    {
        require_auth();
        json_response(MetricsService::daysGlobal());
    }

    public static function daysByStore(): void
    {
        require_auth();
        json_response(['data' => MetricsService::daysByStore()]);
    }

    public static function daysByType(): void
    {
        require_auth();
        json_response(['data' => MetricsService::daysByType()]);
    }

    public static function recordGlobal(): void
    {
        require_auth();
        json_response(MetricsService::recordGlobal());
    }

    public static function recordByStore(): void
    {
        require_auth();
        json_response(['data' => MetricsService::recordByStore()]);
    }

    public static function recordByType(): void
    {
        require_auth();
        json_response(['data' => MetricsService::recordByType()]);
    }
}
