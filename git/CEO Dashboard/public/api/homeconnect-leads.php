<?php
require __DIR__ . '/_common.php';

if (!is_post_request()) {
    respond(['error' => 'Only POST requests are accepted.'], 405);
}

$input = get_json_body();
protect_public_submission($input, 'homeconnect-leads', 5, 900);
$firstName = sanitize($input['firstName'] ?? '');
$lastName = sanitize($input['lastName'] ?? '');
$email = sanitize($input['email'] ?? '');
$cellphone = sanitize($input['cellphone'] ?? '');
$selectedPackage = sanitize($input['selectedPackage'] ?? '');
$packagePrice = sanitize($input['packagePrice'] ?? '');
$whatsapp = sanitize($input['whatsapp'] ?? '');
$idNumber = sanitize($input['idNumber'] ?? '');
$title = sanitize($input['title'] ?? '');
$leadArea = sanitize($input['leadArea'] ?? '');
$fullName = trim(($title ? $title . ' ' : '') . $firstName . ' ' . $lastName);

if (!$firstName || !$lastName || !$email || !$cellphone || !$leadArea || !$selectedPackage) {
    respond(['error' => 'First name, last name, email, cellphone, area and package are required.'], 400);
}

$timestamp = date('Y-m-d H:i:s');
$id = 'HCN-' . time() . '-' . strtoupper(substr(md5($fullName . microtime(true)), 0, 6));
$adminEmail = get_env('SALES_EMAIL', 'sales@onea.co.za');
$fromEmail = get_env('MAIL_FROM', 'noreply@onea.africa');

$html = "<div style=\"font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#f7f9f2;border-radius:12px;\">
  <h1 style=\"color:#102000;\">New Home Connect Lead</h1>
  <p style=\"color:#5a5a5a;\"><strong>Reference:</strong> {$id}</p>
  <p><strong>Submitted:</strong> {$timestamp}</p>
  <table style=\"width:100%;border-collapse:collapse;font-size:14px;\">"
    . build_html_table_row('Full Name', $fullName)
    . build_html_table_row('ID / Passport', $idNumber)
    . build_html_table_row('Cellphone', "<a href=\"tel:{$cellphone}\">{$cellphone}</a>")
    . build_html_table_row('WhatsApp', $whatsapp ?: '&mdash;')
    . build_html_table_row('Email', "<a href=\"mailto:{$email}\">{$email}</a>")
    . build_html_table_row('Area / Township / Town', $leadArea)
    . build_html_table_row('Package', $selectedPackage)
    . build_html_table_row('Monthly Fee', $packagePrice ? 'R ' . $packagePrice : '&mdash;')
    . "</table>
</div>";

save_submission_json('homeconnect-leads', [
    'id' => $id,
    'timestamp' => $timestamp,
    'fullName' => $fullName,
    'email' => $email,
    'cellphone' => $cellphone,
    'leadArea' => $leadArea,
    'selectedPackage' => $selectedPackage,
    'packagePrice' => $packagePrice,
    'whatsapp' => $whatsapp,
    'idNumber' => $idNumber,
]);

append_to_sheet([$timestamp, $id, $fullName, $email, $cellphone, $leadArea, $selectedPackage, $packagePrice, $whatsapp], 'Home Connect Leads');

if (!send_html_email($adminEmail, "New Home Connect Lead — {$id}", $html, "Onea Africa <{$fromEmail}>", $email)) {
    respond(['error' => 'Unable to send lead email. Please contact sales@onea.co.za directly.'], 500);
}

respond(['message' => 'Application submitted successfully.', 'id' => $id], 201);
