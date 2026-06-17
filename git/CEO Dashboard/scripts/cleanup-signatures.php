<?php
// Cleanup script: remove signature images and webhook fallback logs older than N days

$days = $argv[1] ?? getenv('SIGNATURE_RETENTION_DAYS') ?: 14;
$days = (int)$days;
$base = __DIR__ . '/../public/api/data';
$logs = $base . '/webhook-fallbacks';

function cleanup_dir($dir, $days) {
    $deleted = 0;
    if (!is_dir($dir)) return $deleted;
    $files = new DirectoryIterator($dir);
    foreach ($files as $f) {
        if (!$f->isFile()) continue;
        $age = time() - $f->getMTime();
        if ($age > ($days * 24 * 60 * 60)) {
            @unlink($f->getPathname());
            $deleted++;
        }
    }
    return $deleted;
}

$sigDeleted = cleanup_dir($base, $days);
$logDeleted = cleanup_dir($logs, $days);

echo "Cleanup complete. Signatures deleted: {$sigDeleted}. Logs deleted: {$logDeleted}.\n";
