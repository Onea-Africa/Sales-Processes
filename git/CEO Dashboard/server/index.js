require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const app = express();

const allowedOrigins = [
  'https://onea.africa',
  'https://www.onea.africa',
  'http://localhost:5173',
  'http://localhost:4000',
];

const corsOptions = {
  origin: (origin, callback) => {
    // allow server-to-server calls (no origin) and any listed origin
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS blocked: ${origin}`));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

// Handle preflight for all routes before anything else
app.options('*', cors(corsOptions));
app.use(cors(corsOptions));
app.use(express.json());

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 50, message: { error: 'Too many requests' } });
app.use('/api', limiter);

app.use('/api/enquiries',           require('./routes/enquiries'));
app.use('/api/telkom-applications', require('./routes/telkom-applications'));
app.use('/api/applications', require('./routes/applications'));
app.use('/api/newsletter',   require('./routes/newsletter'));
app.use('/api/quotes',       require('./routes/quotes'));
app.use('/api/blog',         require('./routes/blog'));
app.use('/api/auth',         require('./routes/auth'));

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

  // Keep Render free tier warm — ping every 13 minutes to prevent spin-down
  if (process.env.RENDER_EXTERNAL_URL) {
    const https = require('https');
    setInterval(() => {
      https.get(`${process.env.RENDER_EXTERNAL_URL}/api/health`, res => {
        console.log('[KEEPALIVE] ping →', res.statusCode);
      }).on('error', err => {
        console.warn('[KEEPALIVE] ping failed:', err.message);
      });
    }, 13 * 60 * 1000);
  }
});
