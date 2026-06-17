<?php
require __DIR__ . '/_common.php';

if (!is_post_request()) {
    respond(['error' => 'Only POST requests are accepted.'], 405);
}

$input = get_json_body();
protect_public_submission($input, 'newsletter', 4, 3600);
$email = sanitize($input['email'] ?? '');
$source = sanitize($input['source'] ?? 'Website footer newsletter');

if (!$email || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    respond(['error' => 'Please provide a valid email address.'], 400);
}

$timestamp = date('Y-m-d H:i:s');
$token = get_env('HUBSPOT_PRIVATE_APP_TOKEN', '');

save_submission_json('newsletter-subscribers', [
    'timestamp' => $timestamp,
    'email' => $email,
    'source' => $source,
]);

function hubspot_request(string $method, string $url, string $token, ?array $payload = null): array
{
    $headers = [
        "Authorization: Bearer {$token}",
        "Content-Type: application/json",
    ];

    $opts = [
        'http' => [
            'method' => $method,
            'header' => implode("\r\n", $headers) . "\r\n",
            'ignore_errors' => true,
            'timeout' => 12,
        ],
    ];

    if ($payload !== null) {
        $opts['http']['content'] = json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    }

    $body = @file_get_contents($url, false, stream_context_create($opts));
    $status = 0;
    $responseHeaders = function_exists('http_get_last_response_headers')
        ? http_get_last_response_headers()
        : ($http_response_header ?? []);
    if (isset($responseHeaders[0]) && preg_match('/\s(\d{3})\s/', $responseHeaders[0], $matches)) {
        $status = (int) $matches[1];
    }

    return [
        'ok' => $status >= 200 && $status < 300,
        'status' => $status,
        'body' => $body ?: '',
        'json' => $body ? json_decode($body, true) : null,
    ];
}

if ($token === '') {
    error_log('[onea-newsletter] HubSpot token missing; subscriber saved locally: ' . $email);
    respond([
        'message' => 'Subscription saved. HubSpot token is not configured yet.',
        'hubspot' => 'queued',
    ], 202);
}

$search = hubspot_request('POST', 'https://api.hubapi.com/crm/v3/objects/contacts/search', $token, [
    'filterGroups' => [[
        'filters' => [[
            'propertyName' => 'email',
            'operator' => 'EQ',
            'value' => $email,
        ]],
    ]],
    'properties' => ['email'],
    'limit' => 1,
]);

$properties = [
    'email' => $email,
    'hs_email_optout' => 'false',
    'lifecyclestage' => 'subscriber',
];

$contactId = '';
if ($search['ok'] && !empty($search['json']['results'][0]['id'])) {
    $contactId = (string) $search['json']['results'][0]['id'];
}

if ($contactId !== '') {
    $result = hubspot_request('PATCH', 'https://api.hubapi.com/crm/v3/objects/contacts/' . rawurlencode($contactId), $token, [
        'properties' => $properties,
    ]);
} else {
    $result = hubspot_request('POST', 'https://api.hubapi.com/crm/v3/objects/contacts', $token, [
        'properties' => $properties,
    ]);
}

if (!$result['ok']) {
    error_log('[onea-newsletter] HubSpot sync failed status=' . $result['status'] . ' email=' . $email . ' body=' . substr($result['body'], 0, 500));
    respond([
        'error' => 'Subscription saved locally, but HubSpot sync failed.',
        'hubspotStatus' => $result['status'],
    ], 502);
}

respond([
    'message' => 'Subscription saved to HubSpot.',
    'hubspot' => 'synced',
], $contactId !== '' ? 200 : 201);
