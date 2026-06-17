<?php
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    echo json_encode([
        'status' => 'ok',
        'timestamp' => date('c'),
    ], JSON_UNESCAPED_SLASHES);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Only GET and POST are accepted.']);
    exit;
}

$bytes = 0;
$stream = fopen('php://input', 'rb');
if ($stream) {
    while (!feof($stream)) {
        $chunk = fread($stream, 8192);
        if ($chunk === false) {
            break;
        }
        $bytes += strlen($chunk);
    }
    fclose($stream);
}

echo json_encode([
    'status' => 'ok',
    'bytes' => $bytes,
    'timestamp' => date('c'),
], JSON_UNESCAPED_SLASHES);
