<?php
require_once __DIR__ . '/_common.php';

if (!is_post_request()) {
    respond(['error' => 'Method not allowed.'], 405);
}

enforce_rate_limit('travel-estimate', 12, 900);
$input = get_json_body();
$address = trim((string) ($input['address'] ?? ''));
$latitude = filter_var($input['latitude'] ?? null, FILTER_VALIDATE_FLOAT);
$longitude = filter_var($input['longitude'] ?? null, FILTER_VALIDATE_FLOAT);

if ($address === '' && ($latitude === false || $longitude === false)) {
    respond(['error' => 'Enter a full destination address or use your current GPS location.'], 422);
}

function travel_http_json($url) {
    $headers = [
        'Accept: application/json',
        'User-Agent: OneaAfricaTravelEstimator/1.0 (https://onea.africa; connect@onea.co.za)',
    ];
    if (function_exists('curl_init')) {
        $curl = curl_init($url);
        curl_setopt_array($curl, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_CONNECTTIMEOUT => 5,
            CURLOPT_TIMEOUT => 12,
            CURLOPT_HTTPHEADER => $headers,
        ]);
        $raw = curl_exec($curl);
        $status = (int) curl_getinfo($curl, CURLINFO_HTTP_CODE);
        curl_close($curl);
        if ($raw === false || $status < 200 || $status >= 300) {
            return null;
        }
    } else {
        $context = stream_context_create([
            'http' => [
                'method' => 'GET',
                'header' => implode("\r\n", $headers) . "\r\n",
                'timeout' => 12,
                'ignore_errors' => true,
            ],
        ]);
        $raw = @file_get_contents($url, false, $context);
        if ($raw === false) {
            return null;
        }
    }
    $decoded = json_decode($raw, true);
    return is_array($decoded) ? $decoded : null;
}

function haversine_km($lat1, $lon1, $lat2, $lon2) {
    $earthRadius = 6371;
    $latDelta = deg2rad($lat2 - $lat1);
    $lonDelta = deg2rad($lon2 - $lon1);
    $a = sin($latDelta / 2) ** 2
        + cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * sin($lonDelta / 2) ** 2;
    return $earthRadius * 2 * atan2(sqrt($a), sqrt(1 - $a));
}

if ($latitude === false || $longitude === false) {
    $query = rawurlencode($address . ', South Africa');
    $geocoded = travel_http_json("https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&countrycodes=za&q={$query}");
    if (!$geocoded || empty($geocoded[0]['lat']) || empty($geocoded[0]['lon'])) {
        respond(['error' => 'We could not find that destination. Add the suburb, city and province, or use GPS.'], 422);
    }
    $latitude = (float) $geocoded[0]['lat'];
    $longitude = (float) $geocoded[0]['lon'];
    $destinationLabel = (string) ($geocoded[0]['display_name'] ?? $address);
} else {
    $latitude = (float) $latitude;
    $longitude = (float) $longitude;
    $destinationLabel = $address !== '' ? $address : number_format($latitude, 6) . ', ' . number_format($longitude, 6);
}

if ($latitude < -35 || $latitude > -22 || $longitude < 16 || $longitude > 33) {
    respond(['error' => 'This estimator currently supports destinations within South Africa.'], 422);
}

$originLatitude = -25.7479;
$originLongitude = 28.2293;
$routeUrl = sprintf(
    'https://router.project-osrm.org/route/v1/driving/%F,%F;%F,%F?overview=false&alternatives=false&steps=false',
    $originLongitude,
    $originLatitude,
    $longitude,
    $latitude
);
$route = travel_http_json($routeUrl);
$calculationMethod = 'live_driving_route';
$oneWayKm = 0;

if ($route && ($route['code'] ?? '') === 'Ok' && !empty($route['routes'][0]['distance'])) {
    $oneWayKm = (float) $route['routes'][0]['distance'] / 1000;
} else {
    $oneWayKm = haversine_km($originLatitude, $originLongitude, $latitude, $longitude) * 1.2;
    $calculationMethod = 'estimated_road_distance';
}

$oneWayKm = round($oneWayKm, 1);
if ($oneWayKm < 100) {
    respond([
        'error' => 'This destination is approximately ' . number_format($oneWayKm, 1) . 'km from Pretoria. Select the matching standard call-out zone instead.',
        'distanceKm' => $oneWayKm,
    ], 422);
}

$includedOneWayKm = 100;
$sarsRatePerKm = 4.95;
$baseCallout = 2250;
$excessRoundTripKm = round(max(0, $oneWayKm - $includedOneWayKm) * 2, 1);
$travelFee = (int) ceil(($baseCallout + ($excessRoundTripKm * $sarsRatePerKm)) / 10) * 10;

respond([
    'destination' => $destinationLabel,
    'latitude' => round($latitude, 6),
    'longitude' => round($longitude, 6),
    'oneWayKm' => $oneWayKm,
    'roundTripKm' => round($oneWayKm * 2, 1),
    'includedOneWayKm' => $includedOneWayKm,
    'excessRoundTripKm' => $excessRoundTripKm,
    'ratePerKm' => $sarsRatePerKm,
    'baseCallout' => $baseCallout,
    'travelFee' => $travelFee,
    'method' => $calculationMethod,
    'rateEffectiveDate' => '2026-03-01',
    'accommodationIncluded' => false,
]);
