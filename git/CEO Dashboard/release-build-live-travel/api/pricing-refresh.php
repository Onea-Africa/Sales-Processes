<?php
require_once __DIR__ . '/_common.php';

if (!in_array(strtoupper($_SERVER['REQUEST_METHOD'] ?? ''), ['GET', 'POST'], true)) {
    respond(['error' => 'Method not allowed.'], 405);
}

$provided = (string) ($_GET['secret'] ?? get_request_header('X-Pricing-Cron-Secret'));
$expected = (string) get_env('PRICING_CRON_SECRET');
if ($expected === '' || $provided === '' || !hash_equals($expected, $provided)) {
    respond(['error' => 'Unauthorized pricing refresh.'], 401);
}

$appUrl = rtrim((string) get_env('APP_URL', 'https://onea.africa'), '/');
$appleQueries = [
    'MacBook Air',
    'MacBook Pro',
    'Mac mini',
    'Mac Studio',
    'iMac',
    'iPad',
    'iPhone',
    'Apple Pencil',
    'Magic Keyboard',
    'Magic Mouse',
    'AirPods',
];
$results = [];

foreach ($appleQueries as $query) {
    $url = $appUrl . '/api/apple-prices.php?query=' . rawurlencode($query);
    $context = stream_context_create([
        'http' => [
            'method' => 'GET',
            'header' => "Accept: application/json\r\n",
            'timeout' => 45,
            'ignore_errors' => true,
        ],
    ]);
    $raw = @file_get_contents($url, false, $context);
    $payload = $raw !== false ? json_decode($raw, true) : null;
    $results['asbis'][$query] = [
        'ok' => is_array($payload) && !empty($payload['products']),
        'count' => is_array($payload) ? (int) ($payload['count'] ?? 0) : 0,
        'error' => is_array($payload) ? ($payload['error'] ?? '') : 'No response',
    ];
}

$partnerFeeds = [
    'microsoft' => ['url' => get_env('MICROSOFT_PRICE_FEED_URL'), 'token' => get_env('MICROSOFT_PRICE_FEED_TOKEN')],
    'fortinet' => ['url' => get_env('FORTINET_PRICE_FEED_URL'), 'token' => get_env('FORTINET_PRICE_FEED_TOKEN')],
    'hosting' => ['url' => get_env('HOSTING_PRICE_FEED_URL'), 'token' => get_env('HOSTING_PRICE_FEED_TOKEN')],
];

foreach ($partnerFeeds as $name => $feed) {
    if (!$feed['url']) {
        $results['partnerFeeds'][$name] = ['ok' => false, 'status' => 'not_configured'];
        continue;
    }
    $headers = "Accept: application/json\r\n";
    if ($feed['token']) {
        $headers .= 'Authorization: Bearer ' . $feed['token'] . "\r\n";
    }
    $context = stream_context_create([
        'http' => [
            'method' => 'GET',
            'header' => $headers,
            'timeout' => 45,
            'ignore_errors' => true,
        ],
    ]);
    $raw = @file_get_contents($feed['url'], false, $context);
    $statusLine = $http_response_header[0] ?? '';
    $ok = $raw !== false && (!$statusLine || preg_match('/\s2\d\d\s/', $statusLine));
    $results['partnerFeeds'][$name] = [
        'ok' => (bool) $ok,
        'status' => $ok ? 'reachable' : 'failed',
        'http' => $statusLine,
    ];
}

$status = [
    'refreshedAt' => date('c'),
    'results' => $results,
];
save_json_file(__DIR__ . '/data/pricing-refresh-status.json', $status);
respond($status);
