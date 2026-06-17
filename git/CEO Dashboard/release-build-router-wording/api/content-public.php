<?php
require_once __DIR__ . '/_common.php';

if (strtoupper($_SERVER['REQUEST_METHOD'] ?? '') !== 'GET') {
    respond(['error' => 'Method not allowed.'], 405);
}

$path = __DIR__ . '/data/public-blogs.json';
$posts = load_json_file($path);

respond([
    'posts' => array_values($posts),
    'count' => is_array($posts) ? count($posts) : 0,
]);
