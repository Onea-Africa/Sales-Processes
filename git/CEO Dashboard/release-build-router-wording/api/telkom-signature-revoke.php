<?php
require __DIR__ . '/_common.php';

if (!is_post_request()) {
    respond(['error' => 'Only POST is accepted.'], 405);
}

$session = require_auth(['agent', 'uploader', 'pr', 'comms']);
$input = get_json_body();
$requestId = sanitize($input['id'] ?? '');

if ($requestId === '') {
    respond(['error' => 'Signature request ID is required.'], 400);
}

$requestsPath = __DIR__ . '/data/telkom-signature-requests.json';
$revoked = false;
$revokedAt = date('Y-m-d H:i:s');

update_json_file($requestsPath, function ($requests) use ($requestId, $session, $revokedAt, &$revoked) {
    foreach ($requests as $token => $request) {
        if (($request['id'] ?? '') !== $requestId) {
            continue;
        }
        if (($request['status'] ?? '') === 'submitted') {
            respond(['error' => 'A submitted signature request cannot be revoked.'], 409);
        }
        $requests[$token]['status'] = 'revoked';
        $requests[$token]['revokedAt'] = $revokedAt;
        $requests[$token]['revokedBy'] = $session['displayName'] ?? $session['username'] ?? 'Launch Platform';
        $revoked = true;
        break;
    }
    return $requests;
});

if (!$revoked) {
    respond(['error' => 'Signature request not found.'], 404);
}

respond([
    'message' => 'Signature request revoked.',
    'id' => $requestId,
    'revokedAt' => $revokedAt,
]);
