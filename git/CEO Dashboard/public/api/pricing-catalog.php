<?php
require_once __DIR__ . '/_common.php';

if (strtoupper($_SERVER['REQUEST_METHOD'] ?? '') !== 'GET') {
    respond(['error' => 'Method not allowed.'], 405);
}

$path = __DIR__ . '/data/pricing-rate-card.json';
$catalog = load_json_file($path);
if (!$catalog) {
    respond(['error' => 'Pricing catalogue is unavailable.'], 503);
}

$token = get_bearer_token();
$session = $token ? validate_token($token) : null;
$internalRoles = ['admin', 'uploader', 'agent', 'pr', 'comms'];
$internal = $session && in_array($session['role'] ?? '', $internalRoles, true);

function public_price_record($record) {
    $public = [];
    $availability = $record['availability'] ?? 'available';
    $public['availability'] = $availability;
    if ($availability !== 'available') {
        foreach (['label', 'source', 'validUntil'] as $key) {
            if (array_key_exists($key, $record)) {
                $public[$key] = $record[$key];
            }
        }
        return $public;
    }
    foreach (['label', 'displayOnceOff', 'displayMonthly', 'source', 'availability', 'validUntil'] as $key) {
        if (array_key_exists($key, $record)) {
            $public[$key] = $record[$key];
        }
    }
    return $public;
}

if (!$internal) {
    $publicTiers = [];
    foreach (($catalog['tiers'] ?? []) as $id => $record) {
        $publicTiers[$id] = public_price_record($record);
    }
    $publicBuilders = [];
    foreach (($catalog['builders'] ?? []) as $builderId => $builder) {
        $options = [];
        foreach (($builder['options'] ?? []) as $optionId => $record) {
            $options[$optionId] = public_price_record($record);
        }
        $publicBuilders[$builderId] = [
            'source' => $builder['source'] ?? '',
            'basis' => $builder['basis'] ?? '',
            'estimateTolerancePercent' => $builder['estimateTolerancePercent'] ?? null,
            'base' => public_price_record($builder['base'] ?? []),
            'options' => $options,
        ];
    }
    respond([
        'version' => $catalog['version'] ?? '',
        'currency' => $catalog['currency'] ?? 'ZAR',
        'vatRate' => $catalog['vatRate'] ?? 0.15,
        'tiers' => $publicTiers,
        'builders' => $publicBuilders,
        'internal' => false,
    ]);
}

respond(array_merge($catalog, [
    'internal' => true,
    'role' => $session['role'],
]));
