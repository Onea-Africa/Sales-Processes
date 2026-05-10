const express = require('express');
const router = express.Router();
const axios = require('axios');
const Enquiry = require('../models/Enquiry');

const verifyRecaptcha = async (token) => {
  const secret = process.env.RECAPTCHA_SECRET_KEY;
  if (!secret || !token) return { success: true, score: 1 };
  const res = await axios.post(`https://www.google.com/recaptcha/api/siteverify?secret=${secret}&response=${token}`);
  return res.data;
};

router.post('/', async (req, res) => {
  try {
    const { name, email, phone, company, services, budget, message, recaptchaToken } = req.body;
    if (!name || !email) return res.status(400).json({ error: 'Name and email are required.' });

    const captcha = await verifyRecaptcha(recaptchaToken);
    if (captcha.success && captcha.score < 0.5) {
      return res.status(400).json({ error: 'reCAPTCHA check failed.' });
    }

    await Enquiry.create({
      name, email, phone, company,
      message: `QUOTE REQUEST\nServices: ${services || 'not specified'}\nBudget: ${budget || 'not specified'}\n\n${message || ''}`,
      serviceInterest: 'general',
      recaptchaScore: captcha.score || null,
      source: 'quote-form',
    });

    res.status(201).json({ message: 'Quote request received. We\'ll prepare a proposal within 2 business days.' });
  } catch (err) {
    console.error('Quote error:', err);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

module.exports = router;
