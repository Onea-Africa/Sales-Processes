<?php
require_once __DIR__ . '/_common.php';

$session = require_auth(['admin', 'uploader', 'pr', 'comms']);

if (!is_post_request()) {
    respond(['error' => 'Method not allowed.'], 405);
}

$body = get_json_body();
$item = $body['item'] ?? [];

if (!is_array($item)) {
    respond(['error' => 'Invalid testimonial payload.'], 400);
}

if (($item['type'] ?? '') !== 'Testimonial') {
    respond(['error' => 'Only testimonial content can be published here.'], 400);
}

if (!in_array(($item['status'] ?? ''), ['approved', 'published'], true)) {
    respond(['error' => 'Testimonial must be approved before publishing.'], 400);
}

$name = trim((string) ($item['title'] ?? ''));
$quote = trim((string) ($item['body'] ?? ''));
$role = trim((string) ($item['excerpt'] ?? ''));

if ($name === '' || $quote === '' || $role === '') {
    respond(['error' => 'Client/company name, quote and role are required.'], 400);
}

$permissionText = strtolower((string) ($item['internalNotes'] ?? ''));
if (strpos($permissionText, 'permission') === false && strpos($permissionText, 'approved') === false && strpos($permissionText, 'consent') === false) {
    respond(['error' => 'Add permission confirmation in internal notes before publishing.'], 400);
}

function testimonial_slug($value) {
    $value = strtolower(trim((string) $value));
    $value = preg_replace('/[^a-z0-9]+/', '-', $value);
    return trim($value, '-') ?: ('testimonial-' . time());
}

function testimonial_initials($value) {
    $words = preg_split('/\s+/', trim((string) $value));
    $letters = '';
    foreach ($words as $word) {
        if ($word !== '') {
            $letters .= strtoupper(substr($word, 0, 1));
        }
        if (strlen($letters) >= 2) break;
    }
    return $letters ?: 'OA';
}

$id = testimonial_slug($item['slug'] ?? $name);
$testimonial = [
    'id' => $id,
    'name' => $name,
    'initials' => testimonial_initials($name),
    'quote' => $quote,
    'role' => $role,
    'service' => trim((string) ($item['category'] ?? '')),
    'location' => trim((string) ($item['targetAudience'] ?? '')),
    'rating' => 5,
    'gradFrom' => '#8CC444',
    'gradTo' => '#D6139F',
    'publishedBy' => $session['displayName'] ?? $session['username'] ?? 'Launch Platform',
    'publishedAt' => date('c'),
];

$path = __DIR__ . '/data/public-testimonials.json';
$testimonials = load_json_file($path);
if (!is_array($testimonials)) {
    $testimonials = [];
}
$testimonials[$id] = $testimonial;
save_json_file($path, $testimonials);

respond([
    'success' => true,
    'testimonial' => $testimonial,
]);
