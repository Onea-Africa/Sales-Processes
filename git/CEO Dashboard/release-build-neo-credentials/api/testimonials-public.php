<?php
require_once __DIR__ . '/_common.php';

if (strtoupper($_SERVER['REQUEST_METHOD'] ?? '') !== 'GET') {
    respond(['error' => 'Method not allowed.'], 405);
}

$path = __DIR__ . '/data/public-testimonials.json';
$testimonials = load_json_file($path);

respond([
    'testimonials' => array_values(is_array($testimonials) ? $testimonials : []),
    'count' => is_array($testimonials) ? count($testimonials) : 0,
]);
