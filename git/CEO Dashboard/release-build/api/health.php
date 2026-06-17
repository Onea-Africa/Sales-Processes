<?php
require __DIR__ . '/_common.php';
$session = require_auth(['admin', 'uploader', 'agent', 'pr', 'comms']);
respond([
    'status' => 'ok',
    'time' => date('c'),
    'server' => 'php',
    'checkedBy' => $session['username'] ?? '',
]);
