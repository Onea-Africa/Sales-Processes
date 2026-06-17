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
    respond(['error' => 'Enter an Apple product, model or SKU to search ASBIS stock.'], 400);
}

$username = get_env('ASBIS_USERNAME');
$password = get_env('ASBIS_PASSWORD');

if (!$username || !$password) {
    respond([
        'error' => 'ASBIS feed credentials are not configured on the server.',
        'setup' => 'Set ASBIS_USERNAME and ASBIS_PASSWORD in the hosting environment.',
    ], 503);
}

$cacheDir = __DIR__ . '/data';
if (!is_dir($cacheDir)) {
    mkdir($cacheDir, 0755, true);
}

$cacheKey = 'v5|' . strtolower(trim($brand . '|' . $product));
$cacheFile = $cacheDir . '/asbis-products-' . sha1($cacheKey) . '.json';
$cacheTtlSeconds = 15 * 60;

if (file_exists($cacheFile) && (time() - filemtime($cacheFile)) < $cacheTtlSeconds) {
    $cached = json_decode(file_get_contents($cacheFile), true);
    if (is_array($cached)) {
        $cached['cached'] = true;
        respond($cached);
    }
}

function asbis_fetch_xml($endpoint, $username, $password, $cacheDir) {
    $cacheFile = $cacheDir . '/asbis-' . strtolower(preg_replace('/[^a-z0-9]+/i', '-', $endpoint)) . '.xml';
    $cacheTtlSeconds = 15 * 60;

    if (file_exists($cacheFile) && (time() - filemtime($cacheFile)) < $cacheTtlSeconds) {
        return file_get_contents($cacheFile);
    }

    $url = 'https://services.it4profit.com/product/en/739/' . $endpoint . '?USERNAME=' . rawurlencode($username) . '&PASSWORD=' . rawurlencode($password);
    $context = stream_context_create([
        'http' => [
            'method' => 'GET',
            'header' => "Accept: application/xml,text/xml,*/*\r\n",
            'timeout' => 30,
            'ignore_errors' => true,
        ],
    ]);

    $raw = @file_get_contents($url, false, $context);
    if ($raw === false) {
        return false;
    }

    $statusLine = $http_response_header[0] ?? '';
    if ($statusLine && !preg_match('/\s(2\d\d)\s/', $statusLine)) {
        return false;
    }

    file_put_contents($cacheFile, $raw);
    return $raw;
}

function asbis_flatten_node($node, $prefix = '') {
    $row = [];
    foreach ($node->children() as $key => $value) {
        $name = $prefix ? $prefix . '_' . $key : $key;
        if ($value->children()->count() > 0) {
            $row = array_merge($row, asbis_flatten_node($value, $name));
        } else {
            $row[$name] = trim((string) $value);
        }
    }
    foreach ($node->attributes() as $key => $value) {
        $row[$key] = trim((string) $value);
    }
    return $row;
}

function asbis_find_nodes($xml) {
    $queries = [
        '//*[local-name()="Product"]',
        '//*[local-name()="product"]',
        '//*[local-name()="Item"]',
        '//*[local-name()="item"]',
        '//*[local-name()="PRICE"]',
        '//*[local-name()="price"]',
        '//*[local-name()="PriceAvail"]',
        '//*[local-name()="priceavail"]',
    ];

    $rows = [];
    foreach ($queries as $query) {
        $nodes = $xml->xpath($query);
        if (!is_array($nodes)) {
            continue;
        }
        foreach ($nodes as $node) {
            $flat = asbis_flatten_node($node);
            if (count($flat) >= 2) {
                $rows[] = $flat;
            }
        }
    }
    return $rows;
}

function asbis_value($row, $keys, $default = '') {
    $lower = [];
    foreach ($row as $key => $value) {
        $lower[strtolower($key)] = $value;
    }
    foreach ($keys as $key) {
        $lk = strtolower($key);
        if (isset($lower[$lk]) && $lower[$lk] !== '') {
            return $lower[$lk];
        }
    }
    foreach ($lower as $key => $value) {
        foreach ($keys as $needle) {
            if (strpos($key, strtolower($needle)) !== false && $value !== '') {
                return $value;
            }
        }
    }
    return $default;
}

function asbis_number($value) {
    if (is_numeric($value)) {
        return (float) $value;
    }
    $clean = preg_replace('/[^0-9.\-]/', '', (string) $value);
    return is_numeric($clean) ? (float) $clean : 0;
}

function asbis_key($row) {
    return strtolower((string) asbis_value($row, ['wic', 'productcode', 'product_code', 'sku', 'partnumber', 'part_number', 'vendorpartnumber', 'vendor_part_number', 'id']));
}

function asbis_is_accessory($text) {
    $text = strtolower((string) $text);
    $needles = ['case', 'cover', 'adapter', 'cable', 'charger', 'power adapter', 'pencil', 'keyboard', 'mouse', 'trackpad', 'airpods', 'battery', 'strap', 'sleeve', 'protector', 'dock', 'hub'];
    foreach ($needles as $needle) {
        if (strpos($text, $needle) !== false) {
            return true;
        }
    }
    return false;
}

$productXmlRaw = asbis_fetch_xml('ProductList.xml', $username, $password, $cacheDir);
$priceXmlRaw = asbis_fetch_xml('PriceAvail.xml', $username, $password, $cacheDir);

if ($productXmlRaw === false) {
    respond(['error' => 'Could not reach ASBIS ProductList feed.'], 502);
}

libxml_use_internal_errors(true);
$productXml = simplexml_load_string($productXmlRaw);
$priceXml = $priceXmlRaw !== false ? simplexml_load_string($priceXmlRaw) : null;

if (!$productXml) {
    respond(['error' => 'ASBIS ProductList feed returned invalid XML.'], 502);
}

$productRows = asbis_find_nodes($productXml);
$priceRows = $priceXml ? asbis_find_nodes($priceXml) : [];
$productByKey = [];
foreach ($productRows as $row) {
    $key = asbis_key($row);
    if ($key !== '') {
        $productByKey[$key] = $row;
    }
}
$priceByKey = [];
foreach ($priceRows as $row) {
    $key = asbis_key($row);
    if ($key !== '') {
        $priceByKey[$key] = $row;
    }
}

$brandTerm = strtolower(trim($brand));
$productTerm = strtolower(trim($product));
$matches = [];
$searchRows = count($priceRows) > 0 ? $priceRows : $productRows;
foreach ($searchRows as $row) {
    $key = asbis_key($row);
    $catalogRow = $key && isset($productByKey[$key]) ? $productByKey[$key] : [];
    $priceRow = $key && isset($priceByKey[$key]) ? $priceByKey[$key] : [];
    $merged = array_merge($catalogRow, $row, $priceRow);
    $haystack = strtolower(implode(' ', array_values($merged)));
    if ($brandTerm !== '' && strpos($haystack, $brandTerm) === false) {
        continue;
    }
    if ($productTerm !== '' && strpos($haystack, $productTerm) === false) {
        continue;
    }

    $sku = (string) asbis_value($merged, ['wic', 'productcode', 'product_code', 'sku', 'partnumber', 'part_number', 'vendorpartnumber', 'vendor_part_number', 'id'], $key);
    $model = (string) asbis_value($merged, ['model', 'name', 'productname', 'product_name', 'description', 'productdescription', 'product_description', 'shortdescription'], $sku);
    $description = (string) asbis_value($merged, ['description', 'productdescription', 'product_description', 'shortdescription', 'longdescription', 'name', 'productname'], $model);
    $brandName = (string) asbis_value($merged, ['vendor_name', 'vendorname', 'brand', 'vendor', 'manufacturer'], $brand ?: 'Apple');
    $category = (string) asbis_value($merged, ['group_name', 'groupname', 'producttype', 'product_type', 'category', 'group', 'productgroup', 'product_group'], 'Apple Procurement');
    $availabilityRaw = (string) asbis_value($merged, ['avail', 'availability', 'qty', 'quantity', 'stock', 'available', 'totalqtyavailable'], '');
    $stock = asbis_number($availabilityRaw);
    $price = asbis_number(asbis_value($merged, ['my_price', 'myprice', 'dealerprice', 'dealer_price', 'cost', 'price', 'retail_price', 'retailprice', 'rrp'], 0));
    $image = (string) asbis_value($merged, ['small_image', 'smallimage', 'image', 'imageurl', 'image_url', 'picture', 'pictureurl', 'urlimage'], '');
    $stockLabel = $availabilityRaw !== ''
        ? ('ASBIS availability: ' . $availabilityRaw)
        : 'No stock value returned by ASBIS feed';
    $combinedText = trim($description . ' ' . $category . ' ' . $model . ' ' . $sku);
    $isOutOfBox = stripos($combinedText, 'out of box') !== false || stripos($sku, 'OOB-') === 0;
    $isAccessory = asbis_is_accessory($combinedText);

    $matches[] = [
        'id' => 'asbis-live-' . substr(sha1($sku . '|' . $model), 0, 14),
        'supplier' => 'ASBIS',
        'sku' => $sku ?: $model,
        'model' => $model ?: $sku,
        'brand' => $brandName ?: 'Apple',
        'category' => $category ?: 'Apple Procurement',
        'description' => $description ?: 'ASBIS product feed item.',
        'stock' => $stock,
        'stockLabel' => $stockLabel,
        'dealerCost' => $price,
        'imageUrl' => $image,
        'isInStock' => $stock > 0,
        'isOutOfBox' => $isOutOfBox,
        'itemKind' => $isAccessory ? 'accessory' : 'device',
    ];

    if (count($matches) >= 80) {
        break;
    }
}

usort($matches, function ($a, $b) {
    if (($a['isInStock'] ?? false) !== ($b['isInStock'] ?? false)) {
        return ($a['isInStock'] ?? false) ? -1 : 1;
    }
    if (($a['itemKind'] ?? '') !== ($b['itemKind'] ?? '')) {
        return ($a['itemKind'] ?? '') === 'device' ? -1 : 1;
    }
    if (($a['isOutOfBox'] ?? false) !== ($b['isOutOfBox'] ?? false)) {
        return ($a['isOutOfBox'] ?? false) ? 1 : -1;
    }
    return (float) ($b['stock'] ?? 0) <=> (float) ($a['stock'] ?? 0);
});

$matches = array_slice($matches, 0, 40);

$response = [
    'products' => $matches,
    'count' => count($matches),
    'cached' => false,
    'source' => 'ASBIS IT4Profit ProductList and PriceAvail feeds',
    'searched' => [
        'brand' => $brand,
        'product' => $product,
    ],
    'fetchedAt' => date('c'),
];

file_put_contents($cacheFile, json_encode($response, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
respond($response);
