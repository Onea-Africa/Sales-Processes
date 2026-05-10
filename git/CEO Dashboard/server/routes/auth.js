const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  const adminEmail = process.env.ADMIN_EMAIL || 'neo@onea.co.za';
  const adminPass = process.env.ADMIN_PASSWORD;

  if (!adminPass) return res.status(500).json({ error: 'Admin credentials not configured.' });
  if (email !== adminEmail || password !== adminPass) {
    return res.status(401).json({ error: 'Invalid credentials.' });
  }

  const token = jwt.sign({ email, role: 'admin' }, process.env.JWT_SECRET || 'changeme', { expiresIn: '8h' });
  res.json({ token });
});

module.exports = router;
