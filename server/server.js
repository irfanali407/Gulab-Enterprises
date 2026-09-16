require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const User = require('./models/User');

// 🔐 ENV VALIDATION
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET must be configured with at least 32 characters');
}
if (!process.env.CLIENT_URL) {
  throw new Error('CLIENT_URL must be configured');
}

// 🌐 CLIENT URLS (multiple allowed)
const clientOrigins = process.env.CLIENT_URL.split(',')
  .map((url) => url.trim())
  .filter(Boolean);

// 🔍 LOCALHOST CHECK
const isLocalhost = (url) => {
  try {
    const parsed = new URL(url);
    return ['localhost', '127.0.0.1'].includes(parsed.hostname);
  } catch {
    return false;
  }
};

// 🔒 HTTPS CHECK (production)
for (const url of clientOrigins) {
  if (
    process.env.NODE_ENV === 'production' &&
    !url.startsWith('https://') &&
    !isLocalhost(url)
  ) {
    throw new Error('CLIENT_URL must use HTTPS in production');
  }
}

// 👑 ADMIN SETUP
const ensureDefaultAdmin = async () => {
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    console.warn('Admin credentials not set');
    return;
  }

  try {
    const existing = await User.findOne({ email: adminEmail });

    if (existing) {
      existing.isAdmin = true;
      existing.isVerified = true;
      existing.password = adminPassword;
      await existing.save();
      console.log(`Admin ready: ${adminEmail}`);
      return;
    }

    await User.create({
      name: 'System Admin',
      email: adminEmail,
      password: adminPassword,
      isAdmin: true,
      isVerified: true,
    });

    console.log(`Admin created: ${adminEmail}`);
  } catch (err) {
    console.error('Admin setup error:', err.message);
  }
};

// 🗄️ DB CONNECT
const servicesRoute = require('./routes/services');
connectDB().then(async () => {
  await ensureDefaultAdmin();
  await servicesRoute.initializeServices();
});

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 1);

// 🔐 FORCE HTTPS (Render production)
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (!req.secure) {
      return res.redirect(`https://${req.get('host')}${req.originalUrl}`);
    }
    next();
  });
}

// 🛡️ SECURITY
app.use(helmet());

// 🚀 CORS FIX (FINAL)
const allowedOrigins = new Set([
  ...clientOrigins,
  'http://localhost:5173',
  'http://localhost:3000',
]);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // Postman / mobile

    if (allowedOrigins.has(origin)) {
      return callback(null, true);
    }

    console.log('❌ Blocked by CORS:', origin);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

// 🔥 PREFLIGHT FIX (MOST IMPORTANT)
app.options('*', cors());

// 🚫 RATE LIMIT
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
}));

// 📦 BODY PARSER
app.use(express.json({ limit: '20kb' }));
app.use(express.urlencoded({ extended: false }));

// 📌 ROUTES
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/services', servicesRoute);
app.use('/api/analytics', require('./routes/analytics'));

// 🏠 HEALTH CHECK
app.get('/', (req, res) => {
  res.json({ message: 'Gulab Enterprises API running 🚀' });
});

// ❌ ERROR HANDLER
app.use((err, req, res, next) => {
  console.error(err.message);

  res.status(500).json({
    message:
      process.env.NODE_ENV === 'production'
        ? 'Server error'
        : err.message,
  });
});

// 🚀 START SERVER
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});