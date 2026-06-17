<?php
ini_set('display_errors', '0');
ini_set('log_errors', '1');
ini_set('error_log', __DIR__ . '/../PHP_errors.log');
error_reporting(E_ALL);

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: https://onea.africa');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');

if (strtoupper($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(200);
    exit;
}

function respond($payload, $status = 200) {
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function get_json_body() {
    $raw = file_get_contents('php://input');
    if (!$raw) {
        return [];
    }
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

function is_post_request() {
    return strtoupper($_SERVER['REQUEST_METHOD'] ?? '') === 'POST';
}

function get_private_config() {
    static $config = null;
    if ($config !== null) {
        return $config;
    }
    $config = [];
    $path = dirname(__DIR__, 2) . '/onea-config.php';
    if (is_file($path) && is_readable($path)) {
        $loaded = require $path;
        if (is_array($loaded)) {
            $config = $loaded;
        }
    }
    return $config;
}

function get_env($key, $default = '') {
    $value = getenv($key);
    if ($value !== false && $value !== '') {
        return $value;
    }
    $config = get_private_config();
    return array_key_exists($key, $config) ? $config[$key] : $default;
}

function env_flag($key, $default = false) {
    $value = strtolower(trim((string) get_env($key, $default ? '1' : '0')));
    return in_array($value, ['1', 'true', 'yes', 'on'], true);
}

function sanitize($value) {
    if (is_array($value)) {
        return array_map('sanitize', $value);
    }
    return trim(htmlspecialchars((string) $value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8'));
}

function build_html_table_row($label, $value) {
    $value = $value !== '' ? nl2br(htmlspecialchars($value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8')) : '&mdash;';
    return "<tr>\n  <td style=\"padding:10px 0;color:#424938;width:140px;font-weight:700;vertical-align:top;\">{$label}</td>\n  <td style=\"padding:10px 0;color:#102000;\">{$value}</td>\n</tr>\n";
}

if (!function_exists('clean_mail_subject')) {
function clean_mail_subject($subject) {
    $subject = html_entity_decode((string) $subject, ENT_QUOTES | ENT_HTML5, 'UTF-8');
    $subject = str_replace(["\r", "\n", "\t", '-', 'â€“', 'â€”', 'Ã¢â‚¬â€', '&amp;'], [' ', ' ', ' ', ' ', ' ', ' ', ' ', '&'], $subject);
    $subject = preg_replace('/[^\x20-\x7E]/', ' ', $subject);
    $subject = preg_replace('/\s+/', ' ', $subject);
    return trim($subject) ?: 'Onea Africa Website Submission';
}
}

function send_html_email($to, $subject, $html, $from, $replyTo = '', $attachments = [], $cc = []) {
    $boundary = '==BOUNDARY_' . md5(uniqid((string) time(), true));
    $safeSubject = clean_mail_subject($subject);
    $envelopeSender = get_env('MAIL_ENVELOPE_FROM', 'connect@onea.co.za');
    $headers = [];
    $headers[] = "From: {$from}";
    if ($replyTo) {
        $headers[] = "Reply-To: {$replyTo}";
    }
    if (!empty($cc)) {
        $headers[] = 'Cc: ' . implode(', ', (array) $cc);
    }
    $headers[] = 'MIME-Version: 1.0';

    if (!empty($attachments)) {
        $headers[] = "Content-Type: multipart/mixed; boundary=\"{$boundary}\"";

        $body = "--{$boundary}\r\n";
        $body .= "Content-Type: text/html; charset=UTF-8\r\n";
        $body .= "Content-Transfer-Encoding: 8bit\r\n\r\n";
        $body .= $html . "\r\n\r\n";

        foreach ($attachments as $attachment) {
            $filename = basename($attachment['filename'] ?? 'attachment.bin');
            $content  = $attachment['content'] ?? '';
            $mime     = $attachment['mimetype'] ?? 'application/octet-stream';
            $body .= "--{$boundary}\r\n";
            $body .= "Content-Type: {$mime}; name=\"{$filename}\"\r\n";
            $body .= "Content-Disposition: attachment; filename=\"{$filename}\"\r\n";
            $body .= "Content-Transfer-Encoding: base64\r\n\r\n";
            $body .= chunk_split(base64_encode($content)) . "\r\n\r\n";
        }
        $body .= "--{$boundary}--";
    } else {
        $headers[] = 'Content-Type: text/html; charset=UTF-8';
        $body = $html;
    }

    error_log('[onea-mail] attempting send to=' . $to . ' subject=' . $safeSubject);
    $sent = mail($to, $safeSubject, $body, implode("\r\n", $headers), "-f{$envelopeSender}");
    error_log('[onea-mail] result=' . ($sent ? 'sent' : 'failed') . ' to=' . $to);
    return $sent;
}

function append_to_sheet($values, $sheetName = 'Web Enquiries') {
    $webhook = get_env('GOOGLE_SHEETS_WEBHOOK_URL');
    if (!$webhook) {
        return false;
    }

    $payload = json_encode([
        'sheet' => $sheetName,
        'values' => $values,
        'secret' => get_env('GOOGLE_SHEETS_WEBHOOK_SECRET', ''),
    ]);

    $options = [
        'http' => [
            'method'  => 'POST',
            'header'  => "Content-Type: application/json\r\n", 
            'content' => $payload,
            'timeout' => 10,
        ],
    ];

    $context  = stream_context_create($options);
    $result   = @file_get_contents($webhook, false, $context);
    return $result !== false;
}

function save_submission_json($name, $data) {
    $directory = __DIR__ . '/data';
    if (!is_dir($directory)) {
        mkdir($directory, 0755, true);
    }
    $filename = preg_replace('/[^a-z0-9_-]/i', '-', $name) . '.json';
    $path = $directory . '/' . $filename;
    update_json_file($path, function ($existing) use ($data) {
        $existing = is_array($existing) ? $existing : [];
        $existing[] = $data;
        return $existing;
    });
}

function get_request_header($name) {
    $name = 'HTTP_' . strtoupper(str_replace('-', '_', $name));
    return $_SERVER[$name] ?? '';
}

function get_session_username() {
    if (session_status() !== PHP_SESSION_ACTIVE) {
        return '';
    }
    return trim($_SESSION['username'] ?? '');
}

function is_session_user_authorized() {
    $allowedUsers = ['Nick', 'Keneilwe', 'Yolanda', 'OneaAgent', 'Ororiseng', 'support_agent'];
    $username = get_session_username();
    return $username !== '' && in_array($username, $allowedUsers, true);
}

function get_bearer_token() {
    $auth = get_request_header('Authorization');
    if (!$auth) {
        $auth = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '';
    }
    if (strpos($auth, 'Bearer ') === 0) {
        return trim(substr($auth, 7));
    }
    return '';
}

function load_json_file($path) {
    if (!file_exists($path)) {
        return [];
    }
    $handle = fopen($path, 'rb');
    if (!$handle) {
        return [];
    }
    flock($handle, LOCK_SH);
    $raw = stream_get_contents($handle);
    flock($handle, LOCK_UN);
    fclose($handle);
    $payload = json_decode($raw ?: '', true);
    return is_array($payload) ? $payload : [];
}

function save_json_file($path, $data) {
    $directory = dirname($path);
    if (!is_dir($directory) && !mkdir($directory, 0750, true) && !is_dir($directory)) {
        throw new RuntimeException('Unable to create secure data directory.');
    }
    $encoded = json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
    if ($encoded === false) {
        throw new RuntimeException('Unable to encode JSON data.');
    }
    $temp = tempnam($directory, '.onea-');
    if ($temp === false) {
        throw new RuntimeException('Unable to create temporary data file.');
    }
    if (file_put_contents($temp, $encoded, LOCK_EX) === false) {
        @unlink($temp);
        throw new RuntimeException('Unable to write data file.');
    }
    @chmod($temp, 0640);
    if (!@rename($temp, $path)) {
        @unlink($temp);
        throw new RuntimeException('Unable to replace data file.');
    }
}

function update_json_file($path, $mutator) {
    $directory = dirname($path);
    if (!is_dir($directory) && !mkdir($directory, 0750, true) && !is_dir($directory)) {
        throw new RuntimeException('Unable to create secure data directory.');
    }
    $lockPath = $path . '.lock';
    $lock = fopen($lockPath, 'c+');
    if (!$lock || !flock($lock, LOCK_EX)) {
        if ($lock) fclose($lock);
        throw new RuntimeException('Unable to lock data file.');
    }
    try {
        $current = load_json_file($path);
        $updated = $mutator($current);
        save_json_file($path, $updated);
        return $updated;
    } finally {
        flock($lock, LOCK_UN);
        fclose($lock);
    }
}

function get_session_file() {
    return __DIR__ . '/data/document-sessions.json';
}

function load_sessions() {
    return load_json_file(get_session_file());
}

function save_sessions($sessions) {
    save_json_file(get_session_file(), $sessions);
}

function create_session($username, $displayName, $role) {
    $token = bin2hex(random_bytes(32));
    $tokenHash = hash('sha256', $token);
    $ttlHours = max(1, min(24, (int) get_env('SESSION_TTL_HOURS', '8')));
    update_json_file(get_session_file(), function ($sessions) use ($tokenHash, $username, $displayName, $role, $ttlHours) {
        $sessions = is_array($sessions) ? $sessions : [];
        $now = time();
        foreach ($sessions as $key => $session) {
            if (strtotime((string) ($session['expiresAt'] ?? '1970-01-01')) < $now) {
                unset($sessions[$key]);
            }
        }
        $sessions[$tokenHash] = [
            'username' => $username,
            'displayName' => $displayName,
            'role' => $role,
            'createdAt' => date('c'),
            'expiresAt' => date('c', $now + $ttlHours * 3600),
        ];
        return $sessions;
    });
    return $token;
}

function validate_token($token) {
    if (!$token) {
        return null;
    }
    $sessions = load_sessions();
    $tokenHash = hash('sha256', $token);
    if (!isset($sessions[$tokenHash])) {
        return null;
    }
    $session = $sessions[$tokenHash];
    if (strtotime($session['expiresAt']) < time()) {
        update_json_file(get_session_file(), function ($current) use ($tokenHash) {
            unset($current[$tokenHash]);
            return $current;
        });
        return null;
    }
    return $session;
}

function client_ip() {
    return (string) ($_SERVER['REMOTE_ADDR'] ?? 'unknown');
}

function enforce_rate_limit($scope, $limit = 10, $windowSeconds = 900) {
    $limit = max(1, (int) $limit);
    $windowSeconds = max(10, (int) $windowSeconds);
    $directory = __DIR__ . '/data/.rate-limits';
    if (!is_dir($directory)) {
        mkdir($directory, 0750, true);
    }
    $key = hash('sha256', $scope . '|' . client_ip());
    $path = $directory . '/' . $key . '.json';
    $now = time();
    $state = update_json_file($path, function ($current) use ($now, $windowSeconds) {
        $hits = [];
        foreach (($current['hits'] ?? []) as $hit) {
            if ((int) $hit > $now - $windowSeconds) {
                $hits[] = (int) $hit;
            }
        }
        $hits[] = $now;
        return ['hits' => $hits];
    });
    $count = count($state['hits'] ?? []);
    header('X-RateLimit-Limit: ' . $limit);
    header('X-RateLimit-Remaining: ' . max(0, $limit - $count));
    if ($count > $limit) {
        header('Retry-After: ' . $windowSeconds);
        respond(['error' => 'Too many requests. Please wait before trying again.'], 429);
    }
}

function verify_recaptcha_token($token, $expectedAction = '') {
    $secret = trim((string) get_env('RECAPTCHA_SECRET_KEY', ''));
    if ($secret === '') {
        return true;
    }
    if (trim((string) $token) === '') {
        return false;
    }
    $payload = http_build_query([
        'secret' => $secret,
        'response' => $token,
        'remoteip' => client_ip(),
    ]);
    $context = stream_context_create([
        'http' => [
            'method' => 'POST',
            'header' => "Content-Type: application/x-www-form-urlencoded\r\n",
            'content' => $payload,
            'timeout' => 8,
            'ignore_errors' => true,
        ],
    ]);
    $raw = @file_get_contents('https://www.google.com/recaptcha/api/siteverify', false, $context);
    $result = $raw ? json_decode($raw, true) : null;
    if (!is_array($result) || empty($result['success'])) {
        return false;
    }
    $minimum = (float) get_env('RECAPTCHA_MIN_SCORE', '0.5');
    if (isset($result['score']) && (float) $result['score'] < $minimum) {
        return false;
    }
    if ($expectedAction !== '' && !empty($result['action']) && !hash_equals($expectedAction, (string) $result['action'])) {
        return false;
    }
    return true;
}

function protect_public_submission($input, $scope, $limit = 8, $windowSeconds = 900, $recaptchaAction = '') {
    enforce_rate_limit($scope, $limit, $windowSeconds);
    foreach (['website', 'companyWebsite', 'faxNumber'] as $honeypot) {
        if (trim((string) ($input[$honeypot] ?? '')) !== '') {
            error_log('[onea-security] honeypot blocked scope=' . $scope . ' ip=' . client_ip());
            respond(['error' => 'Unable to process this submission.'], 400);
        }
    }
    $recaptchaToken = $input['recaptchaToken'] ?? '';
    if (($recaptchaAction !== '' || trim((string) $recaptchaToken) !== '') &&
        !verify_recaptcha_token($recaptchaToken, $recaptchaAction)) {
        respond(['error' => 'Bot verification failed. Please refresh and try again.'], 400);
    }
}

function inspect_uploaded_file($path, $originalName, $allowedMimeTypes, $maxBytes) {
    if (!is_file($path) || !is_readable($path)) {
        return ['ok' => false, 'error' => 'Uploaded file could not be read.'];
    }
    $size = filesize($path);
    if ($size === false || $size < 1 || $size > $maxBytes) {
        return ['ok' => false, 'error' => 'Uploaded file is empty or exceeds the size limit.'];
    }
    if (!class_exists('finfo')) {
        return ['ok' => false, 'error' => 'Server file inspection is unavailable.'];
    }
    $finfo = new finfo(FILEINFO_MIME_TYPE);
    $mime = (string) $finfo->file($path);
    if (!in_array($mime, $allowedMimeTypes, true)) {
        return ['ok' => false, 'error' => 'Uploaded file type is not allowed.'];
    }
    if ($mime === 'application/pdf') {
        $handle = fopen($path, 'rb');
        $magic = $handle ? fread($handle, 5) : '';
        if ($handle) fclose($handle);
        if ($magic !== '%PDF-') {
            return ['ok' => false, 'error' => 'The PDF file is invalid.'];
        }
    }
    $scan = scan_file_for_malware($path);
    if (!$scan['ok']) {
        return $scan;
    }
    return [
        'ok' => true,
        'mime' => $mime,
        'size' => $size,
        'filename' => preg_replace('/[^A-Za-z0-9._-]/', '-', basename((string) $originalName)),
    ];
}

function scan_file_for_malware($path) {
    $command = trim((string) get_env('CLAMAV_SCAN_COMMAND', ''));
    $required = env_flag('FILE_MALWARE_SCAN_REQUIRED', false);
    if ($command === '') {
        return $required
            ? ['ok' => false, 'error' => 'Malware scanning is unavailable.']
            : ['ok' => true, 'scanner' => 'not-configured'];
    }
    if (!function_exists('exec')) {
        return $required
            ? ['ok' => false, 'error' => 'Malware scanning is unavailable.']
            : ['ok' => true, 'scanner' => 'unavailable'];
    }
    $output = [];
    $exitCode = 0;
    exec($command . ' ' . escapeshellarg($path) . ' 2>&1', $output, $exitCode);
    if ($exitCode === 0) {
        return ['ok' => true, 'scanner' => 'clamav'];
    }
    error_log('[onea-security] malware scan failed exit=' . $exitCode . ' output=' . implode(' ', $output));
    return ['ok' => false, 'error' => $exitCode === 1 ? 'Uploaded file was rejected by malware scanning.' : 'Uploaded file could not be security scanned.'];
}

function require_auth($allowedRoles = []) {
    $token = get_bearer_token();
    $session = validate_token($token);
    if (!$session && is_session_user_authorized()) {
        $session = [
            'username'    => get_session_username(),
            'displayName' => $_SESSION['displayName'] ?? get_session_username(),
            'role'        => $_SESSION['role'] ?? 'support_agent',
            'createdAt'   => date('Y-m-d H:i:s'),
            'expiresAt'   => date('Y-m-d H:i:s', time() + 24 * 60 * 60),
        ];
    }
    if (!$session) {
        respond(['error' => 'Unauthorized. Please log in.'], 401);
    }
    if (!empty($allowedRoles) && !in_array($session['role'], $allowedRoles, true)) {
        respond(['error' => 'Forbidden. Insufficient permissions.'], 403);
    }
    return $session;
}

function get_documents_definition() {
    return [
        ['key' => 'registration-number', 'title' => 'Registration Number 2016/461132/07', 'description' => 'CIPC registration certificate.'],
        ['key' => 'cipc', 'title' => 'CIPC Certificate', 'description' => 'Company registration proof.'],
        ['key' => 'vat', 'title' => 'VAT Certificate 4550322707', 'description' => 'VAT registration document.'],
        ['key' => 'tax-ref', 'title' => 'Tax Reference 7520825896', 'description' => 'SARS tax reference document.'],
        ['key' => 'income-tax', 'title' => 'Income Tax 9870344166', 'description' => 'Income tax registration document.'],
        ['key' => 'csd', 'title' => 'CSD Number MAAA0662773', 'description' => 'Central Supplier Database registration.'],
        ['key' => 'paye', 'title' => 'PAYE Reference 7520825896', 'description' => 'PAYE registration document.'],
        ['key' => 'sdl', 'title' => 'SDL Reference L520825896', 'description' => 'Skills Development Levy registration.'],
        ['key' => 'uif', 'title' => 'UIF Reference U520825896', 'description' => 'Unemployment Insurance Fund registration.'],
        ['key' => 'bbbee', 'title' => 'B-BBEE Status Level 1', 'description' => 'Broad-Based Black Economic Empowerment certificate.'],
        ['key' => 'microsoft-ai', 'title' => 'Microsoft AI Cloud Partner Program', 'description' => 'Partner certification document.'],
        ['key' => 'annual-returns', 'title' => 'Company Annual Returns', 'description' => 'Annual returns filings.'],
        ['key' => 'share-certificates', 'title' => 'Share Certificates', 'description' => 'Company share certificate documents.'],
        ['key' => 'bank-confirmation', 'title' => 'Bank Confirmation Letter', 'description' => 'Bank confirmation of account details.'],
        ['key' => 'director-ids', 'title' => 'Certified IDs of Directors', 'description' => 'Certified identification documents.'],
        ['key' => 'proof-of-address', 'title' => 'Proof of Address', 'description' => 'Company premises proof of address.'],
        ['key' => 'coida', 'title' => 'COIDA / Compensation Fund', 'description' => 'Compensation fund compliance certificate.'],
        ['key' => 'company-profile', 'title' => 'Company Profile', 'description' => 'Onea Africa corporate profile document.'],
        ['key' => 'organogram', 'title' => 'Organogram', 'description' => 'Organogram structure chart.'],
        ['key' => 'certifications', 'title' => 'Certifications', 'description' => 'Other business certifications.'],
        ['key' => 'aws-example', 'title' => 'AWS Example Document', 'description' => 'Example AWS compliance document.'],
        ['key' => 'cisco-example', 'title' => 'Cisco Example Document', 'description' => 'Example Cisco compliance document.'],
        ['key' => 'google-example', 'title' => 'Google Example Document', 'description' => 'Example Google compliance document.'],
        ['key' => 'fortinet-example', 'title' => 'Fortinet Example Document', 'description' => 'Example Fortinet compliance document.'],
    ];
}
