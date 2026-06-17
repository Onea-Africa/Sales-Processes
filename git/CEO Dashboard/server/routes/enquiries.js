require('dotenv').config();
const express    = require('express');
const router     = express.Router();
const nodemailer = require('nodemailer');
const axios      = require('axios');

// ---------- email transporter ----------
let _transporter = null;

async function getTransporter() {
  if (_transporter) return _transporter;

  const smtpPass = (process.env.SMTP_PASS || '').replace(/\s+/g, '');
  if (process.env.SMTP_HOST && process.env.SMTP_USER && smtpPass) {
    if (smtpPass !== (process.env.SMTP_PASS || '')) {
      console.log('[EMAIL] Normalized SMTP_PASS whitespace for transport');
    }
    _transporter = nodemailer.createTransport({
      host:   process.env.SMTP_HOST,
      port:   parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth:   { user: process.env.SMTP_USER, pass: smtpPass },
    });
    console.log('[EMAIL] Using Gmail SMTP:', process.env.SMTP_USER);
  } else {
    const test = await nodemailer.createTestAccount();
    _transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: { user: test.user, pass: test.pass },
    });
    console.log('[EMAIL] No SMTP configured — using Ethereal test inbox');
    console.log('[EMAIL] Preview at: https://ethereal.email  user:', test.user, '  pass:', test.pass);
  }
  return _transporter;
}

// ---------- Google Sheets ----------
async function appendToSheet(row) {
  const id    = process.env.GOOGLE_SHEETS_ID;
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const key   = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;

  if (!id || !email || !key) {
    console.log('[SHEETS] Not fully configured — skipping (missing:', !id ? 'SHEETS_ID' : !email ? 'SA_EMAIL' : 'SA_KEY', ')');
    return;
  }

  try {
    const { google } = require('googleapis');
    const parsedKey = key.includes('\\n') ? key.replace(/\\n/g, '\n') : key;
    const auth = new google.auth.GoogleAuth({
      credentials: { client_email: email, private_key: parsedKey },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const sheets = google.sheets({ version: 'v4', auth });
    await sheets.spreadsheets.values.append({
      spreadsheetId: id,
      range: 'Web Enquiries!A:H',
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [row] },
    });
    console.log('[SHEETS] ✓ Row appended to Enquiries tab');
  } catch (err) {
    console.error('[SHEETS] Append failed:', err.message);
  }
}

// ---------- WhatsApp (CallMeBot) ----------
async function sendWhatsApp(text) {
  const to     = process.env.WHATSAPP_TO;
  const apiKey = process.env.WHATSAPP_CALLMEBOT_APIKEY;

  if (!to || !apiKey) {
    console.log('[WHATSAPP] Not configured — skipping (set WHATSAPP_TO + WHATSAPP_CALLMEBOT_APIKEY)');
    return;
  }

  try {
    const url = `https://api.callmebot.com/whatsapp.php?phone=${encodeURIComponent(to)}&text=${encodeURIComponent(text)}&apikey=${apiKey}`;
    await axios.get(url, { timeout: 8000 });
    console.log('[WHATSAPP] ✓ Notification sent to', to);
  } catch (err) {
    console.error('[WHATSAPP] Failed:', err.message);
  }
}

// ---------- reCAPTCHA ----------
async function verifyRecaptcha(token) {
  if (!process.env.RECAPTCHA_SECRET_KEY || !token) return { success: true, score: 1 };
  try {
    const res = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${token}`,
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

    if (!name || !email || !phone || !service) {
      return res.status(400).json({ error: 'Name, email, contact number and service are required.' });
    }

    // reCAPTCHA
    const captcha = await verifyRecaptcha(recaptchaToken);
    if (captcha.success === false || (captcha.score !== undefined && captcha.score < 0.5)) {
      return res.status(400).json({ error: 'reCAPTCHA check failed. Please try again.' });
    }

    const timestamp = new Date().toLocaleString('en-ZA', { timeZone: 'Africa/Johannesburg' });

    // --- MongoDB (optional) ---
    try {
      const Enquiry = require('../models/Enquiry');
      await Enquiry.create({ name, email, phone, company, service, message,
        serviceInterest: 'general', recaptchaScore: captcha.score || null });
      console.log('[DB] Enquiry saved to MongoDB');
    } catch (dbErr) {
      console.log('[DB] MongoDB skip:', dbErr.message.slice(0, 60));
    }

    // --- Google Sheets ---
    await appendToSheet([
      timestamp, name, email, phone,
      company || '', service, message || '', captcha.score || 'n/a',
    ]);

    // --- Email notification ---
    const transporter = await getTransporter();
    const info = await transporter.sendMail({
      from:    `"Onea Africa Website" <${process.env.SMTP_USER || 'noreply@onea.africa'}>`,
      to:      process.env.NOTIFICATION_EMAIL || 'connect@onea.co.za',
      subject: `New Enquiry — ${service} from ${name}${company ? ` (${company})` : ''}`,
      html: `
        <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;background:#f8fbec;padding:32px;border-radius:12px;">
          <div style="background:#8CC444;color:#102000;padding:24px 32px;border-radius:8px 8px 0 0;margin:-32px -32px 24px;">
            <h1 style="margin:0;font-size:22px;">New Enquiry — Onea Africa</h1>
            <p style="margin:6px 0 0;opacity:0.7;font-size:13px;">${timestamp}</p>
          </div>
          <table style="width:100%;border-collapse:collapse;font-size:15px;">
            <tr><td style="padding:10px 0;color:#424938;width:140px;"><strong>Name</strong></td><td>${name}</td></tr>
            <tr><td style="padding:10px 0;color:#424938;"><strong>Email</strong></td><td><a href="mailto:${email}" style="color:#8CC444;">${email}</a></td></tr>
            <tr><td style="padding:10px 0;color:#424938;"><strong>Phone</strong></td><td><a href="tel:${phone}" style="color:#8CC444;">${phone}</a></td></tr>
            <tr><td style="padding:10px 0;color:#424938;"><strong>Company</strong></td><td>${company || '—'}</td></tr>
            <tr><td style="padding:10px 0;color:#424938;"><strong>Service</strong></td>
              <td><span style="background:#8CC444;color:#102000;padding:4px 12px;border-radius:100px;font-size:13px;font-weight:700;">${service}</span></td></tr>
            <tr><td style="padding:10px 0;color:#424938;vertical-align:top;"><strong>Message</strong></td>
              <td style="white-space:pre-wrap;">${message || '—'}</td></tr>
          </table>
          <div style="margin-top:24px;padding:16px;background:#fff;border-radius:8px;border:1px solid #d9dbcd;">
            <a href="mailto:${email}" style="display:inline-block;background:#8CC444;color:#102000;padding:10px 24px;border-radius:100px;font-weight:700;text-decoration:none;margin-right:8px;">Reply by Email</a>
            <a href="https://wa.me/${phone.replace(/\D/g,'')}" style="display:inline-block;background:#25D366;color:#fff;padding:10px 24px;border-radius:100px;font-weight:700;text-decoration:none;">WhatsApp</a>
          </div>
          <div style="margin-top:16px;font-size:12px;color:#888;">
            Onea Africa (Pty) Ltd · connect@onea.co.za · +27 69 464 4663
          </div>
        </div>`,
    });

    const preview = nodemailer.getTestMessageUrl(info);
    if (preview) {
      console.log('[EMAIL] ✓ Preview URL:', preview);
    } else {
      console.log('[EMAIL] ✓ Sent to', process.env.NOTIFICATION_EMAIL || 'connect@onea.co.za');
    }

    // --- WhatsApp notification ---
    const waText = `🔔 New Onea Enquiry\n📋 ${service}\n👤 ${name}${company ? ` (${company})` : ''}\n📧 ${email}\n📞 ${phone}${message ? `\n💬 ${message.slice(0, 100)}` : ''}`;
    await sendWhatsApp(waText);

    res.status(201).json({
      message: "Thank you! We've received your enquiry and will be in touch within 24 hours.",
      ...(preview ? { _previewUrl: preview } : {}),
    });

  } catch (err) {
    console.error('[ENQUIRY] Error:', err);
    res.status(500).json({
      error: 'Something went wrong. Please email us at connect@onea.co.za or WhatsApp +27 69 464 4663.',
    });
  }
});

module.exports = router;
