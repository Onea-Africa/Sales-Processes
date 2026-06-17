<?php
require __DIR__ . '/_common.php';

if (!is_post_request() && strtoupper($_SERVER['REQUEST_METHOD'] ?? '') !== 'GET') {
    respond(['error' => 'Only GET requests are accepted.'], 405);
}

$session = require_auth(['agent', 'uploader', 'pr', 'comms']);

$statusFile = __DIR__ . '/data/webhook-fallbacks/status.json';
$fallbackDir = __DIR__ . '/data/webhook-fallbacks';

$status = [];
if (file_exists($statusFile)) {
    $status = json_decode(file_get_contents($statusFile), true) ?: [];
}

$fallbacks = [];
if (is_dir($fallbackDir)) {
    $files = glob($fallbackDir . '/*.json');
    if ($files !== false) {
        rsort($files);
        foreach ($files as $file) {
            if (basename($file) === 'status.json') {
                continue;
            }
            $data = json_decode(file_get_contents($file), true);
            if (!is_array($data)) {
                continue;
            }
            $fallbacks[] = [
                'file' => basename($file),
                'type' => $data['type'] ?? null,
                'timestamp' => $data['timestamp'] ?? null,
                'note' => $data['note'] ?? null,
            ];
            if (count($fallbacks) >= 5) {
                break;
            }
        }
    }
}

respond(['status' => $status, 'recentFallbacks' => $fallbacks]);
