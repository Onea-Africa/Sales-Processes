require('dotenv').config();
const express    = require('express');
const router     = express.Router();
const nodemailer = require('nodemailer');
const axios      = require('axios');

// ---------- email transporter ----------
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
    console.log('[APPLICATIONS] Using SMTP:', process.env.SMTP_USER);
  } else {
    const test = await nodemailer.createTestAccount();
    _transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: { user: test.user, pass: test.pass },
    });
    console.log('[APPLICATIONS] No SMTP — using Ethereal test inbox');
    console.log('[APPLICATIONS] Preview at: https://ethereal.email  user:', test.user, '  pass:', test.pass);
  }
  return _transporter;
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

// ---------- POST /api/applications ----------
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, area, intro, linkedin, source, recaptchaToken } = req.body;

    if (!name || !email || !phone || !area || !intro) {
      return res.status(400).json({ error: 'Name, email, phone number, area of interest and introduction are required.' });
    }

    const captcha = await verifyRecaptcha(recaptchaToken);
    if (captcha.success === false || (captcha.score !== undefined && captcha.score < 0.5)) {
      return res.status(400).json({ error: 'reCAPTCHA check failed. Please try again.' });
    }

    const timestamp = new Date().toLocaleString('en-ZA', { timeZone: 'Africa/Johannesburg' });

    const transporter = await getTransporter();
    const info = await transporter.sendMail({
      from:    `"Onea Africa Careers" <${process.env.SMTP_USER || 'noreply@onea.africa'}>`,
      to:      'hr@onea.co.za',
      replyTo: email,
      subject: `Speculative Application — ${name} — ${area}`,
      html: `
        <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;background:#f8fbec;padding:32px;border-radius:12px;">
          <div style="background:#8CC444;color:#102000;padding:24px 32px;border-radius:8px 8px 0 0;margin:-32px -32px 24px;">
            <h1 style="margin:0;font-size:22px;">Speculative Application</h1>
            <p style="margin:6px 0 0;opacity:0.7;font-size:13px;">${timestamp}</p>
          </div>

          <table style="width:100%;border-collapse:collapse;font-size:15px;">
            <tr style="background:#fff;">
              <td style="padding:12px 16px;color:#424938;width:160px;font-weight:700;border-bottom:1px solid #e8eee1;">Full Name</td>
              <td style="padding:12px 16px;border-bottom:1px solid #e8eee1;">${name}</td>
            </tr>
            <tr>
              <td style="padding:12px 16px;color:#424938;font-weight:700;border-bottom:1px solid #e8eee1;">Email</td>
              <td style="padding:12px 16px;border-bottom:1px solid #e8eee1;"><a href="mailto:${email}" style="color:#8CC444;">${email}</a></td>
            </tr>
            <tr style="background:#fff;">
              <td style="padding:12px 16px;color:#424938;font-weight:700;border-bottom:1px solid #e8eee1;">Phone</td>
              <td style="padding:12px 16px;border-bottom:1px solid #e8eee1;"><a href="tel:${phone}" style="color:#8CC444;">${phone}</a></td>
            </tr>
            <tr>
              <td style="padding:12px 16px;color:#424938;font-weight:700;border-bottom:1px solid #e8eee1;">Area of Interest</td>
              <td style="padding:12px 16px;border-bottom:1px solid #e8eee1;">
                <span style="background:#8CC444;color:#102000;padding:4px 12px;border-radius:100px;font-size:13px;font-weight:700;">${area}</span>
              </td>
            </tr>
            <tr style="background:#fff;">
              <td style="padding:12px 16px;color:#424938;font-weight:700;border-bottom:1px solid #e8eee1;vertical-align:top;">Introduction</td>
              <td style="padding:12px 16px;border-bottom:1px solid #e8eee1;white-space:pre-wrap;">${intro}</td>
            </tr>
            <tr>
              <td style="padding:12px 16px;color:#424938;font-weight:700;border-bottom:1px solid #e8eee1;">LinkedIn</td>
              <td style="padding:12px 16px;border-bottom:1px solid #e8eee1;">
                ${linkedin ? `<a href="${linkedin}" style="color:#8CC444;">${linkedin}</a>` : '—'}
              </td>
            </tr>
            <tr style="background:#fff;">
              <td style="padding:12px 16px;color:#424938;font-weight:700;">Heard About Us</td>
              <td style="padding:12px 16px;">${source || '—'}</td>
            </tr>
          </table>

          <div style="margin-top:24px;padding:16px;background:#fff;border-radius:8px;border:1px solid #d9dbcd;">
            <a href="mailto:${email}" style="display:inline-block;background:#8CC444;color:#102000;padding:10px 24px;border-radius:100px;font-weight:700;text-decoration:none;margin-right:8px;">Reply to Applicant</a>
            ${linkedin ? `<a href="${linkedin}" style="display:inline-block;background:#0A66C2;color:#fff;padding:10px 24px;border-radius:100px;font-weight:700;text-decoration:none;">View LinkedIn</a>` : ''}
          </div>

          <div style="margin-top:16px;font-size:12px;color:#888;">
            Onea Africa (Pty) Ltd · hr@onea.co.za · Pretoria, Gauteng
          </div>
        </div>`,
    });

    const preview = nodemailer.getTestMessageUrl(info);
    if (preview) {
      console.log('[APPLICATIONS] ✓ Preview URL:', preview);
    } else {
      console.log('[APPLICATIONS] ✓ Email sent to hr@onea.co.za for', name, '—', area);
    }

    res.status(201).json({
      message: "Thank you for your interest in joining Onea Africa. We'll be in touch if a suitable opportunity arises.",
      ...(preview ? { _previewUrl: preview } : {}),
    });

  } catch (err) {
    console.error('[APPLICATIONS] Error:', err);
    res.status(500).json({
      error: 'Something went wrong. Please email hr@onea.co.za directly.',
    });
  }
});

module.exports = router;
