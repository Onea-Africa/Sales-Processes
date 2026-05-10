require('dotenv').config();
const express  = require('express');
const router   = express.Router();
const nodemailer = require('nodemailer');

// ---------- email transporter (real SMTP or Ethereal test fallback) ----------
let _transporter = null;

async function getTransporter() {
  if (_transporter) return _transporter;

  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    _transporter = nodemailer.createTransport({
      host:   process.env.SMTP_HOST,
      port:   parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth:   { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
    console.log('[EMAIL] Using configured SMTP:', process.env.SMTP_HOST);
  } else {
    // Ethereal — free test inbox, no credentials needed
    const test = await nodemailer.createTestAccount();
    _transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: { user: test.user, pass: test.pass },
    });
    console.log('[EMAIL] No SMTP configured — using Ethereal test inbox');
    console.log('[EMAIL] Preview emails at: https://ethereal.email/login');
    console.log('[EMAIL] Ethereal user:', test.user, '| pass:', test.pass);
  }
  return _transporter;
}

// ---------- Google Sheets ----------
async function appendToSheet(row) {
  const id    = process.env.GOOGLE_SHEETS_ID;
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const key   = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;

  if (!id || !email || !key) {
    console.log('[SHEETS] Not configured — skipping sheet append');
    return;
  }

  try {
    const { google } = require('googleapis');
    const auth = new google.auth.JWT(email, null, key.replace(/\\n/g, '\n'), [
      'https://www.googleapis.com/auth/spreadsheets',
    ]);
    const sheets = google.sheets({ version: 'v4', auth });
    await sheets.spreadsheets.values.append({
      spreadsheetId: id,
      range: 'Enquiries!A:H',
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [row] },
    });
    console.log('[SHEETS] Row appended to Enquiries tab');
  } catch (err) {
    console.error('[SHEETS] Append failed:', err.message);
  }
}

// ---------- reCAPTCHA ----------
async function verifyRecaptcha(token) {
  if (!process.env.RECAPTCHA_SECRET_KEY || !token) return { success: true, score: 1 };
  try {
    const axios = require('axios');
    const res = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${token}`
    );
    return res.data;
  } catch {
    return { success: true, score: 1 };
  }
}

// ---------- POST /api/enquiries ----------
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, company, service, message, recaptchaToken } = req.body;

    // Validate required fields
    if (!name || !email || !phone || !service) {
      return res.status(400).json({ error: 'Name, email, contact number and service are required.' });
    }

    // reCAPTCHA check
    const captcha = await verifyRecaptcha(recaptchaToken);
    if (captcha.success === false || (captcha.score !== undefined && captcha.score < 0.5)) {
      return res.status(400).json({ error: 'reCAPTCHA check failed. Please try again.' });
    }

    const timestamp = new Date().toISOString();

    // --- Save to MongoDB (optional) ---
    try {
      const Enquiry = require('../models/Enquiry');
      await Enquiry.create({ name, email, phone, company, service, message,
        serviceInterest: 'general', recaptchaScore: captcha.score || null });
      console.log('[DB] Enquiry saved to MongoDB');
    } catch (dbErr) {
      console.log('[DB] MongoDB skip (not configured or unavailable):', dbErr.message);
    }

    // --- Append to Google Sheets ---
    // Columns: Timestamp | Name | Email | Phone | Company | Service | Message | reCAPTCHA Score
    await appendToSheet([
      timestamp, name, email, phone,
      company || '', service, message || '', captcha.score || 'n/a',
    ]);

    // --- Send notification email ---
    const transporter = await getTransporter();
    const info = await transporter.sendMail({
      from: `"Onea Africa Website" <${process.env.SMTP_USER || 'noreply@onea.africa'}>`,
      to:   process.env.NOTIFICATION_EMAIL || 'connect@onea.co.za',
      subject: `New Enquiry — ${service} from ${name}${company ? ` (${company})` : ''}`,
      html: `
        <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;background:#f8fbec;padding:32px;border-radius:12px;">
          <div style="background:#416900;color:#fff;padding:24px 32px;border-radius:8px 8px 0 0;margin:-32px -32px 24px;">
            <h1 style="margin:0;font-size:22px;">New Enquiry — Onea Africa</h1>
          </div>
          <table style="width:100%;border-collapse:collapse;font-size:15px;">
            <tr><td style="padding:10px 0;color:#424938;width:160px;"><strong>Name</strong></td><td>${name}</td></tr>
            <tr><td style="padding:10px 0;color:#424938;"><strong>Email</strong></td><td><a href="mailto:${email}">${email}</a></td></tr>
            <tr><td style="padding:10px 0;color:#424938;"><strong>Phone</strong></td><td><a href="tel:${phone}">${phone}</a></td></tr>
            <tr><td style="padding:10px 0;color:#424938;"><strong>Company</strong></td><td>${company || '—'}</td></tr>
            <tr><td style="padding:10px 0;color:#424938;"><strong>Service</strong></td>
              <td><span style="background:#8CC444;color:#102000;padding:4px 12px;border-radius:100px;font-size:13px;font-weight:700;">${service}</span></td></tr>
            <tr><td style="padding:10px 0;color:#424938;vertical-align:top;"><strong>Message</strong></td>
              <td style="white-space:pre-wrap;">${message || '—'}</td></tr>
            <tr><td style="padding:10px 0;color:#ccc;font-size:12px;"><strong>Submitted</strong></td><td style="color:#ccc;font-size:12px;">${timestamp}</td></tr>
          </table>
          <div style="margin-top:24px;padding-top:16px;border-top:1px solid #d9dbcd;font-size:12px;color:#888;">
            Onea Africa (Pty) Ltd · connect@onea.co.za · +27 69 464 4663
          </div>
        </div>`,
    });

    // Log preview URL when using Ethereal
    const preview = nodemailer.getTestMessageUrl(info);
    if (preview) {
      console.log('[EMAIL] Preview URL:', preview);
    } else {
      console.log('[EMAIL] Notification sent to', process.env.NOTIFICATION_EMAIL || 'connect@onea.co.za');
    }

    res.status(201).json({
      message: "Thank you! We've received your enquiry and will be in touch within 24 hours.",
      ...(preview ? { _previewUrl: preview } : {}),
    });

  } catch (err) {
    console.error('[ENQUIRY] Error:', err);
    res.status(500).json({ error: 'Something went wrong. Please email us directly at connect@onea.co.za or WhatsApp +27 69 464 4663.' });
  }
});

module.exports = router;
