<?php
require __DIR__ . '/_common.php';

$requestsPath = __DIR__ . '/data/telkom-signature-requests.json';
$requests = load_json_file($requestsPath);

if (is_post_request()) {
    $input = get_json_body();
    $token = sanitize($input['token'] ?? '');
    if (!$token || !isset($requests[$token])) {
        respond(['error' => 'Signature request not found.'], 404);
    }
    $request = $requests[$token];
    if (($request['status'] ?? '') === 'revoked' || !empty($request['revokedAt'])) {
        respond(['error' => 'This signature request has been revoked.'], 410);
    }
    if (!empty($request['expiresAt']) && strtotime($request['expiresAt']) < time()) {
        respond(['error' => 'This signature request has expired.'], 410);
    }
    update_json_file($requestsPath, function ($current) use ($token, $input) {
        if (!isset($current[$token])) {
            return $current;
        }
        $current[$token]['status'] = 'submitted';
        $current[$token]['submittedAt'] = date('Y-m-d H:i:s');
        $current[$token]['submittedReference'] = sanitize($input['submittedReference'] ?? '');
        return $current;
    });
    respond(['message' => 'Signature request marked as submitted.']);
}

$token = sanitize($_GET['token'] ?? '');
if (!$token || !isset($requests[$token])) {
    respond(['error' => 'Signature request not found or expired.'], 404);
}

$request = $requests[$token];
if (($request['status'] ?? '') === 'revoked' || !empty($request['revokedAt'])) {
    respond(['error' => 'This signature request has been revoked.'], 410);
}
if (!empty($request['expiresAt']) && strtotime($request['expiresAt']) < time()) {
    respond(['error' => 'This signature request has expired.'], 410);
}
if (($request['status'] ?? '') === 'submitted') {
    respond(['error' => 'This signature request has already been submitted.'], 410);
}

update_json_file($requestsPath, function ($current) use ($token) {
    if (!isset($current[$token])) {
        return $current;
    }
    $current[$token]['viewedAt'] = $current[$token]['viewedAt'] ?? date('Y-m-d H:i:s');
    $current[$token]['status'] = ($current[$token]['status'] ?? '') === 'pending_signature'
        ? 'viewed'
        : ($current[$token]['status'] ?? 'viewed');
    return $current;
});

respond([
    'request' => [
        'id' => $request['id'] ?? '',
        'clientName' => $request['clientName'] ?? '',
        'clientEmail' => $request['clientEmail'] ?? '',
        'selectedPackage' => $request['selectedPackage'] ?? '',
        'packagePrice' => $request['packagePrice'] ?? '',
        'expiresAt' => $request['expiresAt'] ?? '',
        'payload' => $request['payload'] ?? [],
    ],
]);
