<?php
require __DIR__ . '/_common.php';

if (!is_post_request()) {
    respond(['error' => 'Only POST requests are accepted.'], 405);
}

$input = get_json_body();
protect_public_submission($input, 'careers-applications', 4, 3600, 'careers');
$mode = sanitize($input['mode'] ?? 'speculative');
$name = sanitize($input['name'] ?? '');
$email = sanitize($input['email'] ?? '');
$phone = sanitize($input['phone'] ?? '');
$leadArea = sanitize($input['leadArea'] ?? '');
$idNumber = sanitize($input['idNumber'] ?? '');
$position = sanitize($input['position'] ?? '');
$message = sanitize($input['message'] ?? '');
$linkedin = sanitize($input['linkedin'] ?? '');
$source = sanitize($input['source'] ?? '');
$cvBase64 = $input['cvBase64'] ?? '';
$cvFilename = sanitize($input['cvFilename'] ?? '');

if (!$name || !$email || !$phone || !$leadArea || !$message) {
    respond(['error' => 'Name, email, phone, area and message are required.'], 400);
}
if (($mode === 'apply' || $mode === 'speculative') && !$position) {
    respond(['error' => 'Please specify a position or area of interest.'], 400);
}

$timestamp = date('Y-m-d H:i:s');
$adminEmail = 'hr@onea.co.za';
$fromEmail = get_env('MAIL_FROM', 'connect@onea.co.za');
$subjectLabel = $mode === 'apply' ? 'Job Application' : ($mode === 'contact' ? 'General Enquiry' : 'Speculative Application');

$html = "<div style=\"font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#f7f9f2;border-radius:12px;\">
  <h1 style=\"color:#102000;\">{$subjectLabel}</h1>
  <p style=\"color:#5a5a5a;\"><strong>Submitted:</strong> {$timestamp}</p>
  <table style=\"width:100%;border-collapse:collapse;font-size:14px;\">"
    . build_html_table_row('Full Name', $name)
    . build_html_table_row('Email', "<a href=\"mailto:{$email}\">{$email}</a>")
    . build_html_table_row('Phone', "<a href=\"tel:{$phone}\">{$phone}</a>")
    . build_html_table_row('Area / Township / Town', $leadArea)
    . build_html_table_row('ID / Passport', $idNumber)
    . build_html_table_row($mode === 'apply' ? 'Position' : 'Area of Interest', $position)
    . build_html_table_row('Message', $message)
    . build_html_table_row('LinkedIn', $linkedin ? "<a href=\"{$linkedin}\">{$linkedin}</a>" : '&mdash;')
    . build_html_table_row('Heard About Us', $source)
    . "</table>\n</div>";

$attachments = [];
if ($cvBase64 && $cvFilename) {
    $decoded = base64_decode($cvBase64, true);
    $maxCvBytes = max(1024, (int) get_env('MAX_CV_BYTES', '5242880'));
    if ($decoded === false || strlen($decoded) > $maxCvBytes) {
        respond(['error' => 'CV file is invalid or exceeds the 5 MB limit.'], 400);
    }
    $temporaryCv = tempnam(sys_get_temp_dir(), 'onea-cv-');
    if ($temporaryCv === false || file_put_contents($temporaryCv, $decoded, LOCK_EX) === false) {
        if ($temporaryCv) @unlink($temporaryCv);
        respond(['error' => 'Unable to inspect the CV file.'], 500);
    }
    $inspection = inspect_uploaded_file(
        $temporaryCv,
        $cvFilename,
        [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ],
        $maxCvBytes
    );
    @unlink($temporaryCv);
    if (!$inspection['ok']) {
        respond(['error' => $inspection['error']], 400);
    }
    $attachments[] = [
        'filename' => $inspection['filename'],
        'content' => $decoded,
        'mimetype' => $inspection['mime'],
    ];
}

save_submission_json('applications', [
    'timestamp' => $timestamp,
    'mode' => $mode,
    'name' => $name,
    'email' => $email,
    'phone' => $phone,
    'leadArea' => $leadArea,
    'idNumber' => $idNumber,
    'position' => $position,
    'message' => $message,
    'linkedin' => $linkedin,
    'source' => $source,
]);

append_to_sheet([$timestamp, $name, $email, $phone, $leadArea, $idNumber, $position, $message, $linkedin, $source], 'Careers Applications');

if (!send_html_email($adminEmail, "{$subjectLabel} — {$name}", $html, "Onea Africa <{$fromEmail}>", $email, $attachments)) {
    respond(['error' => 'Unable to send application email. Please contact hr@onea.co.za directly.'], 500);
}

respond(['message' => 'Thank you. Your application has been submitted.'], 201);
