<?php
require __DIR__ . '/_common.php';

if (!is_post_request()) {
    respond(['error' => 'Only POST is accepted.'], 405);
}

$session = require_auth(['agent', 'uploader', 'pr', 'comms']);
$input = get_json_body();

$email = sanitize($input['email'] ?? '');
$name = sanitize($input['fullName'] ?? $input['firstNames'] ?? '');
$phone = sanitize($input['mobile'] ?? $input['mobileNumber'] ?? $input['phone'] ?? '');
$selectedPackage = sanitize($input['selectedPackage'] ?? '');
$packagePrice = sanitize($input['packagePrice'] ?? '');

if (!$email || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    respond(['error' => 'A valid client email address is required.'], 400);
}
if (!$name) {
    respond(['error' => 'Client full name is required.'], 400);
}
if (!$selectedPackage) {
    respond(['error' => 'Selected package is required.'], 400);
}

$requestsPath = __DIR__ . '/data/telkom-signature-requests.json';
$token = bin2hex(random_bytes(24));
$id = 'SIGN-' . strtoupper(substr(hash('sha256', $token . microtime(true)), 0, 8));
$now = date('Y-m-d H:i:s');
$ttlHours = max(1, min(168, (int) get_env('SIGNATURE_REQUEST_TTL_HOURS', '72')));
$expiresAt = date('Y-m-d H:i:s', time() + $ttlHours * 3600);

$payload = $input;
unset($payload['sig1'], $payload['sig2'], $payload['sig3'], $payload['sig1Data'], $payload['sig2Data'], $payload['sig3Data']);

$requestRecord = [
    'id' => $id,
    'status' => 'pending_signature',
    'createdAt' => $now,
    'expiresAt' => $expiresAt,
    'revokedAt' => '',
    'revokedBy' => '',
    'createdBy' => $session['displayName'] ?? $session['username'] ?? 'Launch Platform',
    'clientName' => $name,
    'clientEmail' => $email,
    'selectedPackage' => $selectedPackage,
    'packagePrice' => $packagePrice,
    'payload' => $payload,
];
update_json_file($requestsPath, function ($requests) use ($token, $requestRecord) {
    $requests = is_array($requests) ? $requests : [];
    $requests[$token] = $requestRecord;
    return $requests;
});

$scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'https';
$host = $_SERVER['HTTP_HOST'] ?? 'onea.africa';
$signUrl = $scheme . '://' . $host . '/telkom-sign/' . $token;

function normalize_za_phone($phone) {
    $digits = preg_replace('/\D+/', '', (string) $phone);
    if ($digits === '') {
        return '';
    }
    if (strpos($digits, '27') === 0) {
        return '+' . $digits;
    }
    if (strpos($digits, '0') === 0) {
        return '+27' . substr($digits, 1);
    }
    return '+' . $digits;
}

$whatsappPhone = normalize_za_phone($phone);
$whatsappText = "Hi {$name}, Onea Africa has prepared your Telkom application. Please review and sign here: {$signUrl}";
$whatsappUrl = $whatsappPhone ? 'https://wa.me/' . preg_replace('/\D+/', '', $whatsappPhone) . '?text=' . rawurlencode($whatsappText) : '';
$whatsappSent = false;

$whatsappWebhook = get_env('WHATSAPP_WEBHOOK_URL', '');
if ($whatsappWebhook && $whatsappPhone) {
    $waPayload = json_encode([
        'phone' => $whatsappPhone,
        'message' => $whatsappText,
        'secret' => get_env('WHATSAPP_WEBHOOK_SECRET', ''),
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    $opts = [
        'http' => [
            'method' => 'POST',
            'header' => "Content-Type: application/json\r\n",
            'content' => $waPayload,
            'timeout' => 8,
        ],
    ];
    $whatsappSent = @file_get_contents($whatsappWebhook, false, stream_context_create($opts)) !== false;
}

$html = "<div style=\"font-family:Arial,sans-serif;max-width:700px;margin:0 auto;padding:24px;background:#f7f9f2;border-radius:8px;\">\n"
    . "  <h2 style=\"color:#102000;margin-top:0;\">Telkom Application Signature Required</h2>\n"
    . "  <p>Hi {$name},</p>\n"
    . "  <p>Onea Africa has prepared your Telkom application. Please review the package details and complete the required signatures using the secure link below.</p>\n"
    . "  <div style=\"background:white;border-left:4px solid #8CC444;padding:14px 16px;margin:18px 0;border-radius:6px;\">\n"
    . "    <strong>Package:</strong> {$selectedPackage}<br>\n"
    . "    <strong>Monthly:</strong> R{$packagePrice}<br>\n"
    . "    <strong>Reference:</strong> {$id}\n"
    . "  </div>\n"
    . "  <p><a href=\"{$signUrl}\" style=\"display:inline-block;background:#8CC444;color:#102000;text-decoration:none;font-weight:bold;padding:12px 18px;border-radius:999px;\">Review and sign application</a></p>\n"
    . ($whatsappUrl ? "  <p><a href=\"{$whatsappUrl}\" style=\"display:inline-block;background:#25D366;color:#102000;text-decoration:none;font-weight:bold;padding:12px 18px;border-radius:999px;\">Send via WhatsApp</a></p>\n" : "")
    . "  <p style=\"color:#666;font-size:12px;margin-top:24px;\">If the button does not work, copy this link into your browser:<br>{$signUrl}</p>\n"
    . "</div>";

$sent = send_html_email(
    $email,
    'Telkom application signature required ' . $id,
    $html,
    'Onea Africa <website@onea.co.za>',
    'sales@onea.co.za',
    [],
    []
);

if (!$sent) {
    respond(['error' => 'Signature request was saved, but the client email could not be sent.', 'id' => $id], 500);
}

respond([
    'message' => 'Signature request sent to ' . $email . '.',
    'id' => $id,
    'signUrl' => $signUrl,
    'expiresAt' => $expiresAt,
    'whatsappUrl' => $whatsappUrl,
    'whatsappSent' => $whatsappSent,
], 201);

