<?php
require __DIR__ . '/_common.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    respond(['error' => 'Only GET is accepted.'], 405);
}

require_auth(['agent', 'uploader', 'pr', 'comms']);

$requestsPath = __DIR__ . '/data/telkom-signature-requests.json';
$requests = load_json_file($requestsPath);
$items = [];
$scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'https';
$host = $_SERVER['HTTP_HOST'] ?? 'onea.africa';

foreach ($requests as $token => $request) {
    $status = $request['status'] ?? 'pending_signature';
    if (!in_array($status, ['submitted', 'revoked'], true) &&
        !empty($request['expiresAt']) &&
        strtotime($request['expiresAt']) < time()) {
        $status = 'expired';
    }
    $items[] = [
        'id' => $request['id'] ?? '',
        'status' => $status,
        'createdAt' => $request['createdAt'] ?? '',
        'viewedAt' => $request['viewedAt'] ?? '',
        'submittedAt' => $request['submittedAt'] ?? '',
        'expiresAt' => $request['expiresAt'] ?? '',
        'revokedAt' => $request['revokedAt'] ?? '',
        'revokedBy' => $request['revokedBy'] ?? '',
        'createdBy' => $request['createdBy'] ?? '',
        'clientName' => $request['clientName'] ?? '',
        'clientEmail' => $request['clientEmail'] ?? '',
        'selectedPackage' => $request['selectedPackage'] ?? '',
        'packagePrice' => $request['packagePrice'] ?? '',
        'signUrl' => $scheme . '://' . $host . '/telkom-sign/' . $token,
        'lastReminderAt' => $request['lastReminderAt'] ?? '',
        'lastReminderBy' => $request['lastReminderBy'] ?? '',
        'reminderCount' => (int) ($request['reminderCount'] ?? 0),
    ];
}

usort($items, static function ($a, $b) {
    return strcmp((string) ($b['createdAt'] ?? ''), (string) ($a['createdAt'] ?? ''));
});

respond([
    'sentCount' => count($items),
    'pendingCount' => count(array_filter($items, static function ($item) {
        return ($item['status'] ?? '') === 'pending_signature' && (empty($item['expiresAt']) || strtotime($item['expiresAt']) >= time());
    })),
    'viewedCount' => count(array_filter($items, static function ($item) {
        return ($item['status'] ?? '') === 'viewed';
    })),
    'submittedCount' => count(array_filter($items, static function ($item) {
        return ($item['status'] ?? '') === 'submitted';
    })),
    'revokedCount' => count(array_filter($items, static function ($item) {
        return ($item['status'] ?? '') === 'revoked';
    })),
    'expiredCount' => count(array_filter($items, static function ($item) {
        return ($item['status'] ?? '') === 'expired';
    })),
    'requests' => $items,
]);

