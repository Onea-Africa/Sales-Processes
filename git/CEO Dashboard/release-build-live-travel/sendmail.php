<?php
declare(strict_types=1);

ini_set('display_errors', 0); // Keep it safe for user view
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/PHP_errors.log');
error_reporting(E_ALL);

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: https://onea.africa');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(200);
    exit;
}

function respond(array $payload, int $status = 200): void
{
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function log_exception(Throwable $ex): void
{
    $errorFile = __DIR__ . '/error_log.jsonl';
    $entry = [
        'timestamp' => date('c'),
        'message' => $ex->getMessage(),
        'file' => $ex->getFile(),
        'line' => $ex->getLine(),
        'trace' => $ex->getTraceAsString(),
    ];
    file_put_contents($errorFile, json_encode($entry, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) . "\n", FILE_APPEND);
}

set_exception_handler(static function (Throwable $ex): void {
    log_exception($ex);
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => $ex->getMessage()], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
});

function is_post_request(): bool
{
    return ($_SERVER['REQUEST_METHOD'] ?? '') === 'POST';
}

function onea_private_config(): array
{
    static $config = null;
    if ($config !== null) {
        return $config;
    }
    $config = [];
    $path = dirname(__DIR__) . '/onea-config.php';
    if (is_file($path) && is_readable($path)) {
        $loaded = require $path;
        if (is_array($loaded)) {
            $config = $loaded;
        }
    }
    return $config;
}

function onea_config_value(string $key, string $default = ''): string
{
    $environment = getenv($key);
    if ($environment !== false && $environment !== '') {
        return (string) $environment;
    }
    $config = onea_private_config();
    return array_key_exists($key, $config) ? (string) $config[$key] : $default;
}

function onea_enforce_sendmail_rate_limit(int $limit = 4, int $windowSeconds = 1800): void
{
    $directory = __DIR__ . '/api/data/.rate-limits';
    if (!is_dir($directory)) {
        mkdir($directory, 0750, true);
    }
    $ip = (string) ($_SERVER['REMOTE_ADDR'] ?? 'unknown');
    $path = $directory . '/' . hash('sha256', 'legacy-sendmail|' . $ip) . '.json';
    $lock = fopen($path . '.lock', 'c+');
    if (!$lock || !flock($lock, LOCK_EX)) {
        if ($lock) fclose($lock);
        respond(['error' => 'Unable to process the request securely.'], 503);
    }
    $now = time();
    $current = file_exists($path) ? json_decode((string) file_get_contents($path), true) : [];
    $hits = array_values(array_filter($current['hits'] ?? [], static fn($hit) => (int) $hit > $now - $windowSeconds));
    $hits[] = $now;
    file_put_contents($path, json_encode(['hits' => $hits]), LOCK_EX);
    flock($lock, LOCK_UN);
    fclose($lock);
    if (count($hits) > $limit) {
        header('Retry-After: ' . $windowSeconds);
        respond(['error' => 'Too many requests. Please wait before trying again.'], 429);
    }
}

function read_payload(): array
{
    $raw = file_get_contents('php://input');
    if ($raw !== false && trim($raw) !== '') {
        $json = json_decode($raw, true);
        if (json_last_error() === JSON_ERROR_NONE && is_array($json)) {
            return $json;
        }
    }
    return !empty($_POST) ? $_POST : [];
}

function decode_data_url(string $data): ?string
{
    $data = trim($data);
    if ($data === '') {
        return null;
    }
    if (preg_match('/^data:(image\/(png|jpeg));base64,(.+)$/i', $data, $matches)) {
        return base64_decode($matches[3], true);
    }
    $decoded = base64_decode($data, true);
    return $decoded === false ? null : $decoded;
}

function safe_text($value): string
{
    $value = trim((string) $value);
    return $value === '' ? '.' : $value;
}

function safe_yes_no($value): string
{
    $value = strtoupper(trim((string) $value));
    if ($value === 'Y' || $value === 'YES') {
        return 'Y';
    }
    if ($value === 'N' || $value === 'NO') {
        return 'N';
    }
    return 'N';
}

function log_failed_lead(array $payload, string $note): void
{
    $dir = __DIR__ . '/backups';
    if (!is_dir($dir)) {
        mkdir($dir, 0755, true);
    }
    $entry = [
        'timestamp' => date('c'),
        'note' => $note,
        'payload' => $payload,
    ];
    file_put_contents($dir . '/failed_leads.log', json_encode($entry, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT) . "\n", FILE_APPEND);
}

function curl_post_json(string $url, array $payload, array $headers = [], int $timeout = 5): array
{
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload, JSON_UNESCAPED_UNICODE));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, $timeout);
    curl_setopt($ch, CURLOPT_TIMEOUT, $timeout);
    curl_setopt($ch, CURLOPT_HTTPHEADER, array_merge(['Content-Type: application/json'], $headers));
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 2);

    $response = curl_exec($ch);
    $error = curl_error($ch);
    $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    return [
        'success' => $error === '' && $status >= 200 && $status < 300,
        'status' => $status,
        'error' => $error,
        'response' => $response,
    ];
}

function create_text_pdf(string $path, string $title, array $lines): bool
{
    $escape = function (string $text): string {
        return str_replace(['\\', '(', ')'], ['\\\\', '\\(', '\\)'], $text);
    };

    $stream = "BT /F1 18 Tf 40 800 Td ({$escape($title)}) Tj ET\n";
    $y = 770;
    foreach ($lines as $line) {
        $escapedLine = $escape($line);
        $stream .= "BT /F1 12 Tf 40 {$y} Td ({$escapedLine}) Tj ET\n";
        $y -= 18;
        if ($y < 40) {
            break;
        }
    }

    $objects = [];
    $objects[] = "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n";
    $objects[] = "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n";
    $objects[] = "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font <</F1 4 0 R>> >> /Contents 5 0 R >>\nendobj\n";
    $objects[] = "4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n";
    $objects[] = "5 0 obj\n<< /Length " . strlen($stream) . " >>\nstream\n{$stream}endstream\nendobj\n";

    $pdf = "%PDF-1.4\n";
    $xref = "xref\n0 " . (count($objects) + 1) . "\n0000000000 65535 f \n";
    $offset = strlen($pdf);
    $positions = [];
    foreach ($objects as $object) {
        $positions[] = $offset;
        $pdf .= $object;
        $offset += strlen($object);
    }
    foreach ($positions as $pos) {
        $xref .= str_pad((string) $pos, 10, '0', STR_PAD_LEFT) . " 00000 n \n";
    }
    $pdf .= $xref;
    $pdf .= "trailer<< /Size " . (count($objects) + 1) . " /Root 1 0 R >>\nstartxref " . $offset . "\n%%EOF";

    file_put_contents($path, $pdf);
    return file_exists($path);
}

function build_email_html(array $fields, string $submissionId, string $timestamp): string
{
    $html = "<div style=\"font-family:Arial,sans-serif;max-width:700px;margin:0 auto;padding:24px;background:#f7f9f2;border-radius:16px;\">";
    $html .= "<h1 style=\"color:#102000;\">New Submission Received</h1>";
    $html .= "<p style=\"color:#4b4b4b;\">Reference <strong>{$submissionId}</strong> received on {$timestamp}.</p>";
    $html .= "<table style=\"width:100%;border-collapse:collapse;\">";
    foreach ($fields as $label => $value) {
        $html .= "<tr><td style=\"padding:8px;border:1px solid #d8d8d8;vertical-align:top;\"><strong>" . htmlspecialchars($label, ENT_QUOTES | ENT_HTML5, 'UTF-8') . "</strong></td>";
        $html .= "<td style=\"padding:8px;border:1px solid #d8d8d8;\">" . htmlspecialchars($value, ENT_QUOTES | ENT_HTML5, 'UTF-8') . "</td></tr>";
    }
    $html .= "</table></div>";
    return $html;
}

function clean_mail_subject(string $subject): string
{
    $subject = html_entity_decode($subject, ENT_QUOTES | ENT_HTML5, 'UTF-8');
    $subject = str_replace(["\r", "\n", "\t", "-", "–", "—", "â€”", "&amp;"], [" ", " ", " ", " ", " ", " ", " ", "&"], $subject);
    $subject = preg_replace('/[^\x20-\x7E]/', ' ', $subject) ?? '';
    $subject = preg_replace('/\s+/', ' ', $subject) ?? '';
    return trim($subject) ?: 'Onea Africa Website Submission';
}

function send_html_email(string $recipients, string $subject, string $html, string $from, array $cc = [], array $attachments = []): bool
{
    $safeSubject = clean_mail_subject($subject);
    $envelopeSender = 'connect@onea.co.za';

    // If there are no attachments, use a simple HTML content-type header which renders better in many corporate clients.
    if (empty($attachments)) {
        $headers = [];
        $headers[] = 'MIME-Version: 1.0';
        $headers[] = 'From: ' . $from;
        if (!empty($cc)) {
            $headers[] = 'Cc: ' . implode(', ', $cc);
        }
        $headers[] = 'Content-Type: text/html; charset=UTF-8';

        error_log('[onea-sendmail] attempting send to=' . $recipients . ' subject=' . $safeSubject);
        $sent = mail($recipients, $safeSubject, $html, implode("\r\n", $headers), "-f{$envelopeSender}");
        error_log('[onea-sendmail] result=' . ($sent ? 'sent' : 'failed') . ' to=' . $recipients);
        return $sent;
    }

    // Otherwise build a multipart/mixed message with an HTML part and attachments
    $boundary = '=_'.md5(uniqid((string) time(), true));
    $headers = [];
    $headers[] = 'MIME-Version: 1.0';
    $headers[] = 'From: ' . $from;
    if (!empty($cc)) {
        $headers[] = 'Cc: ' . implode(', ', $cc);
    }
    $headers[] = 'Content-Type: multipart/mixed; boundary="' . $boundary . '"';

    $body = "--{$boundary}\r\n";
    $body .= "Content-Type: text/html; charset=UTF-8\r\n";
    $body .= "Content-Transfer-Encoding: 7bit\r\n\r\n";
    $body .= $html . "\r\n";

    foreach ($attachments as $attachment) {
        if (empty($attachment['content']) || empty($attachment['filename'])) {
            continue;
        }
        $body .= "--{$boundary}\r\n";
        $body .= "Content-Type: {$attachment['mimetype']}; name=\"{$attachment['filename']}\"\r\n";
        $body .= "Content-Transfer-Encoding: base64\r\n";
        $body .= "Content-Disposition: attachment; filename=\"{$attachment['filename']}\"\r\n\r\n";
        $body .= chunk_split(base64_encode($attachment['content'])) . "\r\n";
    }

    $body .= "--{$boundary}--\r\n";

    error_log('[onea-sendmail] attempting send to=' . $recipients . ' subject=' . $safeSubject);
    $sent = mail($recipients, $safeSubject, $body, implode("\r\n", $headers), "-f{$envelopeSender}");
    error_log('[onea-sendmail] result=' . ($sent ? 'sent' : 'failed') . ' to=' . $recipients);
    return $sent;
}

function detect_image_extension(string $decoded): string
{
    if (strncmp($decoded, "\x89PNG\x0d\x0a\x1a\x0a", 8) === 0) {
        return '.png';
    }
    if (strncmp($decoded, "\xFF\xD8\xFF", 3) === 0) {
        return '.jpg';
    }
    return '';
}

function write_signature_files(array $signatures, string $uploadsDir): array
{
    if (!is_dir($uploadsDir)) {
        mkdir($uploadsDir, 0755, true);
    }

    $useGd = function_exists('imagecreatefromstring') && function_exists('imagepng');
    $saved = [];

    foreach ($signatures as $key => $value) {
        $decoded = decode_data_url((string) $value);
        if ($decoded === null) {
            continue;
        }
        $maxBytes = max(1024, (int) (getenv('MAX_SIGNATURE_BYTES') ?: 2097152));
        if (strlen($decoded) > $maxBytes) {
            continue;
        }

        $extension = detect_image_extension($decoded);
        if ($extension === '') {
            continue;
        }
        $path = $uploadsDir . '/sig_' . $key . '_' . uniqid('', true) . $extension;

        if ($useGd) {
            $image = @imagecreatefromstring($decoded);
            if ($image !== false) {
                $width = imagesx($image);
                $height = imagesy($image);
                $canvas = imagecreatetruecolor($width, $height);
                if ($canvas !== false) {
                    imagealphablending($canvas, true);
                    imagesavealpha($canvas, false);
                    $white = imagecolorallocate($canvas, 255, 255, 255);
                    imagefilledrectangle($canvas, 0, 0, $width, $height, $white);
                    imagecopy($canvas, $image, 0, 0, 0, 0, $width, $height);

                    if (imagepng($canvas, $path, 6)) {
                        imagedestroy($canvas);
                        imagedestroy($image);
                        $saved[$key] = $path;
                        continue;
                    }

                    imagedestroy($canvas);
                }
                imagedestroy($image);
            }
        }

        if (file_put_contents($path, $decoded, LOCK_EX) !== false) {
            $saved[$key] = $path;
            continue;
        }
    }

    return $saved;
}

function build_submission_lines(array $fields): array
{
    $lines = [];
    foreach ($fields as $key => $value) {
        $line = trim((string) $value);
        if ($line === '') {
            continue;
        }
        $label = ucfirst(str_replace(['_', '-'], ' ', $key));
        $lines[] = "{$label}: {$line}";
    }
    return $lines;
}

function normalize_form_type(string $value): string
{
    return strtolower(trim($value));
}

try {
    if (!is_post_request()) {
        respond(['error' => 'Only POST requests are accepted.'], 405);
    }

    onea_enforce_sendmail_rate_limit();
    $form = read_payload();
    if (!is_array($form) || $form === []) {
        respond(['error' => 'Invalid JSON payload or missing form data.'], 400);
    }
    foreach (['website', 'companyWebsite', 'faxNumber'] as $honeypot) {
        if (trim((string) ($form[$honeypot] ?? '')) !== '') {
            respond(['error' => 'Unable to process this submission.'], 400);
        }
    }

    $sig1 = trim((string) ($form['sig1'] ?? $form['signature'] ?? ''));
    $sig2 = trim((string) ($form['sig2'] ?? ''));
    $sig3 = trim((string) ($form['sig3'] ?? ''));

    $uploadsDir = __DIR__ . '/uploads';
    $signaturePayload = array_filter([
        'sig1' => $sig1,
        'sig2' => $sig2,
        'sig3' => $sig3,
    ], static fn ($value): bool => trim((string) $value) !== '');

    if (!empty($signaturePayload)) {
        $signatureFiles = write_signature_files($signaturePayload, $uploadsDir);
        if (count($signatureFiles) < count($signaturePayload)) {
            throw new RuntimeException('Unable to decode or write signature image data. Please resubmit with valid signature images.');
        }
    }

    $timestamp = date('Y-m-d H:i:s');
    $submissionId = 'ONEA-' . strtoupper(substr(sha1($timestamp . bin2hex(random_bytes(6))), 0, 10));

    $formType = normalize_form_type((string) ($form['formType'] ?? $form['submissionType'] ?? ''));
    $department = 'fallback';
    if (strpos($formType, 'hr') !== false || strpos($formType, 'team_application') !== false || strpos($formType, 'career') !== false || strpos($formType, 'talent') !== false) {
        $department = 'hr';
    } elseif (strpos($formType, 'telkom') !== false || strpos($formType, 'isp') !== false || strpos($formType, 'sales') !== false || isset($form['selectedPackage']) || isset($form['packagePrice'])) {
        $department = 'sales';
    }

    $primaryRecipient = $department === 'hr' ? 'hr@onea.co.za' : ($department === 'sales' ? 'sales@onea.co.za' : 'connect@onea.co.za');
    $defaultRecipient = $primaryRecipient;
    $ccRecipients = ['website@onea.co.za'];

    $expectedKeys = [
    'fullName', 'name', 'email', 'phone', 'mobile', 'company',
    'existingCustomer', 'existingNumber', 'coverageChecked', 'title', 'surname', 'firstNames', 'saCitizen', 'gender', 'idNumber', 'passportNumber', 'passportExpiryDate', 'homeNumber', 'officeNumber', 'alternateMobile', 'physicalAddress', 'suburb', 'city', 'postalAddressSameAsAbove', 'poBoxPBag', 'postalSuburbCity', 'postalCode', 'deliveryAddress', 'deliveryCity', 'deliveryPostalCode',
    'companyName', 'companyContactNo', 'companyAddress', 'companySuburb', 'companyCity', 'companyPostalCode', 'grossIncome', 'netIncome', 'totalExpenses', 'householdIncome',
    'bank', 'branchName', 'branchCode', 'accountHolderName', 'accountNumber', 'accountType', 'debitOrderMaxAmount', 'debitDate', 'authFullName', 'executionDate',
    'technologyType', 'requiredServiceDate', 'linesRequired', 'useExistingLine', 'serviceNumber', 'currentServiceProvider', 'preferredNetworkOperator', 'selectedPackage', 'packagePrice', 'dealId', 'dealDescription', 'contractPeriod', 'selfInstall',
    'representativeStatus', 'creditVettingConsent', 'tcCopyRequest', 'deliveryMethod', 'confirmationEmail', 'signingFullName', 'signingDate', 'serviceTerritoryAck',
    'service', 'message', 'notes', 'formType', 'submissionType',
];

$fields = [];
foreach ($expectedKeys as $key) {
    $fields[$key] = safe_text($form[$key] ?? '.');
}

$fields['service_territory'] = 'ZA';
$fields['primary_recipient'] = $primaryRecipient;
$fields['submission_id'] = $submissionId;
$fields['timestamp'] = $timestamp;

$submissionLines = build_submission_lines($fields);
$pdfDir = __DIR__ . '/data';
if (!is_dir($pdfDir)) {
    mkdir($pdfDir, 0755, true);
}
$pdfPath = $pdfDir . '/submission-' . $submissionId . '.pdf';
if (!create_text_pdf($pdfPath, 'Onea Africa Submission', $submissionLines)) {
    log_failed_lead(['submission' => $submissionId, 'error' => 'PDF render failed'], 'pdf_generation');
}

$googleSheetsUrl = onea_config_value('GOOGLE_SHEETS_WEBHOOK_URL');
$googleSheetsSecret = onea_config_value('GOOGLE_SHEETS_WEBHOOK_SECRET');
$whatsappUrl = onea_config_value('WHATSAPP_WEBHOOK_URL');
$whatsappSecret = onea_config_value('WHATSAPP_WEBHOOK_SECRET');
$whatsappTarget = '+27 69 464 4663';

$externalFailure = false;

if ($googleSheetsUrl !== '') {
    $sheetPayload = [
        'sheet' => 'ISP_TRACKING',
        'values' => [
            $timestamp,
            $fields['fullName'],
            $fields['physicalAddress'],
            $fields['technologyType'],
            $fields['companyName'],
            $fields['selectedPackage'],
            $fields['packagePrice'],
            $fields['mobile'],
            $fields['email'],
        ],
        'secret' => $googleSheetsSecret,
    ];
    $sheetResponse = curl_post_json($googleSheetsUrl, $sheetPayload, [], 5);
    if (!$sheetResponse['success']) {
        $externalFailure = true;
        log_failed_lead(['target' => 'google_sheets', 'url' => $googleSheetsUrl, 'response' => $sheetResponse, 'payload' => $sheetPayload], 'google_sheets_failure');
    }
}

if ($whatsappUrl !== '') {
    $waPayload = [
        'phone' => $whatsappTarget,
        'message' => 'New lead received: ' . $fields['fullName'] . ' | ' . $fields['mobile'] . ' | Service: ' . $fields['selectedPackage'] . ' | Ref: ' . $submissionId,
        'secret' => $whatsappSecret,
    ];
    $waResponse = curl_post_json($whatsappUrl, $waPayload, [], 5);
    if (!$waResponse['success']) {
        $externalFailure = true;
        log_failed_lead(['target' => 'whatsapp', 'url' => $whatsappUrl, 'response' => $waResponse, 'payload' => $waPayload], 'whatsapp_failure');
    }
}

$emailHtml = build_email_html($fields, $submissionId, $timestamp);

// Append selected email signature block if requested by the form
$signatureType = strtolower(trim((string) ($form['emailSignatureType'] ?? $form['email_signature_type'] ?? 'none')));
$signatureHtml = '';
if ($signatureType === 'standard_launch') {
    $signatureHtml = '<div style="font-family:Arial,sans-serif;color:#0b3d91;">'
        . '<p style="margin:0;font-weight:700;">Onea Africa</p>'
        . '<p style="margin:0;color:#333;">Launch Team</p>'
        . '<p style="margin:6px 0 0 0;color:#555;font-size:13px;">T: +27 21 123 4567 | E: connect@onea.co.za</p>'
        . '</div>';
} elseif ($signatureType === 'partner_executive') {
    $signatureHtml = '<div style="font-family:Arial,sans-serif;color:#1b6b3a;">'
        . '<p style="margin:0;font-weight:700;">Onea Africa</p>'
        . '<p style="margin:0;color:#333;">Partner Executive</p>'
        . '<p style="margin:6px 0 0 0;color:#555;font-size:13px;">M: +27 82 555 1234 | E: partners@onea.co.za</p>'
        . '</div>';
}

if ($signatureHtml !== '') {
    $emailHtml .= '<div style="margin-top:16px;">' . $signatureHtml . '</div>';
}
$attachments = [];
if (file_exists($pdfPath)) {
    $attachments[] = [
        'filename' => "onea-submission-{$submissionId}.pdf",
        'content' => file_get_contents($pdfPath),
        'mimetype' => 'application/pdf',
    ];
}

$fromEmail = 'Onea Africa <connect@onea.co.za>';
$mainRecipient = $defaultRecipient;
$mailResult = send_html_email($mainRecipient, "New Onea submission {$submissionId}", $emailHtml, $fromEmail, $ccRecipients, $attachments);
if (!$mailResult) {
    log_failed_lead(['recipient' => $mainRecipient, 'submission' => $submissionId, 'fields' => $fields], 'primary_mail_failure');
    respond(['error' => 'Unable to deliver notification email. Please contact connect@onea.co.za.'], 500);
}

if ($externalFailure) {
    $fallbackRecipient = implode(', ', [$defaultRecipient, 'connect@onea.co.za']);
    $fallbackBody = "<div style=\"font-family:Arial,sans-serif;max-width:700px;margin:0 auto;padding:24px;background:#fff8e1;border-radius:14px;\">";
    $fallbackBody .= "<h2 style=\"color:#333;\">External webhook delivery failed</h2>";
    $fallbackBody .= "<p style=\"color:#333;\">Submission <strong>{$submissionId}</strong> was accepted, but one or more tracking endpoints did not respond.</p>";
    $fallbackBody .= $emailHtml;
    $fallbackBody .= "</div>";
    send_html_email($fallbackRecipient, "Fallback delivery for {$submissionId}", $fallbackBody, $fromEmail, [], $attachments);
}

respond(['message' => 'Your submission has been received successfully.', 'id' => $submissionId], 201);
