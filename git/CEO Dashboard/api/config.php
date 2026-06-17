<?php
/**
 * Xneelo Shared Hosting Configuration & Utilities
 * PHP 7.4+ compatible
 */

// Load .env file if it exists (fallback to direct $_ENV)
if (file_exists(__DIR__ . '/.env')) {
    $lines = file(__DIR__ . '/.env', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos($line, '=') !== false && strpos($line, '#') !== 0) {
            [$key, $value] = explode('=', $line, 2);
            $_ENV[trim($key)] = trim($value, '\'"');
        }
    }
}

// ────── Helper: Safe ENV access ──────
function env($key, $default = null) {
    return $_ENV[trim($key)] ?? $_SERVER[trim($key)] ?? $default;
}

// ────── Helper: Normalize SMTP password (strip spaces) ──────
function normalize_smtp_pass($pass) {
    return preg_replace('/\s+/', '', $pass);
}

// ────── CORS & JSON Response ──────
function setup_cors() {
    header('Access-Control-Allow-Origin: ' . (env('CLIENT_ORIGIN') ?: '*'));
    header('Access-Control-Allow-Methods: GET, POST, OPTIONS, DELETE');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
    header('Content-Type: application/json');

    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit;
    }
}

// ────── JSON Response Helper ──────
function json_response($data, $code = 200) {
    http_response_code($code);
    echo json_encode($data, JSON_UNESCAPED_SLASHES);
    exit;
}

// ────── Error Logging (Xneelo safe) ──────
function log_message($prefix, $message) {
    $log_file = __DIR__ . '/logs/app.log';
    if (!is_dir(__DIR__ . '/logs')) {
        mkdir(__DIR__ . '/logs', 0755, true);
    }
    $timestamp = date('Y-m-d H:i:s');
    $line = "[{$timestamp}] {$prefix} {$message}" . PHP_EOL;
    error_log($line, 3, $log_file);
}

// ────── SMTP Transporter (PHPMailer compatible) ──────
function get_smtp_transport() {
    $host = env('SMTP_HOST');
    $user = env('SMTP_USER');
    $pass = normalize_smtp_pass(env('SMTP_PASS'));
    $port = (int)(env('SMTP_PORT') ?: 587);

    if (!$host || !$user || !$pass) {
        return null;
    }

    return [
        'host' => $host,
        'port' => $port,
        'user' => $user,
        'pass' => $pass,
        'secure' => ($port === 465) ? 'ssl' : 'tls',
    ];
}

// ────── Send Email via mail() or SMTP ──────
function send_email($to, $subject, $html_body, $from_name = 'Onea Africa', $reply_to = null) {
    $smtp = get_smtp_transport();

    // Use built-in mail() if no SMTP configured (Xneelo default sendmail)
    if (!$smtp) {
        $headers = "MIME-Version: 1.0\r\n";
        $headers .= "Content-type: text/html; charset=UTF-8\r\n";
        $headers .= "From: {$from_name} <noreply@onea.africa>\r\n";
        if ($reply_to) {
            $headers .= "Reply-To: {$reply_to}\r\n";
        }

        $sent = mail($to, $subject, $html_body, $headers);
        if ($sent) {
            log_message('[MAIL]', "Sent via PHP mail() to {$to}");
        } else {
            log_message('[MAIL] ERROR', "Failed to send to {$to}");
        }
        return $sent;
    }

    // Use SMTP if configured
    try {
        $socket = fsockopen($smtp['host'], $smtp['port'], $errno, $errstr, 10);
        if (!$socket) {
            log_message('[SMTP] ERROR', "Could not connect: {$errstr}");
            return false;
        }

        // Read SMTP greeting
        fgets($socket, 1024);

        // Send EHLO
        fputs($socket, "EHLO " . gethostname() . "\r\n");
        fgets($socket, 1024);

        // STARTTLS for port 587
        if ($smtp['port'] === 587) {
            fputs($socket, "STARTTLS\r\n");
            fgets($socket, 1024);
            stream_socket_enable_crypto($socket, true, STREAM_CRYPTO_METHOD_TLS_CLIENT);
            fputs($socket, "EHLO " . gethostname() . "\r\n");
            fgets($socket, 1024);
        }

        // AUTH LOGIN
        fputs($socket, "AUTH LOGIN\r\n");
        fgets($socket, 1024);
        fputs($socket, base64_encode($smtp['user']) . "\r\n");
        fgets($socket, 1024);
        fputs($socket, base64_encode($smtp['pass']) . "\r\n");
        $auth_response = fgets($socket, 1024);

        if (strpos($auth_response, '235') === false) {
            log_message('[SMTP] ERROR', "AUTH failed for {$smtp['user']}");
            fclose($socket);
            return false;
        }

        // Build message
        $email_from = "{$from_name} <" . ($smtp['user'] ?: 'noreply@onea.africa') . ">";
        $headers = "From: {$email_from}\r\n";
        if ($reply_to) {
            $headers .= "Reply-To: {$reply_to}\r\n";
        }
        $headers .= "MIME-Version: 1.0\r\n";
        $headers .= "Content-type: text/html; charset=UTF-8\r\n";

        // MAIL FROM
        fputs($socket, "MAIL FROM: <{$smtp['user']}>\r\n");
        fgets($socket, 1024);

        // RCPT TO
        fputs($socket, "RCPT TO: <{$to}>\r\n");
        fgets($socket, 1024);

        // DATA
        fputs($socket, "DATA\r\n");
        fgets($socket, 1024);
        fputs($socket, "Subject: {$subject}\r\n{$headers}\r\n\r\n{$html_body}\r\n.\r\n");
        fgets($socket, 1024);

        // QUIT
        fputs($socket, "QUIT\r\n");
        fclose($socket);

        log_message('[SMTP]', "Sent via SMTP to {$to}");
        return true;
    } catch (Exception $e) {
        log_message('[SMTP] ERROR', $e->getMessage());
        return false;
    }
}

// ────── reCAPTCHA Verification ──────
function verify_recaptcha($token) {
    $secret = env('RECAPTCHA_SECRET_KEY');
    if (!$secret || !$token) {
        return ['success' => true, 'score' => 1];
    }

    $response = file_get_contents(
        'https://www.google.com/recaptcha/api/siteverify',
        false,
        stream_context_create([
            'http' => [
                'method' => 'POST',
                'header' => "Content-type: application/x-www-form-urlencoded\r\n",
                'content' => http_build_query([
                    'secret' => $secret,
                    'response' => $token,
                ]),
                'timeout' => 8,
            ],
        ])
    );

    return json_decode($response, true) ?: ['success' => true, 'score' => 1];
}

// ────── Google Sheets Append via Apps Script or API ──────
function append_to_google_sheets($row_data) {
    $sheet_id = env('GOOGLE_SHEETS_ID');
    $service_email = env('GOOGLE_SERVICE_ACCOUNT_EMAIL');
    $private_key = env('GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY');

    if (!$sheet_id || !$service_email || !$private_key) {
        log_message('[SHEETS]', 'Not configured — skipping');
        return true; // Don't fail the submission
    }

    try {
        // This is a simplified approach using Google's REST API
        // For production, use the Google API PHP Client library or Apps Script webhook
        $jwt_header = json_encode(['alg' => 'RS256', 'typ' => 'JWT']);
        $jwt_claim = json_encode([
            'iss' => $service_email,
            'scope' => 'https://www.googleapis.com/auth/spreadsheets',
            'aud' => 'https://oauth2.googleapis.com/token',
            'exp' => time() + 3600,
            'iat' => time(),
        ]);

        // Create JWT token (requires openssl)
        $jwt = base64_url_encode($jwt_header) . '.' . base64_url_encode($jwt_claim);
        $signature = '';
        if (openssl_sign($jwt, $signature, $private_key, 'SHA256')) {
            $jwt .= '.' . base64_url_encode($signature);
        }

        // Exchange JWT for access token
        $token_response = file_get_contents(
            'https://oauth2.googleapis.com/token',
            false,
            stream_context_create([
                'http' => [
                    'method' => 'POST',
                    'header' => "Content-type: application/x-www-form-urlencoded\r\n",
                    'content' => http_build_query([
                        'grant_type' => 'urn:ietf:params:oauth:grant-type:jwt-bearer',
                        'assertion' => $jwt,
                    ]),
                    'timeout' => 8,
                ],
            ])
        );

        $token_data = json_decode($token_response, true);
        if (!$token_data['access_token']) {
            log_message('[SHEETS] ERROR', 'Could not get access token');
            return false;
        }

        $access_token = $token_data['access_token'];

        // Append to sheet
        $request = [
            'values' => [$row_data],
        ];

        $result = file_get_contents(
            "https://sheets.googleapis.com/v4/spreadsheets/{$sheet_id}/values/'Web Enquiries'!A:H/append?valueInputOption=USER_ENTERED&access_token={$access_token}",
            false,
            stream_context_create([
                'http' => [
                    'method' => 'POST',
                    'header' => "Content-type: application/json\r\n",
                    'content' => json_encode($request),
                    'timeout' => 8,
                ],
            ])
        );

        log_message('[SHEETS]', 'Row appended');
        return true;
    } catch (Exception $e) {
        log_message('[SHEETS] ERROR', $e->getMessage());
        return false; // Don't fail submission if sheets fails
    }
}

// ────── Base64 URL encode for JWT ──────
function base64_url_encode($data) {
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

// ────── Timestamp in ZA timezone ──────
function get_timestamp() {
    $tz = new DateTimeZone('Africa/Johannesburg');
    $dt = new DateTime('now', $tz);
    return $dt->format('Y-m-d H:i:s');
}
