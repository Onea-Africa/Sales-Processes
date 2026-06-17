<?php
require __DIR__ . '/_common.php';

if (!is_post_request()) {
    respond(['error' => 'Only POST requests are accepted.'], 405);
}

$input = get_json_body();
protect_public_submission($input, 'enquiries', 6, 900);
$name = sanitize($input['name'] ?? '');
$email = sanitize($input['email'] ?? '');
$phone = sanitize($input['phone'] ?? '');
$company = sanitize($input['company'] ?? '');
$leadArea = sanitize($input['leadArea'] ?? '');
$service = sanitize($input['service'] ?? '');
$message = sanitize($input['message'] ?? '');

$missing = [];
if (!$name) $missing[] = 'Name';
if (!$email) $missing[] = 'Email';
if (!$phone) $missing[] = 'Phone';
if (!$leadArea) $missing[] = 'Area / Township / Town';
if (!$service) $missing[] = 'Service';
if (trim($input['message'] ?? '') === '') $missing[] = 'Message';

if (!empty($missing)) {
    $label = count($missing) === 1 ? 'field' : 'fields';
    respond(['error' => 'Please complete the following required ' . $label . ': ' . implode(', ', $missing) . '.'], 400);
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    respond(['error' => 'Please provide a valid email address.'], 400);
}

$timestamp = date('Y-m-d H:i:s');
$adminEmail = 'connect@onea.co.za';
$fromEmail = get_env('MAIL_FROM', 'connect@onea.co.za');
$subject = "New Enquiry — {$service} from {$name}";
$html = "<div style=\"font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#f7f9f2;border-radius:12px;\">
  <h1 style=\"color:#102000;\">New Onea Enquiry</h1>
  <p style=\"color:#5a5a5a;\"><strong>Submitted:</strong> {$timestamp}</p>
  <table style=\"width:100%;border-collapse:collapse;font-size:14px;\">"
    . build_html_table_row('Name', $name)
    . build_html_table_row('Email', "<a href=\"mailto:{$email}\" style=\"color:#8CC444;\">{$email}</a>")
    . build_html_table_row('Phone', "<a href=\"tel:{$phone}\" style=\"color:#8CC444;\">{$phone}</a>")
    . build_html_table_row('Company', $company)
    . build_html_table_row('Area / Township / Town', $leadArea)
    . build_html_table_row('Service', $service)
    . build_html_table_row('Message', $message)
    . "</table>
</div>";

save_submission_json('enquiries', [
    'timestamp' => $timestamp,
    'name' => $name,
    'email' => $email,
    'phone' => $phone,
    'company' => $company,
    'leadArea' => $leadArea,
    'service' => $service,
    'message' => $message,
]);

append_to_sheet([$timestamp, $name, $email, $phone, $company, $leadArea, $service, $message], 'Web Enquiries');

if (!send_html_email($adminEmail, $subject, $html, "Onea Africa <{$fromEmail}>", $email)) {
    respond(['error' => 'Unable to send email. Please contact connect@onea.co.za directly.'], 500);
}

respond(['message' => 'Thank you — your enquiry has been received.'], 201);
