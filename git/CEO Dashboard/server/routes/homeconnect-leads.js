require('dotenv').config();
const express    = require('express');
const router     = express.Router();
const nodemailer = require('nodemailer');
const path       = require('path');
const fs         = require('fs');

// ── Storage ───────────────────────────────────────────────────────────────────
const DATA_DIR   = path.join(__dirname, '../data');
const LEADS_FILE = path.join(DATA_DIR, 'homeconnect-leads.json');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

function readLeads()       { try { return JSON.parse(fs.readFileSync(LEADS_FILE, 'utf-8')); } catch { return []; } }
function writeLeads(leads) { fs.writeFileSync(LEADS_FILE, JSON.stringify(leads, null, 2)); }

// ── Email transporter ─────────────────────────────────────────────────────────
let _t = null;
async function transporter() {
  if (_t) return _t;
  const smtpPass = (process.env.SMTP_PASS || '').replace(/\s+/g, '');
  if (process.env.SMTP_HOST && process.env.SMTP_USER && smtpPass) {
    if (smtpPass !== (process.env.SMTP_PASS || '')) {
      console.log('[HOMECONNECT] Normalized SMTP_PASS whitespace for transport');
    }
    _t = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: { user: process.env.SMTP_USER, pass: smtpPass },
    });
  } else {
    const test = await nodemailer.createTestAccount();
    _t = nodemailer.createTransport({ host:'smtp.ethereal.email', port:587, auth:{ user:test.user, pass:test.pass } });
    console.log('[HOMECONNECT] Ethereal:', test.user);
  }
  return _t;
}

// ── POST /api/homeconnect-leads ───────────────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const b = req.body;
    if (!b.firstName || !b.lastName || !b.email || !b.cellphone || !b.selectedPackage) {
      return res.status(400).json({ error: 'First name, last name, email, cellphone, and package are required.' });
    }

    const id          = `HCN-${Date.now()}-${Math.random().toString(36).slice(2,6).toUpperCase()}`;
    const submittedAt = new Date().toLocaleString('en-ZA', { timeZone: 'Africa/Johannesburg' });
    const fullName    = `${b.title ? b.title + ' ' : ''}${b.firstName} ${b.lastName}`.trim();

    const lead = { id, submittedAt, status: 'new', fullName, ...b };
    const leads = readLeads();
    leads.push(lead);
    writeLeads(leads);

    // ── Emails ────────────────────────────────────────────────────────────────
    try {
      const t = await transporter();

      const custHtml = `
        <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;background:#f0faf8;padding:32px;border-radius:12px;">
          <div style="background:#00695C;color:#fff;padding:24px 32px;border-radius:8px 8px 0 0;margin:-32px -32px 24px;">
            <h1 style="margin:0;font-size:20px;">Application Received</h1>
            <p style="margin:4px 0 0;opacity:0.75;font-size:13px;">${submittedAt}</p>
          </div>
          <p>Hi <strong>${fullName}</strong>,</p>
          <p>Thank you for your Home Connect application with Onea Africa. We have received your submission.</p>
          <div style="background:#fff;border-radius:8px;border:1px solid #b2dfdb;padding:16px;margin:20px 0;">
            <p style="margin:0 0 6px;font-size:12px;color:#666;">Reference Number</p>
            <p style="margin:0;font-size:20px;font-weight:700;color:#00695C;">${id}</p>
            <p style="margin:10px 0 4px;font-size:12px;color:#666;">Selected Package</p>
            <p style="margin:0;font-size:16px;font-weight:600;color:#1a1a1a;">${b.selectedPackage} — R${b.packagePrice}/month</p>
          </div>
          <div style="background:#e0f2f1;border-left:4px solid #00695C;padding:12px 16px;border-radius:4px;font-size:13px;margin:16px 0;">
            A Onea Africa consultant will contact you shortly to complete your application.
          </div>
          <p style="color:#888;font-size:12px;margin-top:24px;">Onea Africa (Pty) Ltd · sales@onea.co.za · +27 69 464 4663</p>
        </div>`;

      const adminHtml = `
        <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;background:#f0faf8;padding:32px;border-radius:12px;">
          <div style="background:#00695C;color:#fff;padding:24px 32px;border-radius:8px 8px 0 0;margin:-32px -32px 24px;">
            <h1 style="margin:0;font-size:20px;">New Home Connect Lead</h1>
            <p style="margin:4px 0 0;opacity:0.75;font-size:13px;">${submittedAt} · ${id}</p>
          </div>
          <table style="width:100%;border-collapse:collapse;font-size:14px;margin-top:16px;">
            ${[
              ['Full Name',    fullName],
              ['ID/Passport',  b.idNumber],
              ['Cellphone',    b.cellphone],
              ['WhatsApp',     b.whatsapp || 'N/A'],
              ['Email',        b.email],
              ['Package',      b.selectedPackage],
              ['Monthly Fee',  `R ${b.packagePrice}`],
            ].map(([l,v]) => `<tr>
              <td style="padding:8px 0;color:#555;width:140px;border-bottom:1px solid #e0f2f1;"><strong>${l}</strong></td>
              <td style="padding:8px 0;border-bottom:1px solid #e0f2f1;">${v}</td>
            </tr>`).join('')}
          </table>
          <div style="margin-top:20px;">
            <a href="mailto:${b.email}" style="display:inline-block;background:#00695C;color:#fff;padding:10px 24px;border-radius:100px;font-weight:700;text-decoration:none;">Reply to Applicant</a>
          </div>
          <p style="color:#888;font-size:12px;margin-top:24px;">Lead stored in admin dashboard.</p>
        </div>`;

      await Promise.allSettled([
        t.sendMail({
          from: `"Onea Africa" <${process.env.SMTP_USER || 'noreply@onea.africa'}>`,
          to: b.email,
          replyTo: 'sales@onea.co.za',
          subject: `Your Home Connect Application — ${id}`,
          html: custHtml,
        }),
        t.sendMail({
          from: `"Onea Africa Applications" <${process.env.SMTP_USER || 'noreply@onea.africa'}>`,
          to: 'sales@onea.co.za',
          replyTo: b.email,
          subject: `New Home Connect Lead — ${fullName} — ${id}`,
          html: adminHtml,
        }),
      ]);
      console.log(`[HOMECONNECT] ✓ ${id} — lead stored & emails sent`);
    } catch (e) {
      console.warn('[HOMECONNECT] Email failed:', e.message);
    }

    res.status(201).json({ message: 'Application submitted successfully.', id });
  } catch (err) {
    console.error('[HOMECONNECT] Error:', err);
    res.status(500).json({ error: 'Something went wrong. Please contact sales@onea.co.za.' });
  }
});

// ── GET /api/homeconnect-leads — admin list ───────────────────────────────────
router.get('/', (req, res) => {
  const key = req.headers['x-admin-key'];
  if (key !== (process.env.ADMIN_KEY || 'onea-admin-2025')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const leads = readLeads().map(l => ({
    id: l.id, submittedAt: l.submittedAt, status: l.status,
    fullName: l.fullName, email: l.email, cellphone: l.cellphone,
    selectedPackage: l.selectedPackage, packagePrice: l.packagePrice,
  }));
  res.json(leads.reverse());
});

module.exports = router;
