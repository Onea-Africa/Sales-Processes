<?php
require __DIR__ . '/_common.php';

// Admin-only audit endpoint for preserved signature files and PDF generation logs
// Usage: call with a valid session or bearer token recognized by require_auth()

$session = require_auth(['agent', 'uploader', 'pr', 'comms']);

$dataDir = __DIR__ . '/data';
$logDir = $dataDir . '/webhook-fallbacks';

$result = [
    'signatureFiles' => [],
    'pdfErrorLogs' => [],
    'submissions' => [],
    'generatedAt' => date('c'),
    'user' => $session['displayName'] ?? $session['username'] ?? 'unknown',
];

// Gather signature files stored in the data directory
if (is_dir($dataDir)) {
    $it = new DirectoryIterator($dataDir);
    foreach ($it as $file) {
        if ($file->isFile()) {
            $name = $file->getFilename();
            // heuristics: signature files often contain 'sig' or 'telkom_sig' or 'sig_' prefix
            if (stripos($name, 'sig') !== false) {
                $result['signatureFiles'][] = [
                    'name' => $name,
                    'path' => 'api/data/' . $name,
                    'size' => $file->getSize(),
                    'modified' => date('c', $file->getMTime()),
                ];
            }
        }
    }
}

// Gather pdf-generation error logs
if (is_dir($logDir)) {
    $files = glob($logDir . '/*.json');
    if ($files) {
        foreach ($files as $f) {
            $result['pdfErrorLogs'][] = [
                'name' => basename($f),
                'path' => 'api/data/webhook-fallbacks/' . basename($f),
                'size' => filesize($f),
                'modified' => date('c', filemtime($f)),
            ];
        }
    }
}

// Load submission summaries (if present)
$subFiles = glob($dataDir . '/*.json');
if ($subFiles) {
    foreach ($subFiles as $sf) {
        $base = basename($sf);
        // Only include known submission files
        if (preg_match('/sendmail|telkom|isp|submissions/i', $base)) {
            $content = @json_decode(@file_get_contents($sf), true);
            $result['submissions'][] = [
                'file' => $base,
                'count' => is_array($content) ? count($content) : 0,
                'preview' => is_array($content) ? array_slice($content, -5) : [],
            ];
        }
    }
}

respond($result);

