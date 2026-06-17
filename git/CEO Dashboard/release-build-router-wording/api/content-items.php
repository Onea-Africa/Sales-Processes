<?php
require_once __DIR__ . '/_common.php';

$session = require_auth(['admin', 'uploader', 'agent', 'pr', 'comms']);
$method = strtoupper($_SERVER['REQUEST_METHOD'] ?? '');
$path = __DIR__ . '/data/content-center-items.json';

if ($method === 'GET') {
    $items = load_json_file($path);
    respond([
        'items' => array_values(is_array($items) ? $items : []),
        'count' => is_array($items) ? count($items) : 0,
    ]);
}

if ($method !== 'POST') {
    respond(['error' => 'Method not allowed.'], 405);
}

$role = $session['role'] ?? '';
if (!in_array($role, ['admin', 'uploader', 'pr', 'comms'], true)) {
    respond(['error' => 'Forbidden. Insufficient permissions.'], 403);
}

$body = get_json_body();
$item = $body['item'] ?? [];
if (!is_array($item)) {
    respond(['error' => 'Invalid content payload.'], 400);
}

$title = trim((string) ($item['title'] ?? ''));
if ($title === '') {
    respond(['error' => 'Title is required.'], 400);
}

function content_slug($value) {
    $value = strtolower(trim((string) $value));
    $value = preg_replace('/[^a-z0-9]+/', '-', $value);
    return trim($value, '-') ?: ('content-' . time());
}

$items = load_json_file($path);
if (!is_array($items)) {
    $items = [];
}

$id = content_slug($item['id'] ?? $item['slug'] ?? $title);
$existing = $items[$id] ?? null;
$requestedStatus = (string) ($item['status'] ?? 'draft');
$allowedStatuses = ['draft', 'review', 'approved', 'published', 'archived'];
if (!in_array($requestedStatus, $allowedStatuses, true)) {
    $requestedStatus = 'draft';
}

if (!in_array($role, ['admin', 'uploader'], true)) {
    if ($existing && in_array(($existing['status'] ?? ''), ['approved', 'published'], true)) {
        $requestedStatus = $existing['status'];
    } elseif (in_array($requestedStatus, ['approved', 'published'], true)) {
        $requestedStatus = 'review';
    }
}

$saved = [
    'id' => $id,
    'type' => trim((string) ($item['type'] ?? 'Blog')),
    'title' => $title,
    'slug' => content_slug($item['slug'] ?? $title),
    'category' => trim((string) ($item['category'] ?? 'Connectivity')),
    'targetAudience' => trim((string) ($item['targetAudience'] ?? '')),
    'status' => $requestedStatus,
    'owner' => trim((string) ($item['owner'] ?? ($session['displayName'] ?? 'PR / Comms'))),
    'dueDate' => trim((string) ($item['dueDate'] ?? '')),
    'excerpt' => trim((string) ($item['excerpt'] ?? '')),
    'body' => trim((string) ($item['body'] ?? '')),
    'seoTitle' => trim((string) ($item['seoTitle'] ?? '')),
    'seoDescription' => trim((string) ($item['seoDescription'] ?? '')),
    'keywords' => trim((string) ($item['keywords'] ?? '')),
    'cta' => trim((string) ($item['cta'] ?? 'Build an Estimate')),
    'internalNotes' => trim((string) ($item['internalNotes'] ?? '')),
    'updatedAt' => date('Y-m-d'),
    'updatedBy' => $session['displayName'] ?? $session['username'] ?? 'Launch Platform',
];

$items[$id] = $saved;
save_json_file($path, $items);

respond([
    'success' => true,
    'item' => $saved,
]);
