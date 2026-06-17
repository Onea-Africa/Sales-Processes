require('dotenv').config();
const express    = require('express');
const router     = express.Router();
const nodemailer = require('nodemailer');
const path       = require('path');
const fs         = require('fs');

// ── Storage ──────────────────────────────────────────────────────────────────
const DATA_DIR  = path.join(__dirname, '../data');
const PDF_DIR   = path.join(DATA_DIR, 'pdfs');
const APPS_FILE = path.join(DATA_DIR, 'telkom-applications.json');

[DATA_DIR, PDF_DIR].forEach(d => { if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true }); });

function readApps()      { try { return JSON.parse(fs.readFileSync(APPS_FILE, 'utf-8')); } catch { return []; } }
function writeApps(apps) { fs.writeFileSync(APPS_FILE, JSON.stringify(apps, null, 2)); }

// ── Email transporter ────────────────────────────────────────────────────────
let _t = null;
async function transporter() {
  if (_t) return _t;
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    _t = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
  } else {
    const test = await nodemailer.createTestAccount();
    _t = nodemailer.createTransport({ host:'smtp.ethereal.email', port:587, auth:{ user:test.user, pass:test.pass } });
    console.log('[TELKOM] Ethereal:', test.user);
  }
  return _t;
}

// ── PDF generation ────────────────────────────────────────────────────────────
async function generatePDF(app) {
  let PDFDoc;
  try { PDFDoc = require('pdfkit'); } catch { return null; }

  return new Promise((resolve) => {
    const doc  = new PDFDoc({ margin:50, size:'A4' });
    const file = path.join(PDF_DIR, `telkom-${app.id}.pdf`);
    const out  = fs.createWriteStream(file);
    doc.pipe(out);

    const G = '#8CC444', DARK = '#102000', GREY = '#555555', LGREY = '#888888';
    const W = doc.page.width, M = 50;
    let y = 0;

    const safeText = (value, fallback = 'N/A') => {
      if (value === undefined || value === null || value === '') {
        return fallback;
      }
      return String(value);
    };

    const yesNo = (value) => {
      if (value === 'yes') return 'Yes';
      if (value === 'no') return 'No';
      return 'N/A';
    };

    const money = (value) => {
      if (value === undefined || value === null || value === '') {
        return 'N/A';
      }
      return `R ${value}`;
    };

    // Header bar
    doc.rect(0, 0, W, 88).fill(G);
    const logo = path.join(__dirname, '../../public/logo.png');
    if (fs.existsSync(logo)) {
      try { doc.image(logo, M, 14, { height:52 }); } catch { /* skip */ }
    }
    doc.fillColor('white').fontSize(9).font('Helvetica').text('CONSUMER APPLICATION FORM', W - 220, 24, { width:170, align:'right' });
    doc.fontSize(14).font('Helvetica-Bold').text('Telkom Fibre & LTE Services', W - 220, 38, { width:170, align:'right' });
    doc.fontSize(9).font('Helvetica').fillColor('white').text(`Ref: ${app.id}`, W - 220, 58, { width:170, align:'right' });
    doc.text(`Date: ${app.submittedAt}`, W - 220, 70, { width:170, align:'right' });
    y = 108;

    const section = (title) => {
      if (y > doc.page.height - 120) { doc.addPage(); y = 40; }
      doc.rect(M, y, W - M*2, 26).fill('#f0f7e6');
      doc.fillColor(G).fontSize(10).font('Helvetica-Bold').text(title, M + 8, y + 8);
      y += 34;
    };

    const row = (label, value) => {
      if (y > doc.page.height - 60) { doc.addPage(); y = 40; }
      doc.fillColor(GREY).fontSize(9).font('Helvetica').text(label, M, y, { width:155 });
      doc.fillColor(DARK).fontSize(9).font('Helvetica').text(safeText(value, '—'), M + 160, y, { width: W - M*2 - 160 });
      y += 18;
    };

    const sig = (label, dataUrl) => {
      if (!dataUrl || !dataUrl.startsWith('data:')) return;
      if (y > doc.page.height - 140) { doc.addPage(); y = 40; }
      doc.fillColor(LGREY).fontSize(8).font('Helvetica').text(label, M, y); y += 12;
      try {
        const buf = Buffer.from(dataUrl.split(',')[1], 'base64');
        doc.image(buf, M, y, { width:200, height:75 });
      } catch { /* skip */ }
      y += 85;
      doc.moveTo(M, y).lineTo(M + 200, y).strokeColor('#cccccc').lineWidth(0.5).stroke(); y += 12;
    };

    // ── Section 1
    section('SECTION 1 — CUSTOMER DETAILS');
    row('Existing Customer',  yesNo(app.isExistingCustomer));
    row('Full Names',         safeText(app.fullName));
    row('ID / Passport No.',  safeText(app.idNumber));
    row('Mobile Number',      safeText(app.mobile));
    row('Alternative Number', safeText(app.altNumber, 'N/A'));
    row('Email Address',      safeText(app.email));
    row('Physical Address',   safeText(app.physicalAddress));
    row('Postal Address',     safeText(app.postalAddress, 'Same as physical'));
    row('Delivery Address',   safeText(app.deliveryAddress, 'Same as physical'));
    row('Coverage Checked',   yesNo(app.coverageChecked));
    y += 6;

    // ── Section 2
    section('SECTION 2 — EMPLOYMENT DETAILS');
    row('Employer / Company', safeText(app.employerName));
    row('Employer Contact',   safeText(app.employerPhone));
    row('Employer Address',   safeText(app.employerAddress));
    row('Gross Monthly Income', money(app.grossIncome));
    row('Net Monthly Income',   money(app.netIncome));
    row('Household Income',     money(app.householdIncome));
    y += 6;

    // ── Section 3
    section('SECTION 3 — PAYMENT CONSENT');
    row('Debit Notice Acknowledged', yesNo(app.ackDebit));
    row('Debit Order Consent',       yesNo(app.debitConsent));
    row('Processing Consent',        yesNo(app.procConsent));
    row('Signature Date',            safeText(app.sig1Date));
    y += 4;
    sig('Customer Signature — Confirms Sections 1 to 3', app.sig1);

    // ── Section 4
    section('SECTION 4 — SERVICE SELECTION');
    row('Service Type',       app.serviceType ? (app.serviceType === 'fibre' ? 'Fibre' : app.serviceType === 'lte' ? 'LTE' : safeText(app.serviceType, 'N/A')) : 'N/A');
    row('Selected Package',   safeText(app.selectedPackage));
    row('Monthly Price',      app.packagePrice ? `R ${app.packagePrice}/month` : 'N/A');
    row('Activation Date',    safeText(app.activationDate));
    row('Existing Line',      yesNo(app.hasExistingLine));
    row('Router Required',    yesNo(app.requiresRouter));
    row('Signature Date',     safeText(app.sig2Date));
    y += 4;
    sig('Customer Signature — Confirms Package Selection', app.sig2);

    // ── Section 5
    section('SECTION 5 — AGREEMENT & TERMS');
    row('Terms & Conditions Accepted', yesNo(app.agreeTerms));
    row('Debit Order Obligation',      yesNo(app.agreeDebit));
    row('Cancellation Policy Accepted', yesNo(app.agreeCancellation));
    row('POPIA Consent',               yesNo(app.agreePOPIA));
    row('Final Signature Date',        safeText(app.sig3Date));
    y += 4;
    sig('FINAL BINDING SIGNATURE — Confirms entire application', app.sig3);

    // Footer
    const fh = doc.page.height;
    doc.rect(0, fh - 42, W, 42).fill('#f0f7e6');
    doc.fillColor(LGREY).fontSize(8).font('Helvetica')
      .text('Onea Africa (Pty) Ltd  ·  sales@onea.co.za  ·  +27 69 464 4663  ·  www.onea.africa', M, fh - 28, { align:'center', width: W - M*2 })
      .text(`Application submitted electronically — ${app.submittedAt}`, M, fh - 16, { align:'center', width: W - M*2 });

    doc.end();
    out.on('finish', () => resolve(file));
    out.on('error',  () => resolve(null));
  });
}

// ── POST /api/telkom-applications ────────────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const body = req.body;
    if (!body.fullName || !body.email || !body.mobile) {
      return res.status(400).json({ error: 'Full name, email and mobile number are required.' });
    }

    const id          = `TLK-${Date.now()}-${Math.random().toString(36).slice(2,6).toUpperCase()}`;
    const submittedAt = new Date().toLocaleString('en-ZA', { timeZone:'Africa/Johannesburg' });

    const application = { id, submittedAt, status:'pending', ...body };

    // Save (strip large base64 images from stored JSON)
    const toStore = { ...application, sig1:'[stored in PDF]', sig2:'[stored in PDF]', sig3:'[stored in PDF]' };
    const apps = readApps();
    apps.push(toStore);
    writeApps(apps);

    // Generate PDF
    let pdfPath = null;
    try { pdfPath = await generatePDF(application); }
    catch (e) { console.warn('[TELKOM] PDF error:', e.message); }

    // Send emails
    try {
      const t = await transporter();
      const attach = pdfPath ? [{ filename:`Onea-Telkom-${id}.pdf`, path:pdfPath }] : [];

      const custHtml = `
        <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;background:#f8fbec;padding:32px;border-radius:12px;">
          <div style="background:#8CC444;color:#102000;padding:24px 32px;border-radius:8px 8px 0 0;margin:-32px -32px 24px;">
            <h1 style="margin:0;font-size:20px;">Application Received</h1>
            <p style="margin:4px 0 0;opacity:0.7;font-size:13px;">${submittedAt}</p>
          </div>
          <p>Hi <strong>${body.fullName}</strong>,</p>
          <p>Thank you for your Telkom service application with Onea Africa. We have received your submission successfully.</p>
          <div style="background:#fff;border-radius:8px;border:1px solid #d9dbcd;padding:16px;margin:20px 0;">
            <p style="margin:0 0 8px;font-size:13px;color:#666;">Application Reference</p>
            <p style="margin:0;font-size:20px;font-weight:700;color:#102000;">${id}</p>
          </div>
          <p><strong>Package:</strong> ${body.selectedPackage} — R${body.packagePrice}/month</p>
          <p style="background:#8CC444/10;border-left:4px solid #8CC444;padding:12px 16px;border-radius:4px;font-size:13px;">
            A consultant will contact you within <strong>1–2 business days</strong> to complete verification and debit order setup.
          </p>
          <p style="margin-top:20px;font-size:13px;">Your signed agreement is attached to this email for your records.</p>
          <p style="color:#888;font-size:12px;margin-top:24px;">Onea Africa (Pty) Ltd · sales@onea.co.za · +27 69 464 4663</p>
        </div>`;

      const adminHtml = `
        <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;background:#f8fbec;padding:32px;border-radius:12px;">
          <div style="background:#8CC444;color:#102000;padding:24px 32px;border-radius:8px 8px 0 0;margin:-32px -32px 24px;">
            <h1 style="margin:0;font-size:20px;">New Telkom Application</h1>
            <p style="margin:4px 0 0;opacity:0.7;font-size:13px;">${submittedAt} · ${id}</p>
          </div>
          <table style="width:100%;border-collapse:collapse;font-size:14px;margin-top:16px;">
            ${[
              ['Full Name',    body.fullName],
              ['ID/Passport',  body.idNumber],
              ['Mobile',       body.mobile],
              ['Email',        body.email],
              ['Address',      body.physicalAddress],
              ['Employer',     body.employerName || 'N/A'],
              ['Net Income',   body.netIncome ? `R ${body.netIncome}` : 'N/A'],
              ['Package',      body.selectedPackage],
              ['Monthly Fee',  `R ${body.packagePrice}`],
              ['Activation',   body.activationDate],
              ['Service Type', body.serviceType],
              ['Router Needed',body.requiresRouter === 'yes' ? 'Yes' : 'No'],
            ].map(([l,v]) => `<tr><td style="padding:8px 0;color:#666;width:150px;border-bottom:1px solid #e8eee1;"><strong>${l}</strong></td><td style="padding:8px 0;border-bottom:1px solid #e8eee1;">${v}</td></tr>`).join('')}
          </table>
          <div style="margin-top:20px;">
            <a href="mailto:${body.email}" style="display:inline-block;background:#8CC444;color:#102000;padding:10px 24px;border-radius:100px;font-weight:700;text-decoration:none;margin-right:8px;">Reply to Applicant</a>
          </div>
          <p style="color:#888;font-size:12px;margin-top:24px;">Signed PDF attached. Sent to sales@onea.co.za.</p>
        </div>`;

      await Promise.allSettled([
        t.sendMail({ from:`"Onea Africa" <${process.env.SMTP_USER || 'noreply@onea.africa'}>`, to:body.email, replyTo:'sales@onea.co.za', subject:`Your Telkom Application — ${id}`, html:custHtml, attachments:attach }),
        t.sendMail({ from:`"Onea Africa Applications" <${process.env.SMTP_USER || 'noreply@onea.africa'}>`, to:'sales@onea.co.za', replyTo:body.email, subject:`New Telkom Application — ${body.fullName} — ${id}`, html:adminHtml, attachments:attach }),
      ]);
      console.log(`[TELKOM] ✓ ${id} — emails sent`);
    } catch (e) {
      console.warn('[TELKOM] Email failed:', e.message);
    }

    res.status(201).json({ message:'Application submitted successfully.', id });
  } catch (err) {
    console.error('[TELKOM] Error:', err);
    res.status(500).json({ error:'Something went wrong. Please contact hr@onea.co.za.' });
  }
});

// ── GET /api/telkom-applications — admin list ────────────────────────────────
router.get('/', (req, res) => {
  const key = req.headers['x-admin-key'];
  if (key !== (process.env.ADMIN_KEY || 'onea-admin-2025')) {
    return res.status(401).json({ error:'Unauthorized' });
  }
  const apps = readApps().map(a => ({
    id:a.id, submittedAt:a.submittedAt, status:a.status,
    fullName:a.fullName, email:a.email, mobile:a.mobile,
    selectedPackage:a.selectedPackage, packagePrice:a.packagePrice,
    serviceType:a.serviceType, activationDate:a.activationDate,
  }));
  res.json(apps.reverse()); // newest first
});

module.exports = router;
