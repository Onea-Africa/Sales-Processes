<?php
/**
 * POST /api/enquiries
 * Handles "Talk to Us" form submissions
 * Sends email + appends to Google Sheets + WhatsApp notification
 */

require_once __DIR__ . '/config.php';

setup_cors();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(['error' => 'Method not allowed'], 405);
}

try {
    $input = json_decode(file_get_contents('php://input'), true);

    $name            = trim($input['name'] ?? '');
    $email           = trim($input['email'] ?? '');
    $phone           = trim($input['phone'] ?? '');
    $company         = trim($input['company'] ?? '');
    $service         = trim($input['service'] ?? '');
    $message         = trim($input['message'] ?? '');
    $recaptchaToken  = trim($input['recaptchaToken'] ?? '');

    // Validation
    if (!$name || !$email || !$phone || !$service) {
        json_response([
            'error' => 'Name, email, contact number and service are required.'
        ], 400);
    }

    // reCAPTCHA verification
    $captcha = verify_recaptcha($recaptchaToken);
    if ($captcha['success'] === false || (isset($captcha['score']) && $captcha['score'] < 0.5)) {
        json_response(['error' => 'reCAPTCHA check failed. Please try again.'], 400);
    }

    $timestamp = get_timestamp();

    // ────── Send to Google Sheets ──────
    append_to_google_sheets([
        $timestamp,
        $name,
        $email,
        $phone,
        $company ?: '',
        $service,
        $message ?: '',
        $captcha['score'] ?? 'n/a',
    ]);

    // ────── Send notification email ──────
    $notification_email = env('NOTIFICATION_EMAIL') ?: 'connect@onea.co.za';

    $admin_html = "
<div style=\"font-family:Inter,sans-serif;max-width:600px;margin:0 auto;background:#f8fbec;padding:32px;border-radius:12px;\">
  <div style=\"background:#8CC444;color:#102000;padding:24px 32px;border-radius:8px 8px 0 0;margin:-32px -32px 24px;\">
    <h1 style=\"margin:0;font-size:22px;\">New Enquiry — Onea Africa</h1>
    <p style=\"margin:6px 0 0;opacity:0.7;font-size:13px;\">{$timestamp}</p>
  </div>
  <table style=\"width:100%;border-collapse:collapse;font-size:15px;\">
    <tr><td style=\"padding:10px 0;color:#424938;width:140px;\"><strong>Name</strong></td><td>{$name}</td></tr>
    <tr><td style=\"padding:10px 0;color:#424938;\"><strong>Email</strong></td><td><a href=\"mailto:{$email}\" style=\"color:#8CC444;\">{$email}</a></td></tr>
    <tr><td style=\"padding:10px 0;color:#424938;\"><strong>Phone</strong></td><td><a href=\"tel:{$phone}\" style=\"color:#8CC444;\">{$phone}</a></td></tr>
    <tr><td style=\"padding:10px 0;color:#424938;\"><strong>Company</strong></td><td>" . ($company ?: '—') . "</td></tr>
    <tr><td style=\"padding:10px 0;color:#424938;\"><strong>Service</strong></td>
      <td><span style=\"background:#8CC444;color:#102000;padding:4px 12px;border-radius:100px;font-size:13px;font-weight:700;\">{$service}</span></td></tr>
    <tr><td style=\"padding:10px 0;color:#424938;vertical-align:top;\"><strong>Message</strong></td>
      <td style=\"white-space:pre-wrap;\">" . ($message ?: '—') . "</td></tr>
  </table>
  <div style=\"margin-top:24px;padding:16px;background:#fff;border-radius:8px;border:1px solid #d9dbcd;\">
    <a href=\"mailto:{$email}\" style=\"display:inline-block;background:#8CC444;color:#102000;padding:10px 24px;border-radius:100px;font-weight:700;text-decoration:none;margin-right:8px;\">Reply by Email</a>
    <a href=\"https://wa.me/" . preg_replace('/\D/', '', $phone) . "\" style=\"display:inline-block;background:#25D366;color:#fff;padding:10px 24px;border-radius:100px;font-weight:700;text-decoration:none;\">WhatsApp</a>
  </div>
  <div style=\"margin-top:16px;font-size:12px;color:#888;\">
    Onea Africa (Pty) Ltd · connect@onea.co.za · +27 69 464 4663
  </div>
</div>";

    $admin_sent = send_email(
        $notification_email,
        "New Enquiry — {$service} from {$name}" . ($company ? " ({$company})" : ''),
        $admin_html,
        'Onea Africa Website',
        $email
    );

    if ($admin_sent) {
        log_message('[ENQUIRY]', "✓ {$name} · {$service}");
    }

    // ────── Send WhatsApp notification (CallMeBot) ──────
    $whatsapp_to = env('WHATSAPP_TO');
    $whatsapp_key = env('WHATSAPP_CALLMEBOT_APIKEY');

    if ($whatsapp_to && $whatsapp_key) {
        $wa_text = "🔔 New Onea Enquiry\n📋 {$service}\n👤 {$name}" . ($company ? " ({$company})" : '') . "\n📧 {$email}\n📞 {$phone}";
        if ($message) {
            $wa_text .= "\n💬 " . substr($message, 0, 100);
        }

        $wa_url = "https://api.callmebot.com/whatsapp.php?" . http_build_query([
            'phone' => $whatsapp_to,
            'text'  => $wa_text,
            'apikey' => $whatsapp_key,
        ]);

        // Fire and forget (don't block submission)
        @file_get_contents($wa_url, false, stream_context_create(['http' => ['timeout' => 2]]));
    }

    json_response([
        'message' => "Thank you! We've received your enquiry and will be in touch within 24 hours.",
    ], 201);

} catch (Exception $e) {
    log_message('[ENQUIRY] ERROR', $e->getMessage());
    json_response([
        'error' => 'Something went wrong. Please email us at connect@onea.co.za or WhatsApp +27 69 464 4663.',
    ], 500);
}
