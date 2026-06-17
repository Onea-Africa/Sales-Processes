<?php
require __DIR__ . '/_common.php';

if (!is_post_request()) {
    respond(['error' => 'Only POST is accepted.'], 405);
}

$input = get_json_body();
enforce_rate_limit('documents-login', 8, 900);
$username = sanitize($input['username'] ?? '');
$password = $input['password'] ?? '';

if (!$username || !$password) {
    respond(['error' => 'Username and password are required.'], 400);
}

$accounts = [
    ['username' => 'Nick',      'displayName' => 'Neo / Nick',      'hash' => '$2y$10$l7ORO7HOHiwVgH.3w7heY.XBveCfHUKikr5sN7yTP/jJJlx8zOD.m', 'role' => 'uploader'],
    ['username' => 'Keneilwe',  'displayName' => 'Joy / Keneilwe',  'hash' => '$2y$10$gKCA3CV1HSg2mXipOAjy6.nAYwM2gALb2dF3abaT8v02O5HbKi1nW', 'role' => 'uploader'],
    ['username' => 'Yolanda',   'displayName' => 'Yolanda',        'hash' => '$2y$10$4rauZi1282hbYWslHK1JfevX4.ht5voBqceN2rgJOUjjhEG6RGfru', 'role' => 'uploader'],
    ['username' => 'OneaAgent','displayName' => 'Onea Agent',     'hash' => '$2y$10$Cnz162Vww7wujWitN6.8EOztzobBWt.KRDimxs0TuR7Yyicoq.O1O', 'role' => 'agent'],
    ['username' => 'Ororiseng','displayName' => 'Ororiseng Morake','hash' => '$2a$12$yj/pX.35ea7T.rHenF/ouu3BnmC/uoPvExP5tBrd9W182AFvE.0WK', 'role' => 'pr'],
];

foreach ($accounts as $account) {
    if (strcasecmp($account['username'], $username) === 0 && password_verify($password, $account['hash'])) {
        $token = create_session($account['username'], $account['displayName'], $account['role']);
        respond([
            'token' => $token,
            'role' => $account['role'],
            'displayName' => $account['displayName'],
        ]);
    }
}

respond(['error' => 'Invalid username or password.'], 401);
