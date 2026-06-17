<?php
/**
 * POST /api/homeconnect-leads
 * Handles Home Connect portal form submissions
 */

require_once __DIR__ . '/config.php';

setup_cors();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(['error' => 'Method not allowed'], 405);
}

try {
    $input = json_decode(file_get_contents('php://input'), true);

    $title           = trim($input['title'] ?? '');
    $firstName       = trim($input['firstName'] ?? '');
    $lastName        = trim($input['lastName'] ?? '');
    $email           = trim($input['email'] ?? '');
    $cellphone       = trim($input['cellphone'] ?? '');
    $whatsapp        = trim($input['whatsapp'] ?? '');
    $idNumber        = trim($input['idNumber'] ?? '');
    $selectedPackage = trim($input['selectedPackage'] ?? '');
    $packagePrice    = trim($input['packagePrice'] ?? '');

    // Validation
    if (!$firstName || !$lastName || !$email || !$cellphone || !$selectedPackage) {
        json_response([
            'error' => 'First name, last name, email, cellphone, and package are required.'
        ], 400);
    }

    $timestamp = get_timestamp();
    $id = 'HCN-' . time() . '-' . strtoupper(substr(str_shuffle('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'), 0, 4));
    $fullName = trim(($title ? $title . ' ' : '') . $firstName . ' ' . $lastName);

    // ────── Store locally (optional, if you want a backup) ──────
    $data_dir = __DIR__ . '/data';
    if (!is_dir($data_dir)) {
        mkdir($data_dir, 0755, true);
    }

    $leads_file = $data_dir . '/homeconnect-leads.json';
    $leads = file_exists($leads_file) ? json_decode(file_get_contents($leads_file), true) : [];

    $lead = [
        'id' => $id,
        'submittedAt' => $timestamp,
        'status' => 'new',
        'fullName' => $fullName,
        'title' => $title,
        'firstName' => $firstName,
        'lastName' => $lastName,
        'email' => $email,
        'cellphone' => $cellphone,
        'whatsapp' => $whatsapp,
        'idNumber' => $idNumber,
        'selectedPackage' => $selectedPackage,
        'packagePrice' => $packagePrice,
    ];

    $leads[] = $lead;
    file_put_contents($leads_file, json_encode($leads, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));

    // ────── Customer confirmation email ──────
    $cust_html = "
<div style=\"font-family:Inter,sans-serif;max-width:600px;margin:0 auto;background:#f0faf8;padding:32px;border-radius:12px;\">
  <div style=\"background:#00695C;color:#fff;padding:24px 32px;border-radius:8px 8px 0 0;margin:-32px -32px 24px;\">
    <h1 style=\"margin:0;font-size:20px;\">Application Received</h1>
    <p style=\"margin:4px 0 0;opacity:0.75;font-size:13px;\">{$timestamp}</p>
  </div>
  <p>Hi <strong>{$fullName}</strong>,</p>
  <p>Thank you for your Home Connect application with Onea Africa. We have received your submission.</p>
  <div style=\"background:#fff;border-radius:8px;border:1px solid #b2dfdb;padding:16px;margin:20px 0;\">
    <p style=\"margin:0 0 6px;font-size:12px;color:#666;\">Reference Number</p>
    <p style=\"margin:0;font-size:20px;font-weight:700;color:#00695C;\">{$id}</p>
    <p style=\"margin:10px 0 4px;font-size:12px;color:#666;\">Selected Package</p>
    <p style=\"margin:0;font-size:16px;font-weight:600;color:#1a1a1a;\">{$selectedPackage} — R{$packagePrice}/month</p>
  </div>
  <div style=\"background:#e0f2f1;border-left:4px solid #00695C;padding:12px 16px;border-radius:4px;font-size:13px;margin:16px 0;\">
    A Onea Africa consultant will contact you shortly to complete your application.
  </div>
  <p style=\"color:#888;font-size:12px;margin-top:24px;\">Onea Africa (Pty) Ltd · sales@onea.co.za · +27 69 464 4663</p>
</div>";

    send_email(
        $email,
        "Your Home Connect Application — {$id}",
        $cust_html,
        'Onea Africa',
        'sales@onea.co.za'
    );

    // ────── Admin notification email ──────
    $table_rows = "
    <tr><td style=\"padding:8px 0;color:#555;width:140px;border-bottom:1px solid #e0f2f1;\"><strong>Full Name</strong></td><td style=\"padding:8px 0;border-bottom:1px solid #e0f2f1;\">{$fullName}</td></tr>
    <tr><td style=\"padding:8px 0;color:#555;border-bottom:1px solid #e0f2f1;\"><strong>ID/Passport</strong></td><td style=\"padding:8px 0;border-bottom:1px solid #e0f2f1;\">{$idNumber}</td></tr>
    <tr><td style=\"padding:8px 0;color:#555;border-bottom:1px solid #e0f2f1;\"><strong>Cellphone</strong></td><td style=\"padding:8px 0;border-bottom:1px solid #e0f2f1;\">{$cellphone}</td></tr>
    <tr><td style=\"padding:8px 0;color:#555;border-bottom:1px solid #e0f2f1;\"><strong>WhatsApp</strong></td><td style=\"padding:8px 0;border-bottom:1px solid #e0f2f1;\">" . ($whatsapp ?: 'N/A') . "</td></tr>
    <tr><td style=\"padding:8px 0;color:#555;border-bottom:1px solid #e0f2f1;\"><strong>Email</strong></td><td style=\"padding:8px 0;border-bottom:1px solid #e0f2f1;\">{$email}</td></tr>
    <tr><td style=\"padding:8px 0;color:#555;border-bottom:1px solid #e0f2f1;\"><strong>Package</strong></td><td style=\"padding:8px 0;border-bottom:1px solid #e0f2f1;\">{$selectedPackage}</td></tr>
    <tr><td style=\"padding:8px 0;color:#555;border-bottom:1px solid #e0f2f1;\"><strong>Monthly Fee</strong></td><td style=\"padding:8px 0;border-bottom:1px solid #e0f2f1;\">R {$packagePrice}</td></tr>";

    $admin_html = "
<div style=\"font-family:Inter,sans-serif;max-width:600px;margin:0 auto;background:#f0faf8;padding:32px;border-radius:12px;\">
  <div style=\"background:#00695C;color:#fff;padding:24px 32px;border-radius:8px 8px 0 0;margin:-32px -32px 24px;\">
    <h1 style=\"margin:0;font-size:20px;\">New Home Connect Lead</h1>
    <p style=\"margin:4px 0 0;opacity:0.75;font-size:13px;\">{$timestamp} · {$id}</p>
  </div>
  <table style=\"width:100%;border-collapse:collapse;font-size:14px;margin-top:16px;\">
    {$table_rows}
  </table>
  <div style=\"margin-top:20px;\">
    <a href=\"mailto:{$email}\" style=\"display:inline-block;background:#00695C;color:#fff;padding:10px 24px;border-radius:100px;font-weight:700;text-decoration:none;\">Reply to Applicant</a>
  </div>
  <p style=\"color:#888;font-size:12px;margin-top:24px;\">Lead stored in admin dashboard.</p>
</div>";

    send_email(
        'sales@onea.co.za',
        "New Home Connect Lead — {$fullName} — {$id}",
        $admin_html,
        'Onea Africa Applications',
        $email
    );

    log_message('[HOMECONNECT]', "✓ {$id} — {$fullName}");

    json_response([
        'message' => 'Application submitted successfully.',
        'id' => $id,
    ], 201);

} catch (Exception $e) {
    log_message('[HOMECONNECT] ERROR', $e->getMessage());
    json_response([
        'error' => 'Something went wrong. Please contact sales@onea.co.za.',
    ], 500);
}
