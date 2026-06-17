<?php
require_once __DIR__ . '/_common.php';

$session = require_auth(['admin', 'uploader', 'pr', 'comms']);

if (!is_post_request()) {
    respond(['error' => 'Method not allowed.'], 405);
}

$body = get_json_body();
$item = $body['item'] ?? [];

if (!is_array($item)) {
    respond(['error' => 'Invalid job advert payload.'], 400);
}

$role = $session['role'] ?? '';
if (!in_array($role, ['admin', 'uploader', 'pr', 'comms'], true)) {
    respond(['error' => 'Forbidden. Insufficient permissions.'], 403);
}

$type = (string) ($item['type'] ?? '');
if ($type !== 'Job Advert') {
    respond(['error' => 'Only job advert content can be published to careers.'], 400);
}

$status = (string) ($item['status'] ?? '');
if (!in_array($status, ['approved', 'published'], true)) {
    respond(['error' => 'Job advert must be approved before it can be published.'], 400);
}

$title = trim((string) ($item['title'] ?? ''));
$description = trim((string) ($item['body'] ?? ''));
$location = trim((string) ($item['targetAudience'] ?? ''));
$employmentType = trim((string) ($item['excerpt'] ?? ''));
$division = trim((string) ($item['category'] ?? 'Connect'));
$slug = trim((string) ($item['slug'] ?? $item['id'] ?? $title));

if ($title === '' || $description === '' || $location === '' || $employmentType === '') {
    respond(['error' => 'Position title, location, employment type and role description are required before publishing.'], 400);
}

$internalPattern = '/supplier cost|dealer cost|account number|margin|internal pricing|secret|password|stock feed|salary confidential|fortinet pos|nology|scoop|miro|asbis|core group/i';
$combined = implode("\n", [
    $title,
    $description,
    $location,
    $employmentType,
    $division,
    (string) ($item['seoDescription'] ?? ''),
    (string) ($item['keywords'] ?? ''),
]);

if (preg_match($internalPattern, $combined)) {
    respond(['error' => 'Public safety check blocked publishing. Remove supplier/internal pricing or private details first.'], 400);
}

function public_career_slug($value) {
    $value = strtolower(trim((string) $value));
    $value = preg_replace('/[^a-z0-9]+/', '-', $value);
    return trim($value, '-') ?: ('position-' . time());
}

$id = public_career_slug($slug ?: $title);
$position = [
    'id' => $id,
    'title' => $title,
    'division' => $division,
    'location' => $location,
    'type' => $employmentType,
    'desc' => $description,
    'cta' => trim((string) ($item['cta'] ?? 'Apply Now')) ?: 'Apply Now',
    'seoTitle' => trim((string) ($item['seoTitle'] ?? '')),
    'seoDescription' => trim((string) ($item['seoDescription'] ?? '')),
    'publishedBy' => $session['displayName'] ?? $session['username'] ?? 'Launch Platform',
    'publishedAt' => date('c'),
];

$path = __DIR__ . '/data/public-careers.json';
$positions = load_json_file($path);
if (!is_array($positions)) {
    $positions = [];
}

$positions[$id] = $position;
save_json_file($path, $positions);

respond([
    'success' => true,
    'position' => $position,
    'message' => 'Job advert published to the public careers feed.',
]);
