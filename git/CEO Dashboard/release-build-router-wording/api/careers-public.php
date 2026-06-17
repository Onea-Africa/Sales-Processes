<?php
require_once __DIR__ . '/_common.php';

$path = __DIR__ . '/data/public-careers.json';
$positions = load_json_file($path);

respond([
    'positions' => array_values(is_array($positions) ? $positions : []),
]);
