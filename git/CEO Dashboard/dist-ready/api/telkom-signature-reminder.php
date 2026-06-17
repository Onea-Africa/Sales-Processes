<?php
require __DIR__ . '/_common.php';

if (!is_post_request()) {
    respond(['error' => 'Only POST is accepted.'], 405);
}

$session = require_auth(['agent', 'uploader', 'pr', 'comms']);
$input = get_json_body();
$requestId = sanitize($input['id'] ?? '');

if (!$requestId) {
    respond(['error' => 'Signature request ID is required.'], 400);
}

$requestsPath = __DIR__ . '/data/telkom-signature-requests.json';
$requests = load_json_file($requestsPath);
$matchedToken = '';
$matchedRequest = null;

foreach ($requests as $token => $request) {
    if (($request['id'] ?? '') === $requestId) {
        $matchedToken = (string) $token;
        $matchedRequest = $request;
        break;
    }
}

if (!$matchedRequest) {
    respond(['error' => 'Signature request not found.'], 404);
}

if (($matchedRequest['status'] ?? '') === 'submitted') {
    respond(['error' => 'This client has already signed the application.'], 409);
}
if (($matchedRequest['status'] ?? '') === 'revoked' || !empty($matchedRequest['revokedAt'])) {
    respond(['error' => 'This signature request has been revoked.'], 409);
}
if (!empty($matchedRequest['expiresAt']) && strtotime($matchedRequest['expiresAt']) < time()) {
    respond(['error' => 'This signature request has expired. Create a new request.'], 410);
}

$name = sanitize($matchedRequest['clientName'] ?? 'Client');
$email = sanitize($matchedRequest['clientEmail'] ?? '');
$selectedPackage = sanitize($matchedRequest['selectedPackage'] ?? '');
$packagePrice = sanitize($matchedRequest['packagePrice'] ?? '');
$phone = sanitize($matchedRequest['payload']['mobile'] ?? $matchedRequest['payload']['mobileNumber'] ?? $matchedRequest['payload']['phone'] ?? '');

if (!$email || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    respond(['error' => 'Client email is missing or invalid.'], 400);
}

$scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'https';
$host = $_SERVER['HTTP_HOST'] ?? 'onea.africa';
$signUrl = $scheme . '://' . $host . '/telkom-sign/' . $matchedToken;

function normalize_za_phone_for_reminder($phone) {
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

$whatsappPhone = normalize_za_phone_for_reminder($phone);
$whatsappText = "Hi {$name}, friendly reminder from Onea Africa: please review and sign your Telkom application here: {$signUrl}";
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
    . "  <h2 style=\"color:#102000;margin-top:0;\">Reminder: Telkom Application Signature Required</h2>\n"
    . "  <p>Hi {$name},</p>\n"
    . "  <p>This is a friendly reminder to review and sign your Onea Africa Telkom application.</p>\n"
    . "  <div style=\"background:white;border-left:4px solid #8CC444;padding:14px 16px;margin:18px 0;border-radius:6px;\">\n"
    . "    <strong>Package:</strong> {$selectedPackage}<br>\n"
    . "    <strong>Monthly:</strong> R{$packagePrice}<br>\n"
    . "    <strong>Reference:</strong> {$requestId}\n"
    . "  </div>\n"
    . "  <p><a href=\"{$signUrl}\" style=\"display:inline-block;background:#8CC444;color:#102000;text-decoration:none;font-weight:bold;padding:12px 18px;border-radius:999px;\">Review and sign application</a></p>\n"
    . "  <p style=\"color:#666;font-size:12px;margin-top:24px;\">If the button does not work, copy this link into your browser:<br>{$signUrl}</p>\n"
    . "</div>";

$sent = send_html_email(
    $email,
    'Reminder Telkom application signature required ' . $requestId,
    $html,
    'Onea Africa <website@onea.co.za>',
    'sales@onea.co.za',
    [],
    []
);

if (!$sent) {
    respond(['error' => 'Reminder email could not be sent.'], 500);
}

$now = date('Y-m-d H:i:s');
update_json_file($requestsPath, function ($current) use ($matchedToken, $now, $session) {
    if (!isset($current[$matchedToken])) {
        return $current;
    }
    $current[$matchedToken]['lastReminderAt'] = $now;
    $current[$matchedToken]['reminderCount'] = (int) ($current[$matchedToken]['reminderCount'] ?? 0) + 1;
    $current[$matchedToken]['lastReminderBy'] = $session['displayName'] ?? $session['username'] ?? 'Launch Platform';
    return $current;
});

respond([
    'message' => 'Reminder sent to ' . $email . '.',
    'id' => $requestId,
    'lastReminderAt' => $now,
    'whatsappUrl' => $whatsappUrl,
    'whatsappSent' => $whatsappSent,
]);

