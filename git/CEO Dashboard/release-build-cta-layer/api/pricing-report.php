<?php
require_once __DIR__ . '/_common.php';

if (strtoupper($_SERVER['REQUEST_METHOD'] ?? '') !== 'GET') {
    respond(['error' => 'Method not allowed.'], 405);
}

$session = require_auth(['admin', 'uploader', 'agent', 'pr', 'comms']);
$catalog = load_json_file(__DIR__ . '/data/pricing-rate-card.json');
if (!$catalog) {
    respond(['error' => 'Pricing catalogue is unavailable.'], 503);
}

function pricing_report_record($id, $record) {
    $displayOnceOff = $record['displayOnceOff'] ?? null;
    $floorOnceOff = $record['floorOnceOff'] ?? null;
    $displayMonthly = $record['displayMonthly'] ?? null;
    $floorMonthly = $record['floorMonthly'] ?? null;

    return [
        'id' => $id,
        'availability' => $record['availability'] ?? 'available',
        'displayOnceOff' => $displayOnceOff,
        'floorOnceOff' => $floorOnceOff,
        'onceOffNegotiationRoom' => is_numeric($displayOnceOff) && is_numeric($floorOnceOff)
            ? $displayOnceOff - $floorOnceOff
            : null,
        'displayMonthly' => $displayMonthly,
        'floorMonthly' => $floorMonthly,
        'monthlyNegotiationRoom' => is_numeric($displayMonthly) && is_numeric($floorMonthly)
            ? $displayMonthly - $floorMonthly
            : null,
        'calculation' => $record['calculation'] ?? 'fixed',
        'validUntil' => $record['validUntil'] ?? null,
    ];
}

$builders = [];
$availabilityTotals = [
    'available' => 0,
    'quote_required' => 0,
    'unavailable' => 0,
];

foreach (($catalog['builders'] ?? []) as $builderId => $builder) {
    $base = pricing_report_record('base', $builder['base'] ?? []);
    $availabilityTotals[$base['availability']] = ($availabilityTotals[$base['availability']] ?? 0) + 1;
    $options = [];
    foreach (($builder['options'] ?? []) as $optionId => $record) {
        $option = pricing_report_record($optionId, $record);
        $availabilityTotals[$option['availability']] = ($availabilityTotals[$option['availability']] ?? 0) + 1;
        $options[] = $option;
    }
    $builders[] = [
        'id' => $builderId,
        'source' => $builder['source'] ?? '',
        'basis' => $builder['basis'] ?? '',
        'estimateTolerancePercent' => $builder['estimateTolerancePercent'] ?? null,
        'deliveryRoles' => $builder['deliveryRoles'] ?? [],
        'base' => $base,
        'options' => $options,
    ];
}

$refreshStatus = load_json_file(__DIR__ . '/data/pricing-refresh-status.json');
$supplierConfiguration = [
    'asbis' => (bool) (get_env('ASBIS_USERNAME') && get_env('ASBIS_PASSWORD')),
    'nology' => (bool) (get_env('NOLOGY_USERNAME') && get_env('NOLOGY_SECRET')),
    'microsoft' => (bool) get_env('MICROSOFT_PRICE_FEED_URL'),
    'fortinet' => (bool) get_env('FORTINET_PRICE_FEED_URL'),
    'hosting' => (bool) get_env('HOSTING_PRICE_FEED_URL'),
];

respond([
    'generatedAt' => date('c'),
    'generatedFor' => [
        'username' => $session['username'] ?? '',
        'role' => $session['role'] ?? '',
    ],
    'catalogVersion' => $catalog['version'] ?? '',
    'currency' => $catalog['currency'] ?? 'ZAR',
    'vatRate' => $catalog['vatRate'] ?? 0.15,
    'availabilityTotals' => $availabilityTotals,
    'supplierConfiguration' => $supplierConfiguration,
    'lastRefresh' => $refreshStatus ?: null,
    'marginPolicies' => $catalog['marginPolicies'] ?? [],
    'internalDeliveryModel' => $catalog['internalDeliveryModel'] ?? [],
    'marketResearch' => $catalog['marketResearch'] ?? [],
    'tiers' => array_map(
        function ($id, $record) {
            return pricing_report_record($id, $record);
        },
        array_keys($catalog['tiers'] ?? []),
        array_values($catalog['tiers'] ?? [])
    ),
    'builders' => $builders,
]);
