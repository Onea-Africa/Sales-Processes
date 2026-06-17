<?php
require_once __DIR__ . '/_common.php';

if (strtoupper($_SERVER['REQUEST_METHOD'] ?? '') !== 'GET') {
    respond(['error' => 'Method not allowed.'], 405);
}

$query = trim((string) ($_GET['query'] ?? ''));
if ($query === '' || strlen($query) < 2 || strlen($query) > 80) {
    respond(['error' => 'Enter a valid Apple product family or SKU.'], 400);
}

$cacheDir = __DIR__ . '/data';
if (!is_dir($cacheDir)) {
    mkdir($cacheDir, 0750, true);
}
$publicCacheFile = $cacheDir . '/apple-public-prices.json';

$username = get_env('ASBIS_USERNAME');
$password = get_env('ASBIS_PASSWORD');
$rateCard = load_json_file(__DIR__ . '/data/pricing-rate-card.json');
$policy = $rateCard['marginPolicies']['apple'] ?? [];
$displayMargin = (float) ($policy['displayMarginPercent'] ?? 20);
$floorMargin = (float) ($policy['floorMarginPercent'] ?? 10);

function apple_feed_fetch($endpoint, $username, $password, $cacheDir, $allowStale = false) {
    $cacheFile = $cacheDir . '/apple-public-' . strtolower(preg_replace('/[^a-z0-9]+/i', '-', $endpoint)) . '.xml';
    $ttl = 15 * 60;
    if (is_file($cacheFile)) {
        if ((time() - filemtime($cacheFile)) < $ttl) {
            return file_get_contents($cacheFile);
        }
        if ($allowStale) {
            return file_get_contents($cacheFile);
        }
    }
    if (!$username || !$password) {
        return false;
    }
    $url = 'https://services.it4profit.com/product/en/739/' . $endpoint
        . '?USERNAME=' . rawurlencode($username)
        . '&PASSWORD=' . rawurlencode($password);
    $raw = false;
    $status = '';

    if (function_exists('curl_init')) {
        $curl = curl_init($url);
        if ($curl !== false) {
            curl_setopt_array($curl, [
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_FOLLOWLOCATION => true,
                CURLOPT_CONNECTTIMEOUT => 20,
                CURLOPT_TIMEOUT => 45,
                CURLOPT_HTTPHEADER => ['Accept: application/xml,text/xml,*/*'],
                CURLOPT_SSL_VERIFYPEER => true,
                CURLOPT_SSL_VERIFYHOST => 2,
                CURLOPT_USERAGENT => 'OneaApplePricing/1.0',
            ]);
            $curlRaw = curl_exec($curl);
            $curlCode = (int) curl_getinfo($curl, CURLINFO_RESPONSE_CODE);
            if ($curlRaw !== false && $curlCode >= 200 && $curlCode < 300) {
                $raw = $curlRaw;
                $status = 'HTTP/1.1 ' . $curlCode;
            }
            curl_close($curl);
        }
    }

    if ($raw === false) {
        $context = stream_context_create([
            'http' => [
                'method' => 'GET',
                'header' => "Accept: application/xml,text/xml,*/*\r\n",
                'timeout' => 30,
                'ignore_errors' => true,
            ],
            'ssl' => [
                'verify_peer' => true,
                'verify_peer_name' => true,
            ],
        ]);
        $streamRaw = @file_get_contents($url, false, $context);
        $streamStatus = $http_response_header[0] ?? '';
        if ($streamRaw !== false && (!$streamStatus || preg_match('/\s2\d\d\s/', $streamStatus))) {
            $raw = $streamRaw;
            $status = $streamStatus;
        }
    }

    if ($raw === false || ($status && !preg_match('/\s2\d\d\s?/', $status))) {
        if ($allowStale && is_file($cacheFile)) {
            return file_get_contents($cacheFile);
        }
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

function apple_normalize_search($value) {
    return strtolower(preg_replace('/[^a-z0-9]+/i', '', (string) $value));
}

function apple_sort_matches(&$matches) {
    usort($matches, function ($a, $b) {
        if (($a['stockStatus'] ?? '') !== ($b['stockStatus'] ?? '')) {
            return ($a['stockStatus'] ?? '') === 'in_stock' ? -1 : 1;
        }
        return ($a['displayPrice'] ?? 0) <=> ($b['displayPrice'] ?? 0);
    });
}

function apple_is_accessory_text($value) {
    $text = strtolower((string) $value);
    foreach ([
        'accessor', 'case', 'cover', 'adapter', 'cable', 'charger',
        'keyboard', 'mouse', 'trackpad', 'pencil', 'airpods', 'earpods',
        'band', 'watch', 'hub', 'dock', 'sleeve', 'tips', 'protector',
    ] as $needle) {
        if (strpos($text, $needle) !== false) {
            return true;
        }
    }
    return false;
}

function apple_is_device_family_query($query) {
    return in_array(apple_normalize_search($query), [
        'macbookair',
        'macbookpro',
        'macmini',
        'macstudio',
        'imac',
        'ipad',
        'iphone',
    ], true);
}

function apple_match_rank($sku, $model, $description, $query) {
    $queryText = strtolower(trim((string) $query));
    $queryKey = apple_normalize_search($query);
    $skuKey = apple_normalize_search($sku);
    $modelText = strtolower(trim((string) $model));
    $modelKey = apple_normalize_search($model);
    $descriptionText = strtolower(trim((string) $description));
    $descriptionKey = apple_normalize_search($description);
    $fullText = trim($sku . ' ' . $model . ' ' . $description);
    $score = 0;

    if ($queryKey !== '' && $skuKey === $queryKey) {
        $score += 1000;
    }
    if ($queryKey !== '' && $modelKey === $queryKey) {
        $score += 450;
    } elseif ($queryKey !== '' && strpos($modelKey, $queryKey) === 0) {
        $score += 320;
    } elseif ($queryText !== '' && strpos($modelText, $queryText) !== false) {
        $score += 220;
    }
    if ($queryKey !== '' && strpos($descriptionKey, $queryKey) === 0) {
        $score += 260;
    } elseif ($queryText !== '' && strpos($descriptionText, $queryText) !== false) {
        $score += 180;
    }
    if ($queryText !== '' && strpos(strtolower($fullText), $queryText) !== false) {
        $score += 80;
    }

    if (apple_is_device_family_query($query) && apple_is_accessory_text($model . ' ' . $description)) {
        $score -= 260;
    }

    return $score;
}

function apple_cached_matches($products, $query) {
    if (!is_array($products) || !count($products)) {
        return [];
    }
    $queryText = strtolower(trim($query));
    $queryKey = apple_normalize_search($query);
    $matches = [];
    foreach ($products as $product) {
        $sku = (string) ($product['sku'] ?? '');
        $model = (string) ($product['model'] ?? '');
        $description = (string) ($product['description'] ?? '');
        $text = strtolower(trim($sku . ' ' . $model . ' ' . $description));
        $skuKey = apple_normalize_search($sku);
        if ($queryKey !== '' && $skuKey !== '' && $queryKey === $skuKey) {
            $product['_matchRank'] = apple_match_rank($sku, $model, $description, $query);
            $matches[] = $product;
            continue;
        }
        if ($queryText !== '' && strpos($text, $queryText) !== false) {
            $product['_matchRank'] = apple_match_rank($sku, $model, $description, $query);
            $matches[] = $product;
            continue;
        }
        if ($queryKey !== '' && strpos(apple_normalize_search($text), $queryKey) !== false) {
            $product['_matchRank'] = apple_match_rank($sku, $model, $description, $query);
            $matches[] = $product;
        }
    }
    usort($matches, function ($a, $b) {
        $rank = ((int) ($b['_matchRank'] ?? 0)) <=> ((int) ($a['_matchRank'] ?? 0));
        if ($rank !== 0) {
            return $rank;
        }
        if (($a['stockStatus'] ?? '') !== ($b['stockStatus'] ?? '')) {
            return ($a['stockStatus'] ?? '') === 'in_stock' ? -1 : 1;
        }
        return ($a['displayPrice'] ?? 0) <=> ($b['displayPrice'] ?? 0);
    });
    $matches = array_map(function ($product) {
        unset($product['_matchRank']);
        return $product;
    }, $matches);
    return array_slice(array_values($matches), 0, 40);
}

function apple_cache_is_recent($timestamp, $maxAgeSeconds = 21600) {
    $unix = strtotime((string) $timestamp);
    return $unix !== false && $unix >= (time() - $maxAgeSeconds);
}

function apple_cached_response($query, $products, $updatedAt, $stale = false) {
    respond([
        'query' => $query,
        'products' => array_values($products),
        'count' => count($products),
        'availability' => count($products) ? 'available' : 'quote_required',
        'cached' => true,
        'stale' => (bool) $stale,
        'fetchedAt' => $updatedAt ?: date('c'),
    ]);
}

$cachedResponse = load_json_file($publicCacheFile);
$cachedProducts = $cachedResponse['products'] ?? [];
$cachedMatches = apple_cached_matches($cachedProducts, $query);
$cachedUpdatedAt = (string) ($cachedResponse['updatedAt'] ?? '');
$hasRecentCache = apple_cache_is_recent($cachedUpdatedAt);

if ($hasRecentCache && count($cachedMatches)) {
    apple_cached_response($query, $cachedMatches, $cachedUpdatedAt, false);
}

$allowStaleFeedCache = !$username || !$password;
$productRaw = apple_feed_fetch('ProductList.xml', $username, $password, $cacheDir, $allowStaleFeedCache);
$priceRaw = apple_feed_fetch('PriceAvail.xml', $username, $password, $cacheDir, $allowStaleFeedCache);
if ($productRaw === false || $priceRaw === false) {
    if (count($cachedMatches)) {
        apple_cached_response($query, $cachedMatches, $cachedUpdatedAt, true);
    }
    error_log('[onea-apple] supplier refresh failed for query=' . $query . ' cache_matches=' . count($cachedMatches));
    respond([
        'error' => 'Current Apple pricing is temporarily unavailable.',
        'availability' => 'quote_required',
    ], 502);
}

libxml_use_internal_errors(true);
$productXml = simplexml_load_string($productRaw);
$priceXml = simplexml_load_string($priceRaw);
if (!$productXml || !$priceXml) {
    error_log('[onea-apple] invalid supplier feed for query=' . $query);
    respond(['error' => 'Current Apple pricing is temporarily unavailable.', 'availability' => 'quote_required'], 502);
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
        '_matchRank' => apple_match_rank($sku, $model, $description, $query),
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
}

usort($matches, function ($a, $b) {
    $rank = ((int) ($b['_matchRank'] ?? 0)) <=> ((int) ($a['_matchRank'] ?? 0));
    if ($rank !== 0) {
        return $rank;
    }
    if (($a['stockStatus'] ?? '') !== ($b['stockStatus'] ?? '')) {
        return ($a['stockStatus'] ?? '') === 'in_stock' ? -1 : 1;
    }
    return ($a['displayPrice'] ?? 0) <=> ($b['displayPrice'] ?? 0);
});
$matches = array_map(function ($product) {
    unset($product['_matchRank']);
    return $product;
}, array_slice($matches, 0, 40));

if (count($matches)) {
    update_json_file($publicCacheFile, function ($current) use ($matches) {
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
} elseif (count($cachedMatches)) {
    apple_cached_response($query, $cachedMatches, $cachedUpdatedAt, true);
}

respond([
    'query' => $query,
    'products' => $matches,
    'count' => count($matches),
    'availability' => count($matches) ? 'available' : 'quote_required',
    'fetchedAt' => date('c'),
    'internal' => (bool) $internal,
]);
