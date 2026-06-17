<?php
/**
 * POST /api/applications
 * Handles careers & speculative applications
 */

require_once __DIR__ . '/config.php';

setup_cors();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(['error' => 'Method not allowed'], 405);
}

try {
    $input = json_decode(file_get_contents('php://input'), true);

    $mode            = $input['mode'] ?? 'speculative';
    $name            = trim($input['name'] ?? '');
    $email           = trim($input['email'] ?? '');
    $phone           = trim($input['phone'] ?? '');
    $idNumber        = trim($input['idNumber'] ?? '');
    $position        = trim($input['position'] ?? $input['area'] ?? '');
    $message         = trim($input['message'] ?? $input['intro'] ?? '');
    $linkedin        = trim($input['linkedin'] ?? '');
    $source          = trim($input['source'] ?? '');
    $recaptchaToken  = trim($input['recaptchaToken'] ?? '');

    // Validation
    if (!$name || !$email || !$phone || !$message) {
        json_response([
            'error' => 'Name, email, phone number and message are required.'
        ], 400);
    }

    if (($mode === 'apply' || $mode === 'speculative') && !$position) {
        json_response([
            'error' => 'Please select an area of interest.'
        ], 400);
    }

    // reCAPTCHA
    $captcha = verify_recaptcha($recaptchaToken);
    if ($captcha['success'] === false || (isset($captcha['score']) && $captcha['score'] < 0.5)) {
        json_response(['error' => 'reCAPTCHA check failed. Please try again.'], 400);
    }

    $timestamp = get_timestamp();
    $mode_label = [
        'apply'       => 'Job Application',
        'speculative' => 'Speculative Application',
        'contact'     => 'General Enquiry',
    ][$mode] ?? 'Careers Enquiry';

    $subject_position = $position ?: 'General Enquiry';

    // ────── Build email HTML ──────
    $position_row = ($mode === 'apply' || $mode === 'speculative') && $position
        ? "<tr><td style=\"padding:12px 16px;color:#424938;width:160px;font-weight:700;border-bottom:1px solid #e8eee1;vertical-align:top;\">" . ($mode === 'apply' ? 'Position' : 'Area of Interest') . "</td><td style=\"padding:12px 16px;border-bottom:1px solid #e8eee1;\"><span style=\"background:#8CC444;color:#102000;padding:4px 12px;border-radius:100px;font-size:13px;font-weight:700;\">{$position}</span></td></tr>"
        : '';

    $linkedin_row = "<tr><td style=\"padding:12px 16px;color:#424938;width:160px;font-weight:700;border-bottom:1px solid #e8eee1;vertical-align:top;\">LinkedIn</td><td style=\"padding:12px 16px;border-bottom:1px solid #e8eee1;\">" . ($linkedin ? "<a href=\"{$linkedin}\" style=\"color:#8CC444;\">{$linkedin}</a>" : '—') . "</td></tr>";

    $actions = "
    <div style=\"margin-top:24px;padding:16px;background:#fff;border-radius:8px;border:1px solid #d9dbcd;\">
      <a href=\"mailto:{$email}\" style=\"display:inline-block;background:#8CC444;color:#102000;padding:10px 24px;border-radius:100px;font-weight:700;text-decoration:none;margin-right:8px;\">Reply to Applicant</a>
      " . ($linkedin ? "<a href=\"{$linkedin}\" style=\"display:inline-block;background:#0A66C2;color:#fff;padding:10px 24px;border-radius:100px;font-weight:700;text-decoration:none;\">View LinkedIn</a>" : '') . "
    </div>";

    $email_html = "
<div style=\"font-family:Inter,sans-serif;max-width:600px;margin:0 auto;background:#f8fbec;padding:32px;border-radius:12px;\">
  <div style=\"background:#8CC444;color:#102000;padding:24px 32px;border-radius:8px 8px 0 0;margin:-32px -32px 24px;\">
    <h1 style=\"margin:0;font-size:22px;\">{$mode_label}</h1>
    <p style=\"margin:6px 0 0;opacity:0.7;font-size:13px;\">{$timestamp}</p>
  </div>
  <table style=\"width:100%;border-collapse:collapse;font-size:15px;\">
    <tr><td style=\"padding:12px 16px;color:#424938;width:160px;font-weight:700;border-bottom:1px solid #e8eee1;\">Full Name</td><td style=\"padding:12px 16px;border-bottom:1px solid #e8eee1;\">{$name}</td></tr>
    <tr><td style=\"padding:12px 16px;color:#424938;width:160px;font-weight:700;border-bottom:1px solid #e8eee1;\">Email</td><td style=\"padding:12px 16px;border-bottom:1px solid #e8eee1;\"><a href=\"mailto:{$email}\" style=\"color:#8CC444;\">{$email}</a></td></tr>
    <tr><td style=\"padding:12px 16px;color:#424938;width:160px;font-weight:700;border-bottom:1px solid #e8eee1;\">Phone</td><td style=\"padding:12px 16px;border-bottom:1px solid #e8eee1;\"><a href=\"tel:{$phone}\" style=\"color:#8CC444;\">{$phone}</a></td></tr>
    <tr><td style=\"padding:12px 16px;color:#424938;width:160px;font-weight:700;border-bottom:1px solid #e8eee1;\">ID / Passport No.</td><td style=\"padding:12px 16px;border-bottom:1px solid #e8eee1;\">{$idNumber}</td></tr>
    {$position_row}
    <tr><td style=\"padding:12px 16px;color:#424938;width:160px;font-weight:700;border-bottom:1px solid #e8eee1;vertical-align:top;\">Message</td><td style=\"padding:12px 16px;border-bottom:1px solid #e8eee1;white-space:pre-wrap;\">{$message}</td></tr>
    {$linkedin_row}
    <tr><td style=\"padding:12px 16px;color:#424938;width:160px;font-weight:700;border-bottom:1px solid #e8eee1;\">Heard About Us</td><td style=\"padding:12px 16px;border-bottom:1px solid #e8eee1;\">{$source}</td></tr>
  </table>
  {$actions}
  <div style=\"margin-top:16px;font-size:12px;color:#888;\">
    Onea Africa (Pty) Ltd · hr@onea.co.za · Pretoria, Gauteng
  </div>
</div>";

    $email_sent = send_email(
        'hr@onea.co.za',
        "Careers Enquiry — {$name} — {$subject_position}",
        $email_html,
        'Onea Africa Careers',
        $email
    );

    if ($email_sent) {
        log_message('[APPLICATIONS]', "✓ {$name} · {$subject_position}");
    }

    json_response([
        'message' => 'Thank you for reaching out. We will be in touch soon.',
    ], 201);

} catch (Exception $e) {
    log_message('[APPLICATIONS] ERROR', $e->getMessage());
    json_response([
        'error' => 'Something went wrong. Please email hr@onea.co.za directly.',
    ], 500);
}
