require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const app = express();

app.use(cors({
  origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 50, message: { error: 'Too many requests' } });
app.use('/api', limiter);

app.use('/api/enquiries', require('./routes/enquiries'));
app.use('/api/newsletter', require('./routes/newsletter'));
app.use('/api/quotes',     require('./routes/quotes'));
app.use('/api/blog',       require('./routes/blog'));
app.use('/api/auth',       require('./routes/auth'));

app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

const PORT = process.env.PORT || 4000;

// MongoDB is optional — app works without it (email + sheets still fire)
if (process.env.MONGODB_URI) {
  const mongoose = require('mongoose');
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('[API] MongoDB connected'))
    .catch(err => console.warn('[API] MongoDB unavailable — submissions still go via email/sheets:', err.message));
} else {
  console.log('[API] MongoDB not configured — running email/sheets only mode');
}

app.listen(PORT, () => {
  console.log(`[API] Server running on http://localhost:${PORT}`);
  console.log(`[API] Health check: http://localhost:${PORT}/api/health`);
});
