const express = require('express');
const router = express.Router();
const axios = require('axios');
const NewsletterSubscriber = require('../models/NewsletterSubscriber');

const verifyRecaptcha = async (token) => {
  const secret = process.env.RECAPTCHA_SECRET_KEY;
  if (!secret || !token) return { success: true, score: 1 };
  const res = await axios.post(`https://www.google.com/recaptcha/api/siteverify?secret=${secret}&response=${token}`);
  return res.data;
};

router.post('/', async (req, res) => {
  try {
    const { email, recaptchaToken } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required.' });

    const captcha = await verifyRecaptcha(recaptchaToken);
    if (captcha.success && captcha.score < 0.5) {
      return res.status(400).json({ error: 'reCAPTCHA check failed.' });
    }

    const existing = await NewsletterSubscriber.findOne({ email });
    if (existing) {
      if (!existing.active) {
        existing.active = true;
        await existing.save();
        return res.json({ message: 'Welcome back! You\'ve been resubscribed.' });
      }
      return res.json({ message: 'You\'re already subscribed.' });
    }

    await NewsletterSubscriber.create({ email });
    res.status(201).json({ message: 'Subscribed successfully. Welcome to Onea Africa.' });
  } catch (err) {
    console.error('Newsletter error:', err);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

router.post('/unsubscribe', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required.' });
    await NewsletterSubscriber.findOneAndUpdate({ email }, { active: false });
    res.json({ message: 'You\'ve been unsubscribed.' });
  } catch (err) {
    res.status(500).json({ error: 'Something went wrong.' });
  }
});

module.exports = router;
