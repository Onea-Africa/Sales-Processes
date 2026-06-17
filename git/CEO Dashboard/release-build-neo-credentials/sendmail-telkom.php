<?php
ini_set('display_errors', '0');
ini_set('log_errors', '1');
ini_set('error_log', __DIR__ . '/PHP_errors.log');
error_reporting(E_ALL);

function onea_telkom_fatal_json(): void {
    $error = error_get_last();
    if (!$error) {
        return;
    }

    $fatalTypes = [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR, E_USER_ERROR, E_RECOVERABLE_ERROR];
    if (!in_array($error['type'], $fatalTypes, true)) {
        return;
    }

    $logFile = __DIR__ . '/telkom_errors.log';
    $entry = json_encode([
        'timestamp' => date('Y-m-d H:i:s'),
        'message' => 'Fatal PHP error',
        'context' => $error,
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    @file_put_contents($logFile, $entry . "\n", FILE_APPEND);

    if (!headers_sent()) {
        http_response_code(500);
        header('Content-Type: application/json; charset=UTF-8');
    }

    $hasOutput = ob_get_length();
    while (ob_get_level() > 0) {
        @ob_end_clean();
    }

    if (!$hasOutput) {
        echo json_encode([
            'error' => 'Server error while processing Telkom application.',
            'detail' => $error['message'] ?? 'Fatal PHP error',
        ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    }
}

ob_start();
register_shutdown_function('onea_telkom_fatal_json');

header('Access-Control-Allow-Origin: https://onea.africa');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=UTF-8');

if (strtoupper($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(200);
    exit;
}
/**
 * Telkom Consumer Application Form Processor
 *
 * Production-ready backend script for processing Telkom application forms
 * with FPDF/FPDI overlay of form data on a 3-page PDF template.
 *
 * - Validates all 3 signature streams (Base64 data URLs)
 * - Maps form fields to absolute coordinates
 * - Overlays "." placeholder values for empty fields
 * - Sends compiled PDF to sikhitn1@telkom.co.za with proper headers
 * - Logs to Google Sheets (ISP_TRACKING) and sends WhatsApp notifications
 */

$commonPath = __DIR__ . '/api/_common.php';
if (file_exists($commonPath)) {
    require $commonPath;
} else {
    function respond($payload, $status = 200) {
        http_response_code($status);
        echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }
    function is_post_request() {
        return strtoupper($_SERVER['REQUEST_METHOD'] ?? '') === 'POST';
    }
    function get_env($key, $default = '') {
        $value = getenv($key);
        return $value !== false ? $value : $default;
    }
    function sanitize($value) {
        if (is_array($value)) {
            return array_map('sanitize', $value);
        }
        return trim(htmlspecialchars((string) $value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8'));
    }
    function append_to_sheet($values, $sheetName = 'Web Enquiries') {
        return false;
    }
}

if (!is_post_request()) {
    respond(['error' => 'Only POST requests are accepted.'], 405);
}

$form = $_POST;
$raw = file_get_contents('php://input');
if (!$form && $raw) {
    $json = json_decode($raw, true);
    if (is_array($json)) {
        $form = array_merge($form, $json);
    } else {
        respond(['error' => 'Malformed or missing payload JSON structure.'], 400);
    }
}

if (function_exists('protect_public_submission')) {
    protect_public_submission($form, 'telkom-sendmail', 4, 1800);
}

function get_field(array $keys, string $default = ''): string {
    global $form;
    foreach ($keys as $key) {
        if (isset($form[$key]) && $form[$key] !== '') {
            return trim(sanitize((string)$form[$key]));
        }
    }
    return $default;
}

function placeholder(string $value = ''): string {
    $value = trim($value);
    return $value === '' ? '.' : $value;
}

function join_clean_parts(array $parts): string {
    $clean = [];
    foreach ($parts as $part) {
        $part = trim((string) $part);
        if ($part !== '' && $part !== '.') {
            $clean[] = $part;
        }
    }
    return !empty($clean) ? implode(', ', $clean) : '.';
}

function display_value(string $value = ''): string {
    $value = trim($value);
    return $value === '.' ? '' : $value;
}

function money_value(string $value = ''): string {
    $value = display_value($value);
    return $value === '' ? '' : 'R ' . $value;
}

function package_speed(string $package): string {
    if (preg_match('/(\d+(?:\.\d+)?\s*(?:\/\s*\d+(?:\.\d+)?)?\s*(?:Mbps|GB|TB))/i', $package, $matches)) {
        return trim(preg_replace('/\s+/', ' ', $matches[1]) ?? $matches[1]);
    }
    return '';
}

function yes_no(string $value = ''): string {
    $value = strtoupper(trim($value));
    if ($value === 'Y' || $value === 'YES') {
        return 'Y';
    }
    if ($value === 'N' || $value === 'NO') {
        return 'N';
    }
    return '.';
}

function decode_signature(string $data): ?string {
    $data = trim($data);
    if (preg_match('/^data:(image\/png|image\/jpeg);base64,(.+)$/i', $data, $matches)) {
        $decoded = base64_decode($matches[2], true);
        return $decoded !== false ? $decoded : null;
    }
    $decoded = base64_decode($data, true);
    return $decoded !== false ? $decoded : null;
}

function get_uploads_dir(): string {
    $docRoot = rtrim($_SERVER['DOCUMENT_ROOT'] ?? '', '/\\');
    $uploadsDir = '';

    if ($docRoot !== '') {
        $uploadsDir = $docRoot . '/uploads';
    }

    if ($uploadsDir === '') {
        $uploadsDir = rtrim(__DIR__, '/\\') . '/uploads';
    }

    if (!is_dir($uploadsDir)) {
        mkdir($uploadsDir, 0755, true);
    }

    return $uploadsDir;
}

function detect_signature_extension(string $decoded): string {
    if (strncmp($decoded, "\x89PNG\x0d\x0a\x1a\x0a", 8) === 0) {
        return 'png';
    }
    if (strncmp($decoded, "\xFF\xD8\xFF", 3) === 0) {
        return 'jpg';
    }
    return '';
}

function write_signature_image(string $data, string $uploadsDir, string $prefix = 'sig'): ?string {
    if (!is_dir($uploadsDir)) {
        mkdir($uploadsDir, 0755, true);
    }

    $decoded = decode_signature($data);
    if (!$decoded) {
        return null;
    }
    $maxBytes = max(1024, (int) get_env('MAX_SIGNATURE_BYTES', '2097152'));
    if (strlen($decoded) > $maxBytes) {
        return null;
    }

    $extension = detect_signature_extension($decoded);
    if ($extension === '') {
        return null;
    }
    $directPath = $uploadsDir . '/' . $prefix . '_' . uniqid('', true) . '.' . $extension;
    if (file_put_contents($directPath, $decoded, LOCK_EX) !== false && file_exists($directPath)) {
        return $directPath;
    }

    if (!function_exists('imagecreatefromstring') || !function_exists('imagejpeg')) {
        return null;
    }

    $signatureImage = @imagecreatefromstring($decoded);
    if ($signatureImage === false) {
        return null;
    }
    $width = imagesx($signatureImage);
    $height = imagesy($signatureImage);
    $canvas = imagecreatetruecolor($width, $height);
    if ($canvas === false) {
        imagedestroy($signatureImage);
        return null;
    }

    imagealphablending($canvas, true);
    imagesavealpha($canvas, false);
    $white = imagecolorallocate($canvas, 255, 255, 255);
    imagefilledrectangle($canvas, 0, 0, $width, $height, $white);
    imagealphablending($signatureImage, true);
    imagesavealpha($signatureImage, true);
    imagecopy($canvas, $signatureImage, 0, 0, 0, 0, $width, $height);

    $jpgPath = $uploadsDir . '/' . $prefix . '_' . uniqid('', true) . '.jpg';
    if (!imagejpeg($canvas, $jpgPath, 90)) {
        imagedestroy($signatureImage);
        imagedestroy($canvas);
        return null;
    }

    imagedestroy($signatureImage);
    imagedestroy($canvas);

    return file_exists($jpgPath) ? $jpgPath : null;
}

function validate_signatures(array $sigs): array {
    $errors = [];
    if (empty($sigs['sig1'])) {
        $errors[] = 'Signature 1 (Payment Authorization) is missing';
    }
    if (empty($sigs['sig2'])) {
        $errors[] = 'Signature 2 (Services) is missing';
    }
    if (empty($sigs['sig3'])) {
        $errors[] = 'Signature 3 (Agreement) is missing';
    }
    return $errors;
}

function log_error(string $message, array $context = []): void {
    $logFile = __DIR__ . '/telkom_errors.log';
    $entry = json_encode([
        'timestamp' => date('Y-m-d H:i:s'),
        'message' => $message,
        'context' => $context,
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    file_put_contents($logFile, $entry . "\n", FILE_APPEND);
}

if (!function_exists('clean_mail_subject')) {
    function clean_mail_subject(string $subject): string {
        $subject = html_entity_decode($subject, ENT_QUOTES | ENT_HTML5, 'UTF-8');
        $subject = str_replace(["\r", "\n", "\t", "-", "–", "—", "â€”", "&amp;"], [" ", " ", " ", " ", " ", " ", " ", "&"], $subject);
        $subject = preg_replace('/[^\x20-\x7E]/', ' ', $subject) ?? '';
        $subject = preg_replace('/\s+/', ' ', $subject) ?? '';
        return trim($subject) ?: 'Onea Africa Telkom Application';
    }
}
function first_existing_path(array $paths): string {
    foreach ($paths as $path) {
        if ($path && file_exists($path)) {
            return $path;
        }
    }
    return '';
}

function find_library_file(array $roots, array $fileNames, array $pathHints = [], array $rejectHints = []): string {
    $wanted = array_map('strtolower', $fileNames);

    foreach ($roots as $root) {
        if (!$root || !is_dir($root)) {
            continue;
        }

        try {
            $iterator = new RecursiveIteratorIterator(
                new RecursiveDirectoryIterator($root, FilesystemIterator::SKIP_DOTS)
            );
        } catch (Throwable $ex) {
            continue;
        }

        foreach ($iterator as $file) {
            if (!$file->isFile()) {
                continue;
            }

            $path = $file->getPathname();
            $lowerPath = strtolower(str_replace('\\', '/', $path));
            $basename = strtolower($file->getBasename());
            if (!in_array($basename, $wanted, true)) {
                continue;
            }

            $isRejected = false;
            foreach ($rejectHints as $hint) {
                if (strpos($lowerPath, strtolower($hint)) !== false) {
                    $isRejected = true;
                    break;
                }
            }
            if ($isRejected) {
                continue;
            }

            if (!empty($pathHints)) {
                $matchesHint = false;
                foreach ($pathHints as $hint) {
                    if (strpos($lowerPath, strtolower($hint)) !== false) {
                        $matchesHint = true;
                        break;
                    }
                }
                if (!$matchesHint) {
                    continue;
                }
            }

            return $path;
        }
    }

    return '';
}

$signatures = [
    'sig1' => trim($form['sig1'] ?? ''),
    'sig2' => trim($form['sig2'] ?? ''),
    'sig3' => trim($form['sig3'] ?? ''),
];

$sigErrors = validate_signatures($signatures);
if (!empty($sigErrors)) {
    respond(['error' => implode('; ', $sigErrors)], 400);
}

$uploadsDir = get_uploads_dir();
$sigPath1 = write_signature_image($signatures['sig1'], $uploadsDir, 'sig1');
$sigPath2 = write_signature_image($signatures['sig2'], $uploadsDir, 'sig2');
$sigPath3 = write_signature_image($signatures['sig3'], $uploadsDir, 'sig3');

if (!$sigPath1 || !$sigPath2 || !$sigPath3) {
    log_error('Failed to write signature images', [
        'sig1' => $sigPath1 ? 'OK' : 'FAILED',
        'sig2' => $sigPath2 ? 'OK' : 'FAILED',
        'sig3' => $sigPath3 ? 'OK' : 'FAILED',
    ]);
    respond(['error' => 'Failed to process signature images. Please try again.'], 500);
}

$missingRequired = [];
if (trim((string) ($form['totalExpenses'] ?? '')) === '') {
    $missingRequired[] = 'Total Monthly Expenses';
}

if (trim((string) ($form['physicalAddress'] ?? '')) === '') {
    $missingRequired[] = 'Physical Address';
}
if (trim((string) ($form['leadArea'] ?? '')) === '') {
    $missingRequired[] = 'Area / Township / Town';
}
if (trim((string) ($form['premisesType'] ?? '')) === '') {
    $missingRequired[] = 'Installation Premises Type';
}
if (trim((string) ($form['premisesOwnAddress'] ?? '')) === '') {
    $missingRequired[] = 'Recognized Street Address Status';
}
$postalAdopted = yes_no($form['postalAddressSameAsAbove'] ?? $form['postalSameAsPhysical'] ?? '') === 'Y';
if (!$postalAdopted && trim((string) ($form['postalAddress'] ?? $form['poBoxPBag'] ?? '')) === '') {
    $missingRequired[] = 'Postal Address';
}
$deliveryAdopted = yes_no($form['deliverySameAsPhysical'] ?? '') === 'Y';
if (!$deliveryAdopted && trim((string) ($form['deliveryAddress'] ?? '')) === '') {
    $missingRequired[] = 'Delivery / Installation Address';
}
if (!empty($missingRequired)) {
    respond(['error' => 'Missing required field: ' . implode(', ', $missingRequired)], 400);
}

$existingCustomer = yes_no(get_field(['existingCustomer', 'EXISTING_CUSTOMER']));
$existingNumber = placeholder(get_field(['existingNumber', 'EXISTING_NUMBER']));
$coverageChecked = yes_no(get_field(['coverageChecked', 'COVERAGE_CHECKED']));
$title = placeholder(get_field(['title', 'TITLE']));
$surname = placeholder(get_field(['surname', 'SURNAME']));
$firstNames = placeholder(get_field(['firstNames', 'FIRST_NAMES']));
$saCitizen = yes_no(get_field(['saCitizen', 'SA_CITIZEN']));
$gender = placeholder(get_field(['gender', 'GENDER']));
$idNumber = placeholder(get_field(['idNumber', 'ID_NUMBER']));
$passportNumber = placeholder(get_field(['passportNumber', 'PASSPORT_NUMBER']));
$passportExpiryDate = placeholder(get_field(['passportExpiryDate', 'PASSPORT_EXPIRY_DATE']));
$homeNumber = placeholder(get_field(['homeNumber', 'HOME_NUMBER']));
$officeNumber = placeholder(get_field(['officeNumber', 'OFFICE_NUMBER']));
$mobileNumber = placeholder(get_field(['mobileNumber', 'MOBILE_NUMBER']));
$alternateMobile = placeholder(get_field(['alternateMobile', 'ALT_MOBILE']));
$email = placeholder(get_field(['email', 'EMAIL']));
$leadArea = placeholder(get_field(['leadArea', 'LEAD_AREA']));
$physicalAddress = placeholder(get_field(['physicalAddress', 'PHYSICAL_ADDRESS']));
$premisesType = placeholder(get_field(['premisesType', 'PREMISES_TYPE']));
$premisesOwnAddress = yes_no(get_field(['premisesOwnAddress', 'PREMISES_OWN_ADDRESS']));
$addressCreationRequired = filter_var($form['addressCreationRequired'] ?? false, FILTER_VALIDATE_BOOLEAN);
$suburb = placeholder(get_field(['suburb', 'SUBURB']));
$city = placeholder(get_field(['city', 'CITY']));
$postalAddressSameAsAbove = yes_no(get_field(['postalAddressSameAsAbove', 'POSTAL_ADDRESS_SAME']));
$poBoxPBag = placeholder(get_field(['poBoxPBag', 'PO_BOX_P_BAG']));
$postalSuburbCity = placeholder(get_field(['postalSuburbCity', 'POSTAL_SUBURB_CITY']));
$postalCode = placeholder(get_field(['postalCode', 'POSTAL_CODE']));
$deliveryAddress = placeholder(get_field(['deliveryAddress', 'DELIVERY_ADDRESS']));
$postalAddress = placeholder(get_field(['postalAddress', 'POSTAL_ADDRESS']));
$deliveryCity = placeholder(get_field(['deliveryCity', 'DELIVERY_CITY']));
$deliveryPostalCode = placeholder(get_field(['deliveryPostalCode', 'DELIVERY_POSTAL_CODE']));
$gpsCoordinates = placeholder(get_field(['gpsCoordinates', 'gps_coordinates', 'GPS_COORDINATES']));

if ($poBoxPBag === '.' && $postalSuburbCity === '.' && $postalAddress !== '.') {
    $poBoxPBag = $postalAddress;
}

$companyName = placeholder(get_field(['companyName', 'COMPANY_NAME']));
$companyContactNo = placeholder(get_field(['companyContactNo', 'COMPANY_CONTACT_NO']));
$companyAddress = placeholder(get_field(['companyAddress', 'COMPANY_ADDRESS']));
$companySuburb = placeholder(get_field(['companySuburb', 'COMPANY_SUBURB']));
$companyCity = placeholder(get_field(['companyCity', 'COMPANY_CITY']));
$companyPostalCode = placeholder(get_field(['companyPostalCode', 'COMPANY_POSTAL_CODE']));
$grossIncome = placeholder(get_field(['grossIncome', 'GROSS_INCOME']));
$netIncome = placeholder(get_field(['netIncome', 'NET_INCOME']));
$totalExpenses = placeholder(get_field(['totalExpenses', 'TOTAL_EXPENSES']));
$householdIncome = placeholder(get_field(['householdIncome', 'HOUSEHOLD_INCOME']));

$bank = placeholder(get_field(['bank', 'BANK']));
$branchName = placeholder(get_field(['branchName', 'BRANCH_NAME']));
$branchCode = placeholder(get_field(['branchCode', 'BRANCH_CODE']));
$accountHolderName = placeholder(get_field(['accountHolderName', 'ACCOUNT_HOLDER_NAME']));
$accountNumber = placeholder(get_field(['accountNumber', 'ACCOUNT_NUMBER']));
$accountType = placeholder(get_field(['accountType', 'ACCOUNT_TYPE']));
$debitOrderMaxAmount = placeholder(get_field(['debitOrderMaxAmount', 'DEBIT_ORDER_MAX_AMOUNT']));
$debitDate = placeholder(get_field(['debitDate', 'DEBIT_DATE']));
$authFullName = placeholder(get_field(['authFullName', 'AUTH_FULL_NAME']));
$executionDate = placeholder(get_field(['executionDate', 'EXECUTION_DATE']));

$technologyType = placeholder(get_field(['technologyType', 'TECHNOLOGY_TYPE']));
$requiredServiceDate = placeholder(get_field(['requiredServiceDate', 'REQUIRED_SERVICE_DATE']));
$linesRequired = placeholder(get_field(['linesRequired', 'LINES_REQUIRED']));
$useExistingLine = yes_no(get_field(['useExistingLine', 'USE_EXISTING_LINE']));
$serviceNumber = placeholder(get_field(['serviceNumber', 'SERVICE_NUMBER']));
$currentServiceProvider = placeholder(get_field(['currentServiceProvider', 'CURRENT_SERVICE_PROVIDER']));
$preferredNetworkOperator = placeholder(get_field(['preferredNetworkOperator', 'PREFERRED_NETWORK_OPERATOR']));
$selectedPackage = placeholder(get_field(['selectedPackage', 'SELECTED_PACKAGE']));
$packagePrice = placeholder(get_field(['packagePrice', 'PACKAGE_PRICE']));
$captureMode = strtolower(display_value(placeholder(get_field(['captureMode', 'CAPTURE_MODE']))));
$agentName = display_value(placeholder(get_field(['agentName', 'AGENT_NAME'])));
$agentColumn = $captureMode === 'assisted' && $agentName !== '' ? $agentName : 'WhatsApp/Online/Referral';
$dealId = placeholder(get_field(['dealId', 'DEAL_ID']));
$dealDescription = placeholder(get_field(['dealDescription', 'DEAL_DESCRIPTION']));
$contractPeriod = placeholder(get_field(['contractPeriod', 'CONTRACT_PERIOD']));
$selfInstall = yes_no(get_field(['selfInstall', 'SELF_INSTALL']));

$creditVettingConsent = yes_no(get_field(['creditVettingConsent', 'CREDIT_VETTING_CONSENT']));
$tcCopyRequest = yes_no(get_field(['tcCopyRequest', 'TC_COPY_REQUEST']));
$deliveryMethod = placeholder(get_field(['deliveryMethod', 'DELIVERY_METHOD']));
$confirmationEmail = placeholder(get_field(['confirmationEmail', 'CONFIRMATION_EMAIL']));
$signingFullName = placeholder(get_field(['signingFullName', 'SIGNING_FULL_NAME']));
$signingDate = placeholder(get_field(['signingDate', 'SIGNING_DATE']));

$pdfLibPath = first_existing_path([
    __DIR__ . '/api/fpdf/fpdf.php',
    __DIR__ . '/fpdf/fpdf.php',
    __DIR__ . '/api/fpdf.php',
    __DIR__ . '/fpdf.php',
    __DIR__ . '/FPDF/fpdf.php',
]);
$fpdiLibPath = first_existing_path([
    __DIR__ . '/api/vendor/autoload.php',
    __DIR__ . '/vendor/autoload.php',
    __DIR__ . '/api/fpdi/fpdi.php',
    __DIR__ . '/fpdi/fpdi.php',
    __DIR__ . '/api/fpdi/FPDI-2.6.7/src/autoload.php',
    __DIR__ . '/fpdi/FPDI-2.6.7/src/autoload.php',
    __DIR__ . '/api/fpdi/FPDI-2.6.7/src/Fpdi.php',
    __DIR__ . '/fpdi/FPDI-2.6.7/src/Fpdi.php',
    __DIR__ . '/api/fpdi/src/autoload.php',
    __DIR__ . '/fpdi/src/autoload.php',
    __DIR__ . '/api/fpdi/src/Fpdi.php',
    __DIR__ . '/fpdi/src/Fpdi.php',
    __DIR__ . '/fpdi/autoload.php',
    __DIR__ . '/FPDI/src/autoload.php',
    __DIR__ . '/FPDI/autoload.php',
]);
$pdfLibPath = $pdfLibPath ?: find_library_file(
    [__DIR__ . '/api/fpdf', __DIR__ . '/fpdf', __DIR__],
    ['fpdf.php'],
    ['fpdf']
);
$fpdiLibPath = $fpdiLibPath ?: find_library_file(
    [__DIR__ . '/api/fpdi', __DIR__ . '/fpdi', __DIR__ . '/api/vendor', __DIR__ . '/vendor', __DIR__],
    ['autoload.php', 'fpdi.php', 'Fpdi.php'],
    ['fpdi', 'setasign'],
    ['/tcpdf/']
);
$templatePath = first_existing_path([
    __DIR__ . '/Consumer Application Form 1.pdf',
    __DIR__ . '/templates/Consumer Application Form 1.pdf',
    __DIR__ . '/templates/telkom-consumer-application.pdf',
    __DIR__ . '/templates/Telkom Consumer Application Form.pdf',
]);
if (!file_exists($pdfLibPath) || !file_exists($fpdiLibPath)) {
    log_error('Missing PDF library files', [
        'fpdf' => $pdfLibPath ?: 'missing',
        'fpdi' => $fpdiLibPath ?: 'missing',
    ]);
    respond(['error' => 'PDF library resources are not available on the server.'], 500);
}
if (!$templatePath) {
    log_error('Missing Telkom PDF template', [
        'checked' => [
            __DIR__ . '/Consumer Application Form 1.pdf',
            __DIR__ . '/templates/Consumer Application Form 1.pdf',
            __DIR__ . '/templates/telkom-consumer-application.pdf',
            __DIR__ . '/templates/Telkom Consumer Application Form.pdf',
        ],
    ]);
    respond(['error' => 'Telkom PDF template is not available on the server.'], 500);
}

require $pdfLibPath;
require $fpdiLibPath;

if (!class_exists('FPDI') && class_exists('\setasign\Fpdi\Fpdi')) {
    class_alias('\setasign\Fpdi\Fpdi', 'FPDI');
}
if (!class_exists('FPDI')) {
    log_error('FPDI class not loaded', ['fpdi' => $fpdiLibPath]);
    respond(['error' => 'PDF overlay library could not be loaded.'], 500);
}

class TelkomApplicationPDF extends FPDI {
    public function overlayText($x, $y, $text, $fontSize = 10, $maxWidth = 0) {
        $this->overlayBox($x, $y, $maxWidth > 0 ? $maxWidth : 120, 5, $text, $fontSize);
    }

    public function overlayBox($x, $y, $w, $h, $text, $fontSize = 8) {
        $text = trim((string) $text);
        if ($text === '' || $text === '.') {
            return;
        }
        $fontSize = (float) $fontSize;
        $this->SetFont('Arial', '', $fontSize);

        if ($w > 0 && $text !== '') {
            $availableWidth = max(2, $w - 2);
            while ($fontSize > 5.5 && $this->GetStringWidth($text) > $availableWidth) {
                $fontSize -= 0.5;
                $this->SetFont('Arial', '', $fontSize);
            }

            if ($this->GetStringWidth($text) > $availableWidth) {
                while (strlen($text) > 1 && $this->GetStringWidth($text . '...') > $availableWidth) {
                    $text = substr($text, 0, -1);
                }
                $text = rtrim($text) . '...';
            }
        }

        $fontHeightMm = $fontSize * 0.3528;
        $baselineY = $y + (($h + $fontHeightMm) / 2) - 0.6;
        $this->Text($x + 1, $baselineY, $text);
    }

    public function overlayChars($x, $y, $w, $h, $text, $cells, $fontSize = 8) {
        $text = preg_replace('/\D+/', '', (string) $text) ?? '';
        if ($text === '') {
            return;
        }
        $chars = str_split(substr($text, 0, $cells));
        $cellWidth = $w / max(1, $cells);
        $this->SetFont('Arial', '', $fontSize);
        $fontHeightMm = $fontSize * 0.3528;
        $baselineY = $y + (($h + $fontHeightMm) / 2) - 0.6;

        foreach ($chars as $index => $char) {
            $charWidth = $this->GetStringWidth($char);
            $this->Text($x + ($index * $cellWidth) + (($cellWidth - $charWidth) / 2), $baselineY, $char);
        }
    }

    public function overlayDate($x, $y, $w, $h, $text, $fontSize = 8) {
        $digits = preg_replace('/\D+/', '', (string) $text) ?? '';
        if ($digits === '' && trim((string) $text) === '.') {
            return;
        }
        if (strlen($digits) === 8) {
            $this->overlayChars($x, $y, $w, $h, $digits, 8, $fontSize);
            return;
        }
        $this->overlayBox($x, $y, $w, $h, $text, $fontSize);
    }
}

function create_telkom_summary_pdf(string $path, string $submissionId, string $timestamp, array $sections, array $signaturePaths = []): bool {
    $pdf = new FPDF('P', 'mm', 'A4');
    $pdf->SetAutoPageBreak(false);

    $leftX = 15.9;
    $valueX = 61.7;
    $maxValueWidth = 107.6;
    $rowHeight = 6.35;
    $wrapDrop = 4.9;
    $topY = 28.2;
    $bottomY = 277.6;
    $y = $topY;

    $addPage = function () use ($pdf, $leftX, &$y, $topY, $submissionId, $timestamp) {
        $pdf->AddPage();
        $pdf->SetFont('Arial', 'B', 18);
        $pdf->Text($leftX, 18, 'Onea Africa Telkom Application Summary');
        $pdf->SetFont('Arial', '', 8);
        $pdf->Text($leftX, 24, 'Reference: ' . $submissionId . ' | Submitted: ' . $timestamp);
        $y = $topY;
    };

    $writeWrappedValue = function (string $value, float $x, float $y, float $width) use ($pdf, $wrapDrop): float {
        $value = trim($value);
        if ($value === '' || $value === '.') {
            return 0;
        }

        $words = preg_split('/\s+/', $value) ?: [];
        $lines = [];
        $line = '';
        foreach ($words as $word) {
            $test = $line === '' ? $word : $line . ' ' . $word;
            if ($pdf->GetStringWidth($test) <= $width || $line === '') {
                $line = $test;
                continue;
            }
            $lines[] = $line;
            $line = $word;
        }
        if ($line !== '') {
            $lines[] = $line;
        }

        foreach ($lines as $index => $lineText) {
            $pdf->Text($x, $y + ($index * $wrapDrop), $lineText);
        }

        return max(1, count($lines)) * $wrapDrop;
    };

    $addPage();
    foreach ($sections as $sectionTitle => $rows) {
        if ($y + 14 > $bottomY) {
            $addPage();
        }

        $y += 3.5;
        $pdf->SetFont('Arial', 'B', 12);
        $pdf->Text($leftX, $y, (string) $sectionTitle);
        $y += 8;

        $pdf->SetFont('Arial', '', 10);
        foreach ($rows as $label => $value) {
            if ($y > $bottomY) {
                $addPage();
                $pdf->SetFont('Arial', '', 10);
            }

            $labelText = trim((string) $label);
            $valueText = trim((string) $value);
            if ($valueText === '' || $valueText === '.') {
                continue;
            }

            $pdf->SetFont('Arial', 'B', 10);
            if ($pdf->GetStringWidth($labelText) > 42) {
                while (strlen($labelText) > 1 && $pdf->GetStringWidth($labelText . '...') > 42) {
                    $labelText = substr($labelText, 0, -1);
                }
                $labelText = rtrim($labelText) . '...';
            }
            $pdf->Text($leftX, $y, $labelText);

            $pdf->SetFont('Arial', '', 10);
            $usedHeight = $writeWrappedValue($valueText, $valueX, $y, $maxValueWidth);
            $y += max($rowHeight, $usedHeight + 1.5);
        }
    }

    if (!empty($signaturePaths)) {
        if ($y + 42 > $bottomY) {
            $addPage();
        }
        $y += 3.5;
        $pdf->SetFont('Arial', 'B', 12);
        $pdf->Text($leftX, $y, 'Digital Signatures');
        $y += 8;

        $pdf->SetFont('Arial', '', 9);
        foreach ($signaturePaths as $label => $signaturePath) {
            if ($y + 28 > $bottomY) {
                $addPage();
                $pdf->SetFont('Arial', '', 9);
            }

            $pdf->SetFont('Arial', 'B', 9);
            $pdf->Text($leftX, $y, (string) $label);
            if (!empty($signaturePath) && file_exists($signaturePath)) {
                $pdf->Image($signaturePath, $valueX, $y - 5, 45, 18);
            } else {
                $pdf->SetFont('Arial', '', 9);
                $pdf->Text($valueX, $y, 'Signature image not available');
            }
            $y += 25;
        }
    }

    $pdf->Output('F', $path);
    return file_exists($path);
}

try {
    $pdf = new TelkomApplicationPDF();
    $pdf->SetAutoPageBreak(false);
    $templatePageCount = $pdf->setSourceFile($templatePath);
    if ($templatePageCount < 3) {
        throw new Exception('Telkom template must contain at least 3 pages');
    }

    $addTemplatePage = function (int $pageNumber) use ($pdf) {
        $pdf->AddPage();
        $templateId = $pdf->importPage($pageNumber);
        $pdf->useTemplate($templateId, 0, 0, 210, 297, true);
    };

    $addTemplatePage(1);
    $pdf->SetFont('Arial', '', 9);
    $pdf->SetTextColor(0, 0, 0);

    $pdf->overlayText(95, 80, $existingCustomer);
    if ($existingCustomer === 'Y') {
        $pdf->overlayText(147, 80, $existingNumber);
    }
    $pdf->overlayText(95, 86, $coverageChecked);
    $pdf->overlayText(55, 94, $title, 8);
    $pdf->overlayText(100, 94, $surname, 8, 42);
    $pdf->overlayText(137, 94, $firstNames, 8, 62);
    $pdf->overlayText(87, 100, $saCitizen);
    $pdf->overlayText(148, 100, $gender);
    $pdf->overlayChars(131, 100, 68, 5, $idNumber, 13, 7.5);
    $pdf->overlayText(55, 106, $passportNumber, 8);
    $pdf->overlayDate(147, 106, 42, 5, $passportExpiryDate, 7.5);
    $pdf->overlayText(80, 112, $homeNumber, 8);
    $pdf->overlayText(147, 112, $officeNumber, 8);
    $pdf->overlayText(80, 118, $mobileNumber, 8);
    $pdf->overlayText(147, 118, $alternateMobile, 8);
    $pdf->overlayText(55, 124, $email, 8, 90);
    $pdf->overlayText(82, 130, $physicalAddress, 8, 115);
    $pdf->overlayText(70, 136, $suburb, 8, 55);
    $pdf->overlayText(115, 136, $city, 8, 42);
    if ($postalAddressSameAsAbove === 'N') {
        $pdf->overlayText(59, 142, 'N');
        $pdf->overlayText(93, 142, $poBoxPBag, 8, 28);
        $pdf->overlayText(137, 142, $postalSuburbCity, 8, 40);
        $pdf->overlayChars(180, 142, 25, 5, $postalCode, 4, 7.5);
    } else {
        $pdf->overlayText(59, 142, 'Y');
    }
    $pdf->overlayText(82, 148, $deliveryAddress, 8, 115);
    $pdf->overlayText(115, 154, $deliveryCity, 8, 42);
    $pdf->overlayChars(180, 154, 25, 5, $deliveryPostalCode, 4, 7.5);
    $employmentDx = -1.0;
    $employmentDy = -0.8;
    $paymentDx = -0.8;
    $pdf->overlayText(53 + $employmentDx, 195 + $employmentDy, $companyName, 8, 90);
    $pdf->overlayText(153 + $employmentDx, 195 + $employmentDy, $companyContactNo, 8, 38);
    $pdf->overlayText(53 + $employmentDx, 201 + $employmentDy, $companyAddress, 8, 125);
    $pdf->overlayText(68 + $employmentDx, 207 + $employmentDy, $companySuburb, 8, 55);
    $pdf->overlayText(133 + $employmentDx, 207 + $employmentDy, $companyCity, 8, 48);
    $pdf->overlayText(153 + $employmentDx, 207 + $employmentDy, $companyPostalCode, 8);
    $pdf->overlayText(47 + $employmentDx, 213 + $employmentDy, $grossIncome, 8);
    $pdf->overlayText(108 + $employmentDx, 213 + $employmentDy, $netIncome, 8);
    $pdf->overlayText(47 + $employmentDx, 219 + $employmentDy, $totalExpenses, 8);
    $pdf->overlayText(108 + $employmentDx, 219 + $employmentDy, $householdIncome, 8);
    $pdf->overlayText(20 + $paymentDx, 241, $bank, 8, 42);
    $pdf->overlayText(91 + $paymentDx, 241, $branchName, 8, 52);
    $pdf->overlayChars(169 + $paymentDx, 241, 31, 5, $branchCode, 6, 7.5);
    $pdf->overlayText(38 + $paymentDx, 247, $accountHolderName, 8, 65);
    $pdf->overlayChars(129 + $paymentDx, 247, 70, 5, $accountNumber, 12, 7.5);
    $pdf->overlayText(63 + $paymentDx, 253, $accountType, 8);
    $pdf->overlayText(56 + $paymentDx, 259, 'R' . $debitOrderMaxAmount, 8);
    $pdf->overlayText(107 + $paymentDx, 259, $debitDate, 8);
    $pdf->overlayText(26, 274, $authFullName, 9, 55);
    $pdf->overlayDate(159, 274, 42, 5, $executionDate, 7.5);
    if (file_exists($sigPath1)) {
        $pdf->Image($sigPath1, 103, 266, 38, 15);
    }

    $addTemplatePage(2);
    $pdf->SetFont('Arial', '', 9);
    $pdf->SetTextColor(0, 0, 0);
    $serviceDx = -1.2;
    $pdf->overlayText(68 + $serviceDx, 88, $technologyType);
    $pdf->overlayDate(151, 88, 42, 5, $requiredServiceDate, 7.5);
    $pdf->overlayText(54 + $serviceDx, 94, $linesRequired, 8);
    $pdf->overlayText(98 + $serviceDx, 94, $useExistingLine);
    if ($useExistingLine === 'Y') {
        $pdf->overlayBox(114 + $serviceDx, 100, 60, 5, $serviceNumber, 8);
    } else {
        $pdf->overlayText(114 + $serviceDx, 100, '.', 8);
    }
    $pdf->overlayText(40 + $serviceDx, 106, $currentServiceProvider, 8, 70);
    $pdf->overlayText(122 + $serviceDx, 106, $preferredNetworkOperator, 8, 58);
    $pdf->overlayText(53, 118, $dealId, 8);
    $pdf->overlayText(115, 118, $dealDescription, 8, 70);
    $pdf->overlayText(62, 142, $selectedPackage, 8, 120);
    $pdf->overlayText(148, 118, $contractPeriod, 8);
    $pdf->overlayText(68, 155, $selfInstall);
    $pdf->overlayText(26, 181, $signingFullName, 9, 55);
    $pdf->overlayDate(159, 181, 42, 5, $signingDate, 7.5);
    if (file_exists($sigPath2)) {
        $pdf->Image($sigPath2, 103, 173, 38, 15);
    }

    $addTemplatePage(3);
    $pdf->SetFont('Arial', '', 9);
    $pdf->SetTextColor(0, 0, 0);
    $pdf->overlayText(75, 191, $creditVettingConsent);
    $pdf->overlayText(75, 205, $tcCopyRequest);
    if ($tcCopyRequest === 'Y') {
        $pdf->overlayText(100, 213, $deliveryMethod, 8);
        if ($deliveryMethod === 'Emailed') {
            $pdf->overlayText(80, 216, $confirmationEmail, 8, 115);
        }
    }
    $pdf->overlayText(26, 222, $signingFullName, 9, 55);
    $pdf->overlayDate(159, 222, 42, 5, $signingDate, 7.5);
    if (file_exists($sigPath3)) {
        $pdf->Image($sigPath3, 105, 214, 34, 12);
    }
    $pdf->overlayText(32, 240, 'Onea Africa', 8, 95);
    $pdf->overlayText(160, 240, 'X8896194', 8, 42);

    $timestamp = date('Y-m-d H:i:s');
    $submissionId = 'TELKOM-' . strtoupper(substr(md5($authFullName . microtime(true)), 0, 8));

    $dataDir = __DIR__ . '/data';
    if (!is_dir($dataDir)) {
        mkdir($dataDir, 0755, true);
    }

    $pdfPath = $dataDir . '/telkom-' . $submissionId . '.pdf';
    $pdfContent = $pdf->Output('S');
    if ($pdfContent === false || $pdfContent === '') {
        throw new Exception('Failed to generate PDF bytes');
    }
    if (file_put_contents($pdfPath, $pdfContent) === false) {
        throw new Exception('Failed to write PDF file');
    }

    $summaryPath = $dataDir . '/telkom-summary-' . $submissionId . '.pdf';
    create_telkom_summary_pdf($summaryPath, $submissionId, $timestamp, [
        '1. Customer Details' => [
            'Existing Customer' => $existingCustomer,
            'Existing Number' => $existingNumber,
            'Coverage Checked' => $coverageChecked,
            'Full Name' => trim("{$title} {$surname} {$firstNames}"),
            'SA Citizen' => $saCitizen,
            'Gender' => $gender,
            'ID Number' => $idNumber,
            'Passport Number' => $passportNumber,
            'Mobile Number' => $mobileNumber,
            'Alternate Mobile' => $alternateMobile,
            'Email Address' => $email,
            'Area / Township / Town' => $leadArea,
            'Physical Address' => join_clean_parts([$physicalAddress, $suburb, $city]),
            'Installation Premises Type' => ucwords(str_replace('-', ' ', display_value($premisesType))),
            'Own Recognized Address' => $premisesOwnAddress === 'Y' ? 'Yes' : 'No / unsure',
            'Address Creation Required (Internal)' => $addressCreationRequired ? 'YES - FOLLOW UP' : 'No',
            'Postal Address' => $postalAddress !== '.' ? $postalAddress : join_clean_parts([$poBoxPBag, $postalSuburbCity, $postalCode]),
            'Delivery / Installation Address' => join_clean_parts([$deliveryAddress, $deliveryCity, $deliveryPostalCode]),
            'GPS Coordinates' => $gpsCoordinates,
        ],
        '2. Employment And Affordability' => [
            'Company Name' => $companyName,
            'Company Contact' => $companyContactNo,
            'Company Address' => join_clean_parts([$companyAddress, $companySuburb, $companyCity, $companyPostalCode]),
            'Gross Income p/m' => money_value($grossIncome),
            'Net Income p/m' => money_value($netIncome),
            'Total Monthly Expenses' => money_value($totalExpenses),
            'Household Income p/m' => money_value($householdIncome),
        ],
        '3. Payment Details' => [
            'Bank' => $bank,
            'Branch Name' => $branchName,
            'Branch Code' => $branchCode,
            'Account Holder' => $accountHolderName,
            'Account Number' => $accountNumber,
            'Account Type' => $accountType,
            'Debit Order Max Amount' => money_value($debitOrderMaxAmount),
            'Debit Date' => $debitDate,
            'Authorising Full Name' => $authFullName,
            'Execution Date' => $executionDate,
        ],
        '5. Services Required' => [
            'Technology Type' => $technologyType,
            'Required Service Date' => $requiredServiceDate,
            'Lines Required' => $linesRequired,
            'Use Existing Line' => $useExistingLine,
            'Service Number' => $serviceNumber,
            'Current Service Provider' => $currentServiceProvider,
            'Preferred Network Operator' => $preferredNetworkOperator,
            'Selected Package' => $selectedPackage,
            'Monthly Price' => money_value($packagePrice),
            'Contract Period' => $contractPeriod,
            'Self Install' => $selfInstall,
        ],
        '6. Agreement' => [
            'Credit Vetting Consent' => $creditVettingConsent,
            'Terms Copy Request' => $tcCopyRequest,
            'Delivery Method' => $deliveryMethod,
            'Confirmation Email' => $confirmationEmail,
            'Signing Full Name' => $signingFullName,
            'Signing Date' => $signingDate,
        ],
    ], [
        'Signature 1 - Payment Authorization' => $sigPath1,
        'Signature 2 - Services' => $sigPath2,
        'Signature 3 - Agreement' => $sigPath3,
    ]);

    foreach ([$sigPath1, $sigPath2, $sigPath3] as $tmpSigPath) {
        if (!empty($tmpSigPath) && file_exists($tmpSigPath)) {
            @unlink($tmpSigPath);
        }
    }
} catch (Throwable $ex) {
    log_error('PDF generation failed', [
        'error' => $ex->getMessage(),
        'file' => $ex->getFile(),
        'line' => $ex->getLine(),
    ]);
    respond(['error' => 'Failed to generate PDF. Please try again.'], 500);
}

$fromEmail = 'website@onea.co.za';
$recipient = 'sikhitn1@telkom.co.za';
$ccRecipient = 'sales@onea.co.za';
$replyTo = filter_var($email, FILTER_VALIDATE_EMAIL) ? $email : $fromEmail;
$physicalAddressLine = display_value(join_clean_parts([$physicalAddress, $suburb, $city]));
$postalAddressLine = display_value($postalAddress !== '.' ? $postalAddress : join_clean_parts([$poBoxPBag, $postalSuburbCity, $postalCode]));
$deliveryAddressLine = display_value(join_clean_parts([$deliveryAddress, $deliveryCity, $deliveryPostalCode]));
$gpsCoordinatesLine = display_value($gpsCoordinates);
$leadAreaLine = display_value($leadArea);
$premisesTypeLine = ucwords(str_replace('-', ' ', display_value($premisesType)));
$premisesOwnAddressLine = $premisesOwnAddress === 'Y' ? 'Yes' : ($premisesOwnAddress === 'N' ? 'No / unsure' : '');
$addressCreationLine = $addressCreationRequired ? 'YES - INTERNAL FOLLOW-UP REQUIRED' : 'No';

$html = "<div style=\"font-family:Arial,sans-serif;max-width:800px;margin:0 auto;padding:24px;background:#f5f5f5;border-radius:8px;\">\n"
    . "  <h2 style=\"color:#0066cc;border-bottom:3px solid #0066cc;padding-bottom:10px;\">New Telkom Application Submission</h2>\n"
    . "  <div style=\"background:white;padding:20px;border-radius:8px;margin:20px 0;\">\n"
    . "    <h3 style=\"color:#333;margin-top:0;\">SECTION 1: CUSTOMER DETAILS</h3>\n"
    . "    <table style=\"width:100%;border-collapse:collapse;font-size:13px;\">\n"
    . "      <tr><td style=\"padding:8px;border-bottom:1px solid #eee;\"><strong>Name:</strong></td><td style=\"padding:8px;border-bottom:1px solid #eee;\">{$title} {$surname} {$firstNames}</td></tr>\n"
    . "      <tr><td style=\"padding:8px;border-bottom:1px solid #eee;\"><strong>Mobile:</strong></td><td style=\"padding:8px;border-bottom:1px solid #eee;\">{$mobileNumber}</td></tr>\n"
    . "      <tr><td style=\"padding:8px;border-bottom:1px solid #eee;\"><strong>Email:</strong></td><td style=\"padding:8px;border-bottom:1px solid #eee;\">{$email}</td></tr>\n"
    . "      <tr><td style=\"padding:8px;border-bottom:1px solid #eee;\"><strong>Area / Township / Town:</strong></td><td style=\"padding:8px;border-bottom:1px solid #eee;\">{$leadAreaLine}</td></tr>\n"
    . "      <tr><td style=\"padding:8px;border-bottom:1px solid #eee;\"><strong>Physical Address:</strong></td><td style=\"padding:8px;border-bottom:1px solid #eee;\">{$physicalAddressLine}</td></tr>\n"
    . "      <tr><td style=\"padding:8px;border-bottom:1px solid #eee;\"><strong>Premises Type:</strong></td><td style=\"padding:8px;border-bottom:1px solid #eee;\">{$premisesTypeLine}</td></tr>\n"
    . "      <tr><td style=\"padding:8px;border-bottom:1px solid #eee;\"><strong>Own Recognized Address:</strong></td><td style=\"padding:8px;border-bottom:1px solid #eee;\">{$premisesOwnAddressLine}</td></tr>\n"
    . "      <tr><td style=\"padding:8px;border-bottom:1px solid #eee;background:" . ($addressCreationRequired ? '#fff3cd' : 'transparent') . ";\"><strong>Address Creation Required (Internal):</strong></td><td style=\"padding:8px;border-bottom:1px solid #eee;background:" . ($addressCreationRequired ? '#fff3cd' : 'transparent') . ";font-weight:bold;\">{$addressCreationLine}</td></tr>\n"
    . "      <tr><td style=\"padding:8px;border-bottom:1px solid #eee;\"><strong>Postal Address:</strong></td><td style=\"padding:8px;border-bottom:1px solid #eee;\">{$postalAddressLine}</td></tr>\n"
    . "      <tr><td style=\"padding:8px;border-bottom:1px solid #eee;\"><strong>Delivery / Installation Address:</strong></td><td style=\"padding:8px;border-bottom:1px solid #eee;\">{$deliveryAddressLine}</td></tr>\n"
    . "      <tr><td style=\"padding:8px;border-bottom:1px solid #eee;\"><strong>GPS Coordinates:</strong></td><td style=\"padding:8px;border-bottom:1px solid #eee;\">{$gpsCoordinatesLine}</td></tr>\n"
    . "      <tr><td style=\"padding:8px;border-bottom:1px solid #eee;\"><strong>Existing Customer:</strong></td><td style=\"padding:8px;border-bottom:1px solid #eee;\">{$existingCustomer}</td></tr>\n"
    . "    </table>\n"
    . "  </div>\n"
    . "  <div style=\"background:white;padding:20px;border-radius:8px;margin:20px 0;\">\n"
    . "    <h3 style=\"color:#333;margin-top:0;\">SECTION 2: EMPLOYMENT DETAILS</h3>\n"
    . "    <table style=\"width:100%;border-collapse:collapse;font-size:13px;\">\n"
    . "      <tr><td style=\"padding:8px;border-bottom:1px solid #eee;\"><strong>Company:</strong></td><td style=\"padding:8px;border-bottom:1px solid #eee;\">{$companyName}</td></tr>\n"
    . "      <tr><td style=\"padding:8px;border-bottom:1px solid #eee;\"><strong>Gross Income p/m:</strong></td><td style=\"padding:8px;border-bottom:1px solid #eee;\">R {$grossIncome}</td></tr>\n"
    . "      <tr><td style=\"padding:8px;border-bottom:1px solid #eee;\"><strong>Net Income p/m:</strong></td><td style=\"padding:8px;border-bottom:1px solid #eee;\">R {$netIncome}</td></tr>\n"
    . "    </table>\n"
    . "  </div>\n"
    . "  <div style=\"background:white;padding:20px;border-radius:8px;margin:20px 0;\">\n"
    . "    <h3 style=\"color:#333;margin-top:0;\">SECTION 3: PAYMENT DETAILS</h3>\n"
    . "    <table style=\"width:100%;border-collapse:collapse;font-size:13px;\">\n"
    . "      <tr><td style=\"padding:8px;border-bottom:1px solid #eee;\"><strong>Bank:</strong></td><td style=\"padding:8px;border-bottom:1px solid #eee;\">{$bank} ({$branchName})</td></tr>\n"
    . "      <tr><td style=\"padding:8px;border-bottom:1px solid #eee;\"><strong>Account Holder:</strong></td><td style=\"padding:8px;border-bottom:1px solid #eee;\">{$accountHolderName}</td></tr>\n"
    . "      <tr><td style=\"padding:8px;border-bottom:1px solid #eee;\"><strong>Account Number:</strong></td><td style=\"padding:8px;border-bottom:1px solid #eee;\">{$accountNumber}</td></tr>\n"
    . "      <tr><td style=\"padding:8px;border-bottom:1px solid #eee;\"><strong>Account Type:</strong></td><td style=\"padding:8px;border-bottom:1px solid #eee;\">{$accountType}</td></tr>\n"
    . "      <tr><td style=\"padding:8px;border-bottom:1px solid #eee;\"><strong>Debit Date:</strong></td><td style=\"padding:8px;border-bottom:1px solid #eee;\">{$debitDate}</td></tr>\n"
    . "    </table>\n"
    . "  </div>\n"
    . "  <div style=\"background:white;padding:20px;border-radius:8px;margin:20px 0;\">\n"
    . "    <h3 style=\"color:#333;margin-top:0;\">SECTION 5: SERVICES REQUIRED</h3>\n"
    . "    <table style=\"width:100%;border-collapse:collapse;font-size:13px;\">\n"
    . "      <tr><td style=\"padding:8px;border-bottom:1px solid #eee;\"><strong>Technology Type:</strong></td><td style=\"padding:8px;border-bottom:1px solid #eee;\">{$technologyType}</td></tr>\n"
    . "      <tr><td style=\"padding:8px;border-bottom:1px solid #eee;\"><strong>Service Date:</strong></td><td style=\"padding:8px;border-bottom:1px solid #eee;\">{$requiredServiceDate}</td></tr>\n"
    . "      <tr><td style=\"padding:8px;border-bottom:1px solid #eee;\"><strong>Selected Package:</strong></td><td style=\"padding:8px;border-bottom:1px solid #eee;\">{$selectedPackage}</td></tr>\n"
    . "      <tr><td style=\"padding:8px;border-bottom:1px solid #eee;\"><strong>Monthly Cost:</strong></td><td style=\"padding:8px;border-bottom:1px solid #eee;\">R {$packagePrice}</td></tr>\n"
    . "      <tr><td style=\"padding:8px;border-bottom:1px solid #eee;\"><strong>Contract Period:</strong></td><td style=\"padding:8px;border-bottom:1px solid #eee;\">{$contractPeriod}</td></tr>\n"
    . "    </table>\n"
    . "  </div>\n"
    . "  <div style=\"background:#f0f0f0;padding:16px;border-radius:8px;margin:20px 0;border-left:4px solid #0066cc;\">\n"
    . "    <p style=\"margin:0;color:#333;font-size:12px;\">\n"
    . "      <strong>Reference ID:</strong> {$submissionId}<br>\n"
    . "      <strong>Submitted:</strong> {$timestamp}<br>\n"
    . "      <strong>All 3 signatures captured and included in attached PDF</strong>\n"
    . "    </p>\n"
    . "  </div>\n"
    . "</div>";

$subject = clean_mail_subject("New Telkom Application {$authFullName} {$submissionId}");
$attachments = [];
if (file_exists($pdfPath)) {
    $attachments[] = [
        'filename' => "telkom-{$submissionId}.pdf",
        'content' => chunk_split(base64_encode(file_get_contents($pdfPath))),
    ];
}
if (!empty($summaryPath) && file_exists($summaryPath)) {
    $attachments[] = [
        'filename' => "telkom-summary-{$submissionId}.pdf",
        'content' => chunk_split(base64_encode(file_get_contents($summaryPath))),
    ];
}

$boundary = md5(time());
$headers = "From: {$fromEmail}\r\n";
$headers .= "Reply-To: {$replyTo}\r\n";
$headers .= "Cc: {$ccRecipient}\r\n";
$headers .= "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: multipart/mixed; boundary=\"{$boundary}\"\r\n";

$message = "--{$boundary}\r\n";
$message .= "Content-Type: text/html; charset=UTF-8\r\n";
$message .= "Content-Transfer-Encoding: 7bit\r\n\r\n";
$message .= $html . "\r\n\r\n";

foreach ($attachments as $mailAttachment) {
    $message .= "--{$boundary}\r\n";
    $message .= "Content-Type: application/pdf; name=\"{$mailAttachment['filename']}\"\r\n";
    $message .= "Content-Disposition: attachment; filename=\"{$mailAttachment['filename']}\"\r\n";
    $message .= "Content-Transfer-Encoding: base64\r\n\r\n";
    $message .= $mailAttachment['content'] . "\r\n\r\n";
}

$message .= "--{$boundary}--";
error_log('[onea-telkom-mail] attempting admin send to=' . $recipient . ' subject=' . $subject);
$emailSent = @mail($recipient, $subject, $message, $headers, "-f{$fromEmail}");
error_log('[onea-telkom-mail] admin result=' . ($emailSent ? 'sent' : 'failed') . ' to=' . $recipient);
if (!$emailSent) {
    log_error('Email send failed', [
        'to' => $recipient,
        'from' => $fromEmail,
        'reference' => $submissionId,
    ]);
}

$clientSubject = clean_mail_subject("Copy of your Telkom Application {$submissionId}");
$clientHtml = "<div style=\"font-family:Arial,sans-serif;max-width:700px;margin:0 auto;padding:24px;background:#f7f9f2;border-radius:8px;\">\n"
    . "  <h2 style=\"color:#102000;margin-top:0;\">Telkom Application Copy</h2>\n"
    . "  <p>Hi {$authFullName},</p>\n"
    . "  <p>Thank you for submitting your Telkom application through Onea Africa. A copy of your completed application PDF is attached for your records.</p>\n"
    . "  <div style=\"background:white;border-left:4px solid #8CC444;padding:14px 16px;margin:18px 0;border-radius:6px;\">\n"
    . "    <strong>Reference:</strong> {$submissionId}<br>\n"
    . "    <strong>Package:</strong> {$selectedPackage}<br>\n"
    . "    <strong>Monthly:</strong> R{$packagePrice}<br>\n"
    . "    <strong>Submitted:</strong> {$timestamp}\n"
    . "  </div>\n"
    . "  <p>Our team will review the application and contact you if anything else is needed.</p>\n"
    . "  <p style=\"color:#666;font-size:12px;margin-top:24px;\">Onea Africa · sikhitn1@telkom.co.za · +27 69 464 4663</p>\n"
    . "</div>";

$clientBoundary = md5(time() . '-client');
$clientHeaders = "From: {$fromEmail}\r\n";
$clientHeaders .= "Reply-To: {$recipient}\r\n";
$clientHeaders .= "MIME-Version: 1.0\r\n";
$clientHeaders .= "Content-Type: multipart/mixed; boundary=\"{$clientBoundary}\"\r\n";

$clientMessage = "--{$clientBoundary}\r\n";
$clientMessage .= "Content-Type: text/html; charset=UTF-8\r\n";
$clientMessage .= "Content-Transfer-Encoding: 7bit\r\n\r\n";
$clientMessage .= $clientHtml . "\r\n\r\n";
foreach ($attachments as $mailAttachment) {
    $clientMessage .= "--{$clientBoundary}\r\n";
    $clientMessage .= "Content-Type: application/pdf; name=\"{$mailAttachment['filename']}\"\r\n";
    $clientMessage .= "Content-Disposition: attachment; filename=\"{$mailAttachment['filename']}\"\r\n";
    $clientMessage .= "Content-Transfer-Encoding: base64\r\n\r\n";
    $clientMessage .= $mailAttachment['content'] . "\r\n\r\n";
}
$clientMessage .= "--{$clientBoundary}--";

$clientEmailSent = false;
if (filter_var($email, FILTER_VALIDATE_EMAIL)) {
    error_log('[onea-telkom-mail] attempting client send to=' . $email . ' subject=' . $clientSubject);
    $clientEmailSent = @mail($email, $clientSubject, $clientMessage, $clientHeaders, "-f{$fromEmail}");
    error_log('[onea-telkom-mail] client result=' . ($clientEmailSent ? 'sent' : 'failed') . ' to=' . $email);
}
if (!$clientEmailSent) {
    log_error('Client copy email failed', [
        'to' => $email,
        'from' => $fromEmail,
        'reference' => $submissionId,
    ]);
}

$sheetData = [
    'customer_name' => "{$title} {$surname} {$firstNames}",
    'address' => $physicalAddressLine,
    'lead_area' => $leadAreaLine,
    'premises_type' => $premisesTypeLine,
    'address_creation_required' => $addressCreationRequired ? 'Y' : 'N',
    'isp_type' => $technologyType,
    'isp_partner' => $preferredNetworkOperator,
    'package' => $selectedPackage,
    'speed' => package_speed($selectedPackage),
    'monthly_value' => $packagePrice,
];

append_to_sheet([
    '',
    $authFullName,
    $physicalAddressLine,
    $leadAreaLine,
    $technologyType,
    $preferredNetworkOperator,
    $selectedPackage,
    package_speed($selectedPackage),
    $packagePrice,
    '',
    '',
    $agentColumn,
], 'ISP_TRACKING');

$whatsappMessage = "📱 New Telkom Lead:\n"
    . "Name: {$authFullName}\n"
    . "Phone: {$mobileNumber}\n"
    . "Area: {$leadAreaLine}\n"
    . "Premises: {$premisesTypeLine}\n"
    . "Address creation: " . ($addressCreationRequired ? 'YES - FOLLOW UP' : 'No') . "\n"
    . "Package: {$selectedPackage}\n"
    . "Monthly: R{$packagePrice}\n"
    . "Ref: {$submissionId}";

$whatsappWebhook = get_env('WHATSAPP_WEBHOOK_URL', '');
if ($whatsappWebhook) {
    $waPayload = json_encode([
        'phone' => '+27694644663',
        'message' => $whatsappMessage,
    ]);
    $opts = [
        'http' => [
            'method' => 'POST',
            'header' => "Content-Type: application/json\r\n",
            'content' => $waPayload,
            'timeout' => 5,
        ],
    ];
    @file_get_contents($whatsappWebhook, false, stream_context_create($opts));
}

$submissionRecord = [
    'id' => $submissionId,
    'timestamp' => $timestamp,
    'name' => "{$title} {$surname} {$firstNames}",
    'phone' => $mobileNumber,
    'email' => $email,
    'lead_area' => $leadAreaLine,
    'address' => $physicalAddressLine,
    'premises_type' => $premisesTypeLine,
    'premises_own_address' => $premisesOwnAddressLine,
    'address_creation_required' => $addressCreationRequired,
    'postal_address' => $postalAddressLine,
    'delivery_address' => $deliveryAddressLine,
    'gps_coordinates' => $gpsCoordinates,
    'company' => $companyName,
    'technology' => $technologyType,
    'package' => $selectedPackage,
    'monthly_cost' => $packagePrice,
    'service_date' => $requiredServiceDate,
    'pdf_path' => $pdfPath,
];

$jsonDir = __DIR__ . '/data/telkom-submissions';
if (!is_dir($jsonDir)) {
    mkdir($jsonDir, 0755, true);
}

file_put_contents(
    $jsonDir . '/' . $submissionId . '.json',
    json_encode($submissionRecord, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT)
);

if (!$emailSent) {
    respond([
        'error' => 'Application PDF was generated and saved, but the server mail route failed. Please contact sikhitn1@telkom.co.za with the reference ID.',
        'id' => $submissionId,
        'timestamp' => $timestamp,
        'recipient' => $recipient,
        'client_copy_sent' => $clientEmailSent,
    ], 500);
}

respond([
    'message' => 'Your Telkom application has been submitted successfully.',
    'id' => $submissionId,
    'timestamp' => $timestamp,
    'recipient' => $recipient,
    'client_copy_sent' => $clientEmailSent,
], 201);


