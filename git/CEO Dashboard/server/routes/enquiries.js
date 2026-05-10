const express = require('express');
const router = express.Router();
const axios = require('axios');
const nodemailer = require('nodemailer');
const Enquiry = require('../models/Enquiry');

const verifyRecaptcha = async (token) => {
  const secret = process.env.RECAPTCHA_SECRET_KEY;
  if (!secret || !token) return { success: false, score: 0 };
  const res = await axios.post(`https://www.google.com/recaptcha/api/siteverify?secret=${secret}&response=${token}`);
  return res.data;
};

const sendEmailNotification = async (enquiry) => {
  if (!process.env.SMTP_HOST) return;
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
  await transporter.sendMail({
    from: `"Onea Africa Website" <${process.env.SMTP_USER}>`,
    to: 'connect@onea.co.za',
    subject: `New Enquiry from ${enquiry.name} — ${enquiry.company || 'Unknown Company'}`,
    html: `<h2>New Website Enquiry</h2>
      <p><strong>Name:</strong> ${enquiry.name}</p>
      <p><strong>Email:</strong> ${enquiry.email}</p>
      <p><strong>Phone:</strong> ${enquiry.phone || 'Not provided'}</p>
      <p><strong>Company:</strong> ${enquiry.company || 'Not provided'}</p>
      <p><strong>Service Requested:</strong> ${enquiry.service}</p>
      <p><strong>Category:</strong> ${enquiry.serviceInterest}</p>
      <p><strong>Message:</strong></p><p>${enquiry.message}</p>
      <hr><p style="color:#888;font-size:12px">reCAPTCHA score: ${enquiry.recaptchaScore}</p>`,
  });
};

const appendToGoogleSheets = async (data) => {
  // Appends a row to the "Enquiries" tab in Google Sheets.
  // Columns: Timestamp | Name | Email | Phone | Company | Service Request | Message | reCAPTCHA Score
  // Requires GOOGLE_SHEETS_ID + GOOGLE_SERVICE_ACCOUNT_JSON env vars.
  // Implement with: const { google } = require('googleapis');
  // Sheet tab name: "Enquiries"
  // Row values: [new Date().toISOString(), data.name, data.email, data.phone, data.company,
  //              data.service, data.message, data.recaptchaScore]
};

router.post('/', async (req, res) => {
  try {
    const { name, email, phone, company, message, service, serviceInterest, recaptchaToken } = req.body;
    if (!name || !email || !phone || !service) return res.status(400).json({ error: 'Name, email, contact number and service are required.' });

    const captcha = await verifyRecaptcha(recaptchaToken);
    if (captcha.success && captcha.score < 0.5) {
      return res.status(400).json({ error: 'reCAPTCHA check failed. Please try again.' });
    }

    const enquiry = await Enquiry.create({
      name, email, phone, company, message,
      service: service || '',
      serviceInterest: serviceInterest || 'general',
      recaptchaScore: captcha.score || null,
    });

    await Promise.allSettled([
      sendEmailNotification(enquiry),
      appendToGoogleSheets(enquiry),
    ]);

    res.status(201).json({ message: 'Enquiry received. We\'ll be in touch within 24 hours.' });
  } catch (err) {
    console.error('Enquiry error:', err);
    res.status(500).json({ error: 'Something went wrong. Please try again or email connect@onea.co.za.' });
  }
});

module.exports = router;
