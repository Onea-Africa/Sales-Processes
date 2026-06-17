<?php
require_once __DIR__ . '/_common.php';

if (strtoupper($_SERVER['REQUEST_METHOD'] ?? '') !== 'GET') {
    respond(['error' => 'Method not allowed.'], 405);
}

$query = trim((string) ($_GET['query'] ?? ''));
if ($query === '' || strlen($query) < 2 || strlen($query) > 80) {
    respond(['error' => 'Enter a valid Apple product family or SKU.'], 400);
}

$username = get_env('ASBIS_USERNAME');
$password = get_env('ASBIS_PASSWORD');
if (!$username || !$password) {
    $cachedResponseFile = __DIR__ . '/data/apple-public-prices.json';
    $cachedResponse = load_json_file($cachedResponseFile);
    $cachedProducts = $cachedResponse['products'] ?? [];
    if (is_array($cachedProducts) && count($cachedProducts)) {
        respond([
            'query' => $query,
            'products' => array_values(array_filter($cachedProducts, function ($product) use ($query) {
                $text = strtolower(($product['model'] ?? '') . ' ' . ($product['description'] ?? '') . ' ' . ($product['sku'] ?? ''));
                return strpos($text, strtolower($query)) !== false;
            })),
            'availability' => 'available',
            'cached' => true,
        ]);
    }
    respond([
        'error' => 'Current Apple pricing is temporarily unavailable.',
        'availability' => 'quote_required',
    ], 503);
}

$rateCard = load_json_file(__DIR__ . '/data/pricing-rate-card.json');
$policy = $rateCard['marginPolicies']['apple'] ?? [];
$displayMargin = (float) ($policy['displayMarginPercent'] ?? 20);
$floorMargin = (float) ($policy['floorMarginPercent'] ?? 10);

$cacheDir = __DIR__ . '/data';
if (!is_dir($cacheDir)) {
    mkdir($cacheDir, 0750, true);
}

function apple_feed_fetch($endpoint, $username, $password, $cacheDir) {
    $cacheFile = $cacheDir . '/apple-public-' . strtolower(preg_replace('/[^a-z0-9]+/i', '-', $endpoint)) . '.xml';
    $ttl = 15 * 60;
    if (is_file($cacheFile) && (time() - filemtime($cacheFile)) < $ttl) {
        return file_get_contents($cacheFile);
    }
    $url = 'https://services.it4profit.com/product/en/739/' . $endpoint
        . '?USERNAME=' . rawurlencode($username)
        . '&PASSWORD=' . rawurlencode($password);
    $context = stream_context_create([
        'http' => [
            'method' => 'GET',
            'header' => "Accept: application/xml,text/xml,*/*\r\n",
            'timeout' => 30,
            'ignore_errors' => true,
        ],
    ]);
    $raw = @file_get_contents($url, false, $context);
    $status = $http_response_header[0] ?? '';
    if ($raw === false || ($status && !preg_match('/\s2\d\d\s/', $status))) {
        return false;
    }
    file_put_contents($cacheFile, $raw, LOCK_EX);
    @chmod($cacheFile, 0640);
    return $raw;
}

function apple_feed_flatten($node, $prefix = '') {
    $row = [];
    foreach ($node->children() as $key => $value) {
        $name = $prefix ? $prefix . '_' . $key : $key;
        if ($value->children()->count() > 0) {
            $row = array_merge($row, apple_feed_flatten($value, $name));
        } else {
            $row[$name] = trim((string) $value);
        }
    }
    foreach ($node->attributes() as $key => $value) {
        $row[$key] = trim((string) $value);
    }
    return $row;
}

function apple_feed_rows($xml) {
    $rows = [];
    foreach (['Product', 'product', 'Item', 'item', 'PRICE', 'price', 'PriceAvail', 'priceavail'] as $name) {
        $nodes = $xml->xpath('//*[local-name()="' . $name . '"]');
        if (!is_array($nodes)) {
            continue;
        }
        foreach ($nodes as $node) {
            $row = apple_feed_flatten($node);
            if (count($row) >= 2) {
                $rows[] = $row;
            }
        }
    }
    return $rows;
}

function apple_feed_value($row, $keys, $default = '') {
    $normalized = [];
    foreach ($row as $key => $value) {
        $normalized[strtolower(preg_replace('/[^a-z0-9]/i', '', (string) $key))] = $value;
    }
    foreach ($keys as $key) {
        $lookup = strtolower(preg_replace('/[^a-z0-9]/i', '', (string) $key));
        if (isset($normalized[$lookup]) && $normalized[$lookup] !== '') {
            return $normalized[$lookup];
        }
    }
    foreach ($normalized as $key => $value) {
        foreach ($keys as $needle) {
            $lookup = strtolower(preg_replace('/[^a-z0-9]/i', '', (string) $needle));
            if ($lookup !== '' && strpos($key, $lookup) !== false && $value !== '') {
                return $value;
            }
        }
    }
    return $default;
}

function apple_feed_number($value) {
    if (is_numeric($value)) {
        return (float) $value;
    }
    $clean = preg_replace('/[^0-9.\-]/', '', (string) $value);
    return is_numeric($clean) ? (float) $clean : 0;
}

function apple_feed_key($row) {
    return strtolower((string) apple_feed_value($row, [
        'wic', 'productcode', 'sku', 'partnumber', 'vendorpartnumber', 'id',
    ]));
}

$productRaw = apple_feed_fetch('ProductList.xml', $username, $password, $cacheDir);
$priceRaw = apple_feed_fetch('PriceAvail.xml', $username, $password, $cacheDir);
if ($productRaw === false || $priceRaw === false) {
    respond([
        'error' => 'ASBIS pricing could not be refreshed.',
        'availability' => 'quote_required',
    ], 502);
}

libxml_use_internal_errors(true);
$productXml = simplexml_load_string($productRaw);
$priceXml = simplexml_load_string($priceRaw);
if (!$productXml || !$priceXml) {
    respond(['error' => 'ASBIS returned an invalid pricing feed.', 'availability' => 'quote_required'], 502);
}

$productsByKey = [];
foreach (apple_feed_rows($productXml) as $row) {
    $key = apple_feed_key($row);
    if ($key !== '') {
        $productsByKey[$key] = $row;
    }
}

$priceRows = apple_feed_rows($priceXml);
$queryLower = strtolower($query);
$matches = [];
$token = get_bearer_token();
$session = $token ? validate_token($token) : null;
$internal = $session && in_array($session['role'] ?? '', ['admin', 'uploader', 'agent', 'pr', 'comms'], true);

foreach ($priceRows as $priceRow) {
    $key = apple_feed_key($priceRow);
    $productRow = $key !== '' && isset($productsByKey[$key]) ? $productsByKey[$key] : [];
    $merged = array_merge($productRow, $priceRow);
    $haystack = strtolower(implode(' ', array_map('strval', array_values($merged))));
    if (strpos($haystack, 'apple') === false || strpos($haystack, $queryLower) === false) {
        continue;
    }
    $recommendedSellingPrice = apple_feed_number(apple_feed_value($merged, [
        'recommended_selling_price', 'recommendedsellingprice',
        'recommended_retail_price', 'recommendedretailprice',
        'recommended_end_user_price', 'recommendedenduserprice',
        'end_user_price', 'enduserprice',
        'retail_price', 'retailprice', 'rrp', 'srp', 'msrp',
    ], 0));
    $dealerCost = apple_feed_number(apple_feed_value($merged, [
        'my_price', 'myprice', 'dealerprice', 'cost', 'price',
    ], 0));
    $displayPrice = $recommendedSellingPrice > 0
        ? $recommendedSellingPrice
        : ($dealerCost > 0 ? round($dealerCost * (1 + $displayMargin / 100)) : 0);
    if ($displayPrice <= 0) {
        continue;
    }
    $sku = (string) apple_feed_value($merged, ['wic', 'productcode', 'sku', 'partnumber', 'vendorpartnumber', 'id'], $key);
    $model = (string) apple_feed_value($merged, ['model', 'name', 'productname', 'description', 'shortdescription'], $sku);
    $description = (string) apple_feed_value($merged, ['description', 'productdescription', 'longdescription', 'name'], $model);
    $stockRaw = apple_feed_value($merged, ['avail', 'availability', 'qty', 'quantity', 'stock', 'available'], '');
    $stock = apple_feed_number($stockRaw);
    $record = [
        'sku' => $sku,
        'model' => $model,
        'description' => $description,
        'displayPrice' => round($displayPrice),
        'stockStatus' => $stock > 0 ? 'in_stock' : 'confirm_stock',
        'availability' => 'available',
        'fetchedAt' => date('c'),
    ];
    if ($internal) {
        $record['supplierCost'] = $dealerCost;
        $record['recommendedSellingPrice'] = $recommendedSellingPrice ?: null;
        $record['floorPrice'] = round($dealerCost * (1 + $floorMargin / 100));
        $record['displayMarginPercent'] = $displayMargin;
        $record['floorMarginPercent'] = $floorMargin;
        $record['priceBasis'] = $recommendedSellingPrice > 0 ? 'recommended_selling_price' : 'onea_margin_fallback';
        $record['source'] = 'ASBIS IT4Profit PriceAvail';
    }
    $matches[] = $record;
    if (count($matches) >= 40) {
        break;
    }
}

usort($matches, function ($a, $b) {
    if (($a['stockStatus'] ?? '') !== ($b['stockStatus'] ?? '')) {
        return ($a['stockStatus'] ?? '') === 'in_stock' ? -1 : 1;
    }
    return ($a['displayPrice'] ?? 0) <=> ($b['displayPrice'] ?? 0);
});

if (count($matches)) {
    update_json_file(__DIR__ . '/data/apple-public-prices.json', function ($current) use ($matches) {
        $productsBySku = [];
        foreach (($current['products'] ?? []) as $product) {
            if (!empty($product['sku'])) {
                $productsBySku[$product['sku']] = $product;
            }
        }
        foreach ($matches as $product) {
            $publicProduct = $product;
            foreach ([
                'supplierCost',
                'recommendedSellingPrice',
                'floorPrice',
                'displayMarginPercent',
                'floorMarginPercent',
                'priceBasis',
                'source',
            ] as $privateKey) {
                unset($publicProduct[$privateKey]);
            }
            if (!empty($publicProduct['sku'])) {
                $productsBySku[$publicProduct['sku']] = $publicProduct;
            }
        }
        return [
            'updatedAt' => date('c'),
            'products' => array_values($productsBySku),
        ];
    });
}

respond([
    'query' => $query,
    'products' => $matches,
    'count' => count($matches),
    'availability' => count($matches) ? 'available' : 'quote_required',
    'fetchedAt' => date('c'),
    'internal' => (bool) $internal,
]);
