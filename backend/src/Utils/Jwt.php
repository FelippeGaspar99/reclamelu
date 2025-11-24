<?php

declare(strict_types=1);

namespace App\Utils;

class Jwt
{
    public static function encode(array $payload): string
    {
        $header = ['alg' => 'HS256', 'typ' => 'JWT'];
        $secret = $_ENV['JWT_SECRET'] ?? 'changeme';
        $payload['exp'] = $payload['exp'] ?? (time() + (int)($_ENV['JWT_EXPIRES_MIN'] ?? 60) * 60);

        $segments = [
            self::b64(json_encode($header)),
            self::b64(json_encode($payload)),
        ];

        $signature = hash_hmac('sha256', implode('.', $segments), $secret, true);
        $segments[] = self::b64($signature);

        return implode('.', $segments);
    }

    public static function verify(string $jwt): ?array
    {
        $secret = $_ENV['JWT_SECRET'] ?? 'changeme';
        $parts = explode('.', $jwt);
        if (count($parts) !== 3) {
            return null;
        }
        [$headb64, $bodyb64, $cryptob64] = $parts;
        $sig = self::b64d($cryptob64);
        $validSig = hash_hmac('sha256', "$headb64.$bodyb64", $secret, true);
        if (!hash_equals($validSig, $sig)) {
            return null;
        }
        $payload = json_decode(self::b64d($bodyb64), true);
        if (!is_array($payload)) {
            return null;
        }
        if (isset($payload['exp']) && time() > (int)$payload['exp']) {
            return null;
        }
        return $payload;
    }

    private static function b64(string $data): string
    {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }

    private static function b64d(string $data): string
    {
        $remainder = strlen($data) % 4;
        if ($remainder) {
            $data .= str_repeat('=', 4 - $remainder);
        }
        return base64_decode(strtr($data, '-_', '+/'));
    }
}
