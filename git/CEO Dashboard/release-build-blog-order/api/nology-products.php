<?php
require_once __DIR__ . '/_common.php';

require_auth(['admin', 'uploader', 'agent', 'pr', 'comms']);

if (!in_array(strtoupper($_SERVER['REQUEST_METHOD'] ?? ''), ['GET', 'POST'], true)) {
    respond(['error' => 'Method not allowed.'], 405);
}

$body = get_json_body();
$brand = sanitize($_GET['brand'] ?? ($body['brand'] ?? ''));
$product = sanitize($_GET['product'] ?? ($body['product'] ?? ''));

if ($brand === '' && $product === '') {
    respond(['error' => 'Enter a brand or product model to search Nology stock.'], 400);
}

$username = get_env('NOLOGY_USERNAME');
$secret = get_env('NOLOGY_SECRET');

if (!$username || !$secret) {
    respond([
        'error' => 'Nology feed credentials are not configured on the server.',
        'setup' => 'Set NOLOGY_USERNAME and NOLOGY_SECRET in the hosting environment.',
    ], 503);
}

$cacheDir = __DIR__ . '/data';
if (!is_dir($cacheDir)) {
    mkdir($cacheDir, 0755, true);
}

$cacheKey = 'v3|' . strtolower(trim($brand . '|' . $product));
$cacheFile = $cacheDir . '/nology-products-' . sha1($cacheKey) . '.json';
$cacheTtlSeconds = 15 * 60;

if (file_exists($cacheFile) && (time() - filemtime($cacheFile)) < $cacheTtlSeconds) {
    $cached = json_decode(file_get_contents($cacheFile), true);
    if (is_array($cached)) {
        $cached['cached'] = true;
        respond($cached);
    }
}

$payload = json_encode([
    'Username' => $username,
    'Secret' => $secret,
    'Brand' => $brand,
    'Product' => $product,
]);

$options = [
    'http' => [
        'method' => 'GET',
        'header' => "Content-Type: application/json\r\nAccept: application/json\r\n",
        'content' => $payload,
        'timeout' => 20,
        'ignore_errors' => true,
    ],
];

$context = stream_context_create($options);
$raw = @file_get_contents('https://erp.nology.co.za/NologyDataFeed/api/Products/View', false, $context);

if ($raw === false) {
    respond(['error' => 'Could not reach Nology product feed.'], 502);
}

$statusLine = $http_response_header[0] ?? '';
if (!preg_match('/\s(2\d\d)\s/', $statusLine)) {
    respond([
        'error' => 'Nology product feed returned an unexpected response.',
        'status' => $statusLine,
    ], 502);
}

$decoded = json_decode($raw, true);
if (!is_array($decoded)) {
    respond(['error' => 'Nology product feed returned invalid JSON.'], 502);
}

function nology_first_available($row, $keys, $default = '') {
    $normalized = [];
    foreach ($row as $rowKey => $value) {
        $normalized[strtolower(preg_replace('/[^a-z0-9]/i', '', (string) $rowKey))] = $value;
    }
    foreach ($keys as $key) {
        if (isset($row[$key]) && $row[$key] !== '') {
            return $row[$key];
        }
        $lookup = strtolower(preg_replace('/[^a-z0-9]/i', '', (string) $key));
        if (isset($normalized[$lookup]) && $normalized[$lookup] !== '') {
            return $normalized[$lookup];
        }
    }
    return $default;
}

function nology_number($value) {
    if (is_array($value)) {
        $total = 0;
        foreach ($value as $item) {
            $total += nology_number($item);
        }
        return $total;
    }
    if (is_numeric($value)) {
        return (float) $value;
    }
    $clean = preg_replace('/[^0-9.\-]/', '', (string) $value);
    return is_numeric($clean) ? (float) $clean : 0;
}

function nology_format_availability($value) {
    if ($value === '' || $value === null) {
        return 'No stock value returned by Nology feed';
    }
    if (!is_array($value)) {
        return 'Nology availability: ' . (string) $value;
    }

    $parts = [];
    foreach ($value as $key => $item) {
        if (is_array($item)) {
            $nested = [];
            foreach ($item as $nestedKey => $nestedValue) {
                if (is_array($nestedValue)) {
                    continue;
                }
                if ($nestedValue !== '' && $nestedValue !== null) {
                    $nested[] = $nestedKey . ': ' . $nestedValue;
                }
            }
            if (!empty($nested)) {
                $parts[] = (is_string($key) ? $key . ' - ' : '') . implode(', ', $nested);
            }
        } elseif ($item !== '' && $item !== null) {
            $parts[] = (is_string($key) ? $key . ': ' : '') . $item;
        }
    }

    if (!empty($parts)) {
        return 'Nology availability: ' . implode(' | ', array_slice($parts, 0, 4));
    }

    $total = nology_number($value);
    return $total > 0 ? ('Nology availability total: ' . $total) : 'No stock value returned by Nology feed';
}

$rows = [];
if (isset($decoded['Products']) && is_array($decoded['Products'])) {
    $rows = $decoded['Products'];
} elseif (isset($decoded['products']) && is_array($decoded['products'])) {
    $rows = $decoded['products'];
} elseif (array_is_list($decoded)) {
    $rows = $decoded;
} elseif (isset($decoded['Model']) || isset($decoded['model'])) {
    $rows = [$decoded];
}

$products = array_map(function ($row) {
    $model = (string) nology_first_available($row, ['Model', 'model', 'Product', 'product']);
    $brand = (string) nology_first_available($row, ['Brand', 'brand']);
    $shortDescription = (string) nology_first_available($row, ['ShortDescription', 'shortDescription', 'Short Description', 'Description', 'description']);
    $longDescription = (string) nology_first_available($row, ['LongDescription', 'longDescription', 'Long Description'], $shortDescription);
    $globalSku = (string) nology_first_available($row, ['GlobalSKU', 'GlobalSku', 'globalSKU', 'globalSku', 'SKU', 'sku'], $model);
    $barcode = (string) nology_first_available($row, ['Barcode', 'barcode']);
    $salesCategories = nology_first_available($row, ['SalesCategories', 'salesCategories', 'Sales Categories'], '');
    $availabilityRaw = nology_first_available($row, [
        'TotalQtyAvailable',
        'totalQtyAvailable',
        'Total Qty Available',
        'QtyAvailable',
        'qtyAvailable',
        'QuantityAvailable',
        'AvailableQuantity',
        'AvailableQty',
        'Available',
        'Stock',
        'stock',
        'TotalStock',
        'Total Stock',
        'OnHand',
        'On Hand',
        'Qty',
        'quantity',
    ], '');
    $totalQty = nology_number($availabilityRaw);
    $price = nology_number(nology_first_available($row, ['Price', 'price'], 0));
    $image = (string) nology_first_available($row, ['Image', 'image']);
    $allImages = (string) nology_first_available($row, ['AllImages', 'allImages', 'AdditionalImages', 'additionalImages']);
    $relatedItems = (string) nology_first_available($row, ['RelatedItems', 'relatedItems']);

    return [
        'id' => 'nology-live-' . substr(sha1($globalSku . '|' . $model), 0, 14),
        'supplier' => 'Nology',
        'sku' => $globalSku ?: $model,
        'model' => $model ?: $globalSku,
        'brand' => $brand ?: 'Nology',
        'category' => $salesCategories ?: 'Networking',
        'description' => $shortDescription ?: $longDescription,
        'longDescription' => $longDescription,
        'stock' => $totalQty,
        'stockLabel' => nology_format_availability($availabilityRaw),
        'dealerCost' => $price,
        'imageUrl' => $image,
        'allImages' => $allImages,
        'barcode' => $barcode,
        'relatedItems' => $relatedItems,
    ];
}, $rows);

$response = [
    'products' => $products,
    'count' => count($products),
    'cached' => false,
    'source' => 'Nology Product Data Feed',
    'searched' => [
        'brand' => $brand,
        'product' => $product,
    ],
    'fetchedAt' => date('c'),
];

file_put_contents($cacheFile, json_encode($response, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
respond($response);
