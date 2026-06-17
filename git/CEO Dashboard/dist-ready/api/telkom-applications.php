<?php
require __DIR__ . '/_common.php';

if (!is_post_request()) {
    respond(['error' => 'Only POST requests are accepted.'], 405);
}

$input = get_json_body();
protect_public_submission($input, 'telkom-applications', 4, 1800);
$fullName = sanitize($input['fullName'] ?? '');
$email = sanitize($input['email'] ?? '');
$mobile = sanitize($input['mobile'] ?? '');
$physicalAddress = sanitize($input['physicalAddress'] ?? '');
$leadArea = sanitize($input['leadArea'] ?? '');
$premisesType = sanitize($input['premisesType'] ?? '');
$premisesOwnAddress = sanitize($input['premisesOwnAddress'] ?? '');
$addressCreationRequired = filter_var($input['addressCreationRequired'] ?? false, FILTER_VALIDATE_BOOLEAN);
$packagePrice = sanitize($input['packagePrice'] ?? '');
$selectedPackage = sanitize($input['selectedPackage'] ?? '');
$serviceType = sanitize($input['serviceType'] ?? '');
$activationDate = sanitize($input['activationDate'] ?? '');
$requiresRouter = sanitize($input['requiresRouter'] ?? '');
$hasExistingLine = sanitize($input['hasExistingLine'] ?? '');
$idNumber = sanitize($input['idNumber'] ?? '');
$signatureOne = $input['sig1'] ?? '';
$signatureTwo = $input['sig2'] ?? '';
$signatureThree = $input['sig3'] ?? '';

// Ensure data directory exists early for saving signatures
$dataDir = __DIR__ . '/data';
if (!is_dir($dataDir)) {
    mkdir($dataDir, 0755, true);
}

function decode_data_url_local(string $data) {
    if (preg_match('/^data:(image\/png|image\/jpeg);base64,(.+)$/i', trim($data), $matches)) {
        return base64_decode($matches[2], true);
    }
    $decoded = base64_decode($data, true);
    return $decoded !== false ? $decoded : null;
}

$signatureFiles = [];
foreach (['sig1' => $signatureOne, 'sig2' => $signatureTwo, 'sig3' => $signatureThree] as $key => $sig) {
    if (!$sig) continue;
    $decoded = decode_data_url_local($sig);
    if (!$decoded) continue;
    if (strlen($decoded) > max(1024, (int) get_env('MAX_SIGNATURE_BYTES', '2097152'))) {
        respond(['error' => 'A signature image exceeds the allowed size.'], 400);
    }
    $mime = (new finfo(FILEINFO_MIME_TYPE))->buffer($decoded);
    if (!in_array($mime, ['image/png', 'image/jpeg'], true)) {
        respond(['error' => 'A signature image has an invalid file type.'], 400);
    }
    $tmp = tempnam($dataDir, 'telkom_sig_');
    if ($tmp) {
        $path = $tmp . '.png';
        file_put_contents($path, $decoded, LOCK_EX);
        $signatureFiles[] = $path;
    }
}

if (!$fullName || !$email || !$mobile || !$leadArea || !$premisesType || !$premisesOwnAddress) {
    respond(['error' => 'Full name, email, mobile number, area and premises details are required.'], 400);
}

function safe_field_value($value, $fallback = '(?)') {
    $value = trim((string) $value);
    return $value === '' ? $fallback : $value;
}

function safe_yes_no($value, string $fallback = '(?)') {
    $value = strtoupper(trim((string)$value));
    if ($value === 'Y' || $value === 'YES') {
        return 'Y';
    }
    if ($value === 'N' || $value === 'NO') {
        return 'N';
    }
    return $fallback;
}

$timestamp = date('Y-m-d H:i:s');
$id = 'TLK-' . time() . '-' . strtoupper(substr(md5($fullName . microtime(true)), 0, 6));
$adminEmail = get_env('SALES_EMAIL', 'sales@onea.co.za');
$fromEmail = get_env('MAIL_FROM', 'sales@onea.co.za');

function pdf_escape($text) {
    return str_replace(['\\', '(', ')'], ['\\\\', '\\(', '\\)'], $text);
}

function safe_field(string $value, string $fallback = '-') {
    return trim($value) !== '' ? $value : $fallback;
}

function build_pdf_content($title, $lines) {
    $content = "BT /F1 12 Tf 50 800 Td ({$title}) Tj ET\n";
    $y = 780;
    foreach ($lines as $line) {
        if ($line === '') {
            continue;
        }
        $escaped = pdf_escape($line);
        $content .= "BT /F1 10 Tf 50 {$y} Td ({$escaped}) Tj ET\n";
        $y -= 16;
    }
    return $content;
}

function create_pdf_file($path, $title, $lines) {
    $stream = build_pdf_content($title, $lines);
    $obj1 = "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n";
    $obj2 = "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n";
    $obj3 = "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>\nendobj\n";
    $obj4 = "4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n";
    $streamLength = strlen($stream);
    $obj5 = "5 0 obj\n<< /Length {$streamLength} >>\nstream\n{$stream}endstream\nendobj\n";
    $objects = [ $obj1, $obj2, $obj3, $obj4, $obj5 ];
    $xref = "xref\n0 6\n0000000000 65535 f \n";
    $offset = 9;
    $positions = [9];
    foreach ($objects as $obj) {
        $offset += strlen($obj);
        $positions[] = $offset;
    }
    for ($i = 1; $i <= 5; $i++) {
        $xref .= str_pad($positions[$i - 1], 10, '0', STR_PAD_LEFT) . " 00000 n \n";
    }
    $startxref = strlen("%PDF-1.4\n") + array_reduce($objects, fn($carry, $item) => $carry + strlen($item), 0);
    $pdf = "%PDF-1.4\n" . implode('', $objects) . $xref . "trailer<< /Size 6 /Root 1 0 R >>\nstartxref {$startxref}\n%%EOF";
    file_put_contents($path, $pdf);
    return file_exists($path) ? $path : null;
}

$lines = [
    "Reference: {$id}",
    "Submitted: {$timestamp}",
    "Full Name: " . safe_field($fullName, '(?)'),
    "Email: " . safe_field($email, '(?)'),
    "Mobile: " . safe_field($mobile, '(?)'),
    "Area / Township / Town: " . safe_field($leadArea, '(?)'),
    "Physical Address: " . safe_field($physicalAddress, '(?)'),
    "Premises Type: " . safe_field(ucwords(str_replace('-', ' ', $premisesType)), '(?)'),
    "Own Recognized Address: " . safe_field($premisesOwnAddress, '(?)'),
    "Address Creation Required (Internal): " . ($addressCreationRequired ? 'YES - FOLLOW UP' : 'No'),
    "Package: " . safe_field($selectedPackage, '(?)'),
    "Price: " . ($packagePrice !== '' ? "R {$packagePrice}" : '(-)'),
    "Service Type: " . safe_field($serviceType, '(?)'),
    "Activation Date: " . safe_field($activationDate, '(?)'),
    "Router Required: " . safe_yes_no($requiresRouter),
    "Existing Line: " . safe_yes_no($hasExistingLine),
    "ID / Passport: " . safe_field($idNumber, '(?)'),
];

$dataDir = __DIR__ . '/data';
if (!is_dir($dataDir)) {
    mkdir($dataDir, 0755, true);
}

$pdfPath = $dataDir . "/telkom-{$id}.pdf";
create_pdf_file($pdfPath, 'Telkom Application', $lines);

save_submission_json('telkom-applications', [
    'id' => $id,
    'timestamp' => $timestamp,
    'fullName' => $fullName,
    'email' => $email,
    'mobile' => $mobile,
    'leadArea' => $leadArea,
    'premisesType' => $premisesType,
    'premisesOwnAddress' => $premisesOwnAddress,
    'addressCreationRequired' => $addressCreationRequired,
    'selectedPackage' => $selectedPackage,
    'packagePrice' => $packagePrice,
]);

append_to_sheet([$timestamp, $id, $fullName, $email, $mobile, $leadArea, $premisesType, $addressCreationRequired ? 'Y' : 'N', $selectedPackage, $packagePrice, $serviceType, $activationDate], 'Telkom Applications');

$html = "<div style=\"font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#f7f9f2;border-radius:12px;\">
  <h1 style=\"color:#102000;\">Telkom Application Received</h1>
  <p style=\"color:#5a5a5a;\">Thank you for your submission. Your application reference is <strong>{$id}</strong>.</p>
  <p>A consultant will contact you within 1-2 business days.</p>
  <p style=\"margin-top:24px;color:#888;font-size:12px;\">Onea Africa · sales@onea.co.za · +27 69 464 4663</p>
</div>";

$attachments = [];
if (file_exists($pdfPath)) {
    $attachments[] = [
        'filename' => "Onea-Telkom-{$id}.pdf",
        'content' => file_get_contents($pdfPath),
        'mimetype' => 'application/pdf',
    ];
}

// Attach any captured signature PNGs for audit if present
foreach ($signatureFiles as $sf) {
    if (file_exists($sf)) {
        $attachments[] = [
            'filename' => basename($sf),
            'content' => file_get_contents($sf),
            'mimetype' => 'image/png',
        ];
    }
}

if (!send_html_email($adminEmail, "New Telkom Application — {$id}", $html, "Onea Africa <{$fromEmail}>", $email, $attachments)) {
    respond(['error' => 'Unable to send the Telkom application email.'], 500);
}

respond(['message' => 'Your Telkom application has been submitted.', 'id' => $id], 201);
