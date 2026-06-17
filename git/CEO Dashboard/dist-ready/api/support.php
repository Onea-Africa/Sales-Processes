<?php
require __DIR__ . '/_common.php';

if (!is_post_request()) {
    respond(['error' => 'Only POST requests are accepted.'], 405);
}

$input = get_json_body();
protect_public_submission($input, 'support', 6, 900);
$name = sanitize($input['name'] ?? '');
$email = sanitize($input['email'] ?? '');
$phone = sanitize($input['phone'] ?? '');
$leadArea = sanitize($input['leadArea'] ?? '');
$category = sanitize($input['category'] ?? '');
$serviceRef = sanitize($input['serviceRef'] ?? '');
$message = sanitize($input['message'] ?? '');

$missing = [];
if (!$name) $missing[] = 'Name';
if (!$email) $missing[] = 'Email';
if (!$leadArea) $missing[] = 'Area / Township / Town';
if (!$category) $missing[] = 'Support category';
if (!$message) $missing[] = 'Message';

if (!empty($missing)) {
    respond(['error' => 'Please complete: ' . implode(', ', $missing) . '.'], 400);
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    respond(['error' => 'Please provide a valid email address.'], 400);
}

$timestamp = date('Y-m-d H:i:s');
$ticketId = 'HELP-' . strtoupper(substr(hash('sha256', $email . $timestamp . random_int(1000, 9999)), 0, 8));
$helpdeskEmail = 'helpdesk@onea.co.za';
$fromEmail = get_env('MAIL_FROM', 'website@onea.co.za');

save_submission_json('client-support', [
    'timestamp' => $timestamp,
    'ticketId' => $ticketId,
    'name' => $name,
    'email' => $email,
    'phone' => $phone,
    'leadArea' => $leadArea,
    'category' => $category,
    'serviceRef' => $serviceRef,
    'message' => $message,
]);

append_to_sheet([$timestamp, $ticketId, $name, $email, $phone, $leadArea, $category, $serviceRef, $message], 'Client Support');

$html = "<div style=\"font-family:Arial,sans-serif;max-width:680px;margin:0 auto;padding:24px;background:#f7f9f2;border-radius:12px;\">\n"
    . "  <h1 style=\"color:#102000;margin-top:0;\">New Client Support Request</h1>\n"
    . "  <p style=\"color:#5a5a5a;\"><strong>Reference:</strong> {$ticketId}<br><strong>Submitted:</strong> {$timestamp}</p>\n"
    . "  <table style=\"width:100%;border-collapse:collapse;font-size:14px;\">\n"
    . build_html_table_row('Name', $name)
    . build_html_table_row('Email', "<a href=\"mailto:{$email}\" style=\"color:#8CC444;\">{$email}</a>")
    . build_html_table_row('Phone', $phone)
    . build_html_table_row('Area / Township / Town', $leadArea)
    . build_html_table_row('Category', $category)
    . build_html_table_row('Service Ref / B-number', $serviceRef)
    . build_html_table_row('Message', $message)
    . "  </table>\n"
    . "</div>";

$hubspotStatus = 'not_configured';
$hubspotTicketStatus = 'not_configured';
$token = get_env('HUBSPOT_PRIVATE_APP_TOKEN', '');

if ($token !== '') {
    $payload = json_encode([
        'filterGroups' => [[
            'filters' => [[
                'propertyName' => 'email',
                'operator' => 'EQ',
                'value' => $email,
            ]],
        ]],
        'properties' => ['email'],
        'limit' => 1,
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

    $headers = "Authorization: Bearer {$token}\r\nContent-Type: application/json\r\n";
    $search = @file_get_contents('https://api.hubapi.com/crm/v3/objects/contacts/search', false, stream_context_create([
        'http' => [
            'method' => 'POST',
            'header' => $headers,
            'content' => $payload,
            'ignore_errors' => true,
            'timeout' => 12,
        ],
    ]));
    $searchJson = $search ? json_decode($search, true) : [];
    $contactId = $searchJson['results'][0]['id'] ?? '';
    $parts = preg_split('/\s+/', trim($name), 2);
    $properties = [
        'email' => $email,
        'firstname' => $parts[0] ?? $name,
        'lastname' => $parts[1] ?? '',
        'phone' => $phone,
        'lifecyclestage' => 'customer',
    ];

    $method = $contactId ? 'PATCH' : 'POST';
    $url = $contactId
        ? 'https://api.hubapi.com/crm/v3/objects/contacts/' . rawurlencode((string) $contactId)
        : 'https://api.hubapi.com/crm/v3/objects/contacts';

    $hubspot = @file_get_contents($url, false, stream_context_create([
        'http' => [
            'method' => $method,
            'header' => $headers,
            'content' => json_encode(['properties' => $properties], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
            'ignore_errors' => true,
            'timeout' => 12,
        ],
    ]));

    $hubspotStatus = $hubspot === false ? 'failed' : 'synced';
    $hubspotContact = $hubspot ? json_decode($hubspot, true) : [];
    if (!$contactId && !empty($hubspotContact['id'])) {
        $contactId = (string) $hubspotContact['id'];
    }
    if ($hubspot === false) {
        error_log('[onea-support] HubSpot sync failed for ' . $email);
    }

    $ticketPipeline = get_env('HUBSPOT_TICKET_PIPELINE_ID', '');
    $ticketStage = get_env('HUBSPOT_TICKET_STAGE_ID', '');
    if ($ticketPipeline !== '' && $ticketStage !== '') {
        $ticketPayload = [
            'properties' => [
                'subject' => "{$ticketId} - {$category}",
                'content' => "Client: {$name}\nEmail: {$email}\nPhone: {$phone}\nArea / Township / Town: {$leadArea}\nService Ref / B-number: {$serviceRef}\n\n{$message}",
                'hs_pipeline' => $ticketPipeline,
                'hs_pipeline_stage' => $ticketStage,
                'hs_ticket_priority' => 'MEDIUM',
            ],
        ];

        $ticket = @file_get_contents('https://api.hubapi.com/crm/v3/objects/tickets', false, stream_context_create([
            'http' => [
                'method' => 'POST',
                'header' => $headers,
                'content' => json_encode($ticketPayload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
                'ignore_errors' => true,
                'timeout' => 12,
            ],
        ]));

        $hubspotTicketStatus = $ticket === false ? 'failed' : 'created';
        if ($ticket === false) {
            error_log('[onea-support] HubSpot ticket creation failed for ' . $ticketId);
        }
    } else {
        $hubspotTicketStatus = 'missing_pipeline_settings';
    }
}

if (!send_html_email($helpdeskEmail, "Client support request {$ticketId} {$category}", $html, "Onea Africa <{$fromEmail}>", $email)) {
    respond(['error' => 'Unable to send support request. Please email helpdesk@onea.co.za directly.'], 500);
}

$clientHtml = "<div style=\"font-family:Arial,sans-serif;max-width:620px;margin:0 auto;padding:24px;background:#f7f9f2;border-radius:12px;\">\n"
    . "  <h1 style=\"color:#102000;margin-top:0;\">Support request received</h1>\n"
    . "  <p>Hi {$name},</p>\n"
    . "  <p>Onea Africa has received your support request. Our helpdesk will review it and respond as soon as possible.</p>\n"
    . "  <div style=\"background:white;border-left:4px solid #8CC444;padding:14px 16px;margin:18px 0;border-radius:6px;\">\n"
    . "    <strong>Reference:</strong> {$ticketId}<br>\n"
    . "    <strong>Category:</strong> {$category}\n"
    . "  </div>\n"
    . "  <p style=\"color:#666;font-size:12px;\">For urgent support, WhatsApp Onea Africa on +27 69 464 4663.</p>\n"
    . "</div>";

send_html_email($email, "Onea support request received {$ticketId}", $clientHtml, "Onea Africa <{$fromEmail}>", $helpdeskEmail);

respond([
    'message' => 'Support request received.',
    'ticketId' => $ticketId,
    'hubspot' => $hubspotStatus,
    'hubspotTicket' => $hubspotTicketStatus,
], 201);
