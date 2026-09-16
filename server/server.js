require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const User = require('./models/User');

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET must be configured with at least 32 characters');
}
if (!process.env.CLIENT_URL) {
  throw new Error('CLIENT_URL must be configured');
}
const isLocalhostClientUrl = (url) => {
  try {
    const parsed = new URL(url);
    return ['localhost', '127.0.0.1'].includes(parsed.hostname);
  } catch {
    return false;
  }
};
if (process.env.NODE_ENV === 'production' && !process.env.CLIENT_URL?.startsWith('https://') && !isLocalhostClientUrl(process.env.CLIENT_URL)) {
  throw new Error('CLIENT_URL must use HTTPS in production');
}

const ensureDefaultAdmin = async () => {
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    console.warn('ADMIN_EMAIL and ADMIN_PASSWORD are not set. Admin login will remain unavailable until they are configured.');
    return;
  }

  try {
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      existingAdmin.isAdmin = true;
      existingAdmin.isVerified = true;
      existingAdmin.password = adminPassword;
      await existingAdmin.save();
      console.log(`Admin account ready: ${adminEmail}`);
      return;
    }

    await User.create({
      name: 'System Admin',
      email: adminEmail,
      password: adminPassword,
      isAdmin: true,
      isVerified: true,
    });

    console.log(`Default admin account created: ${adminEmail}`);
  } catch (error) {
    console.error('Unable to sync default admin account:', error.message);
  }
};

// Connect to Database
const servicesRoute = require('./routes/services');
connectDB().then(async () => {
  await ensureDefaultAdmin();
  await servicesRoute.initializeServices();
});

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 1);

// Middleware
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (!req.secure) return res.redirect(`https://${req.get('host')}${req.originalUrl}`);
    next();
  });
}
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}));
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
}));
app.use(express.json({ limit: '20kb' }));
app.use(express.urlencoded({ extended: false }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/services', servicesRoute);
app.use('/api/analytics', require('./routes/analytics'));

// Home/Healthcheck API Route
app.get('/', (req, res) => {
  res.json({ message: 'Gulab Enterprises Mirgunj API is running successfully' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err);
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: process.env.NODE_ENV === 'production' ? 'An unexpected error occurred' : err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

const DEFAULT_PORT = Number(process.env.PORT) || 5000;

const startServer = (port) => {
  const server = app.listen(port, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${port}`);
  });

  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      const nextPort = port + 1;
      console.warn(`Port ${port} is busy. Retrying on port ${nextPort}...`);
      startServer(nextPort);
      return;
    }

    console.error('Server startup error:', error);
    process.exit(1);
  });
};

startServer(DEFAULT_PORT);
