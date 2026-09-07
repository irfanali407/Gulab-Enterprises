const crypto = require('crypto');
const express = require('express');
const Analytics = require('../models/Analytics');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();
const visitorCookieName = 'visitorId';
const rateLimitWindowMs = 15 * 60 * 1000;
const rateLimitMax = 100;
const requestBuckets = new Map();

const getClientIp = (req) => req.ip || req.socket.remoteAddress || 'unknown';
const getDayKey = () => new Date().toISOString().slice(0, 10);

const getCookie = (req, name) => {
  const cookies = req.headers.cookie ? req.headers.cookie.split(';') : [];
  const cookie = cookies.find((item) => item.trim().startsWith(`${name}=`));
  return cookie ? decodeURIComponent(cookie.trim().slice(name.length + 1)) : null;
};

const setVisitorCookie = (res, visitorId) => {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  const secondsUntilNextUtcDay = Math.ceil(
    (Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), new Date().getUTCDate() + 1) - Date.now()) / 1000
  );
  res.setHeader(
    'Set-Cookie',
    `${visitorCookieName}=${encodeURIComponent(visitorId)}; Max-Age=${secondsUntilNextUtcDay}; Path=/; HttpOnly; SameSite=Lax${secure}`
  );
};

const rateLimitAnalytics = (req, res, next) => {
  const now = Date.now();
  const ip = getClientIp(req);
  const existing = requestBuckets.get(ip);
  const bucket = existing && existing.expiresAt > now
    ? existing
    : { count: 0, expiresAt: now + rateLimitWindowMs };

  bucket.count += 1;
  requestBuckets.set(ip, bucket);

  if (bucket.count > rateLimitMax) {
    return res.status(429).json({ message: 'Too many analytics requests. Try again later.' });
  }

  for (const [bucketIp, value] of requestBuckets) {
    if (value.expiresAt <= now) requestBuckets.delete(bucketIp);
  }

  next();
};

const isDuplicateKeyError = (error) => error && error.code === 11000;

// Called only after a booking has been successfully saved.
const recordBookingEvent = async (booking, req) => {
  try {
    await Analytics.create({
      type: 'booking',
      page: '/book',
      userId: booking.userId,
      bookingId: booking._id,
      ip: getClientIp(req),
      userAgent: req.get('user-agent') || 'unknown',
      dayKey: getDayKey(),
    });
  } catch (error) {
    if (!isDuplicateKeyError(error)) {
      console.error('Booking analytics failed:', error.message);
    }
  }
};

router.use(rateLimitAnalytics);

// @desc    Record one real visitor per IP/user-agent per day
// @route   POST /api/analytics
// @access  Public
router.post('/', async (req, res) => {
  const userAgent = req.get('user-agent');
  const { type, page } = req.body;

  if (type !== 'visit' || typeof page !== 'string' || !page.trim() || !userAgent || userAgent.length > 500) {
    return res.status(400).json({ message: 'A valid page and browser user-agent are required' });
  }

  const existingVisitorId = getCookie(req, visitorCookieName);
  const visitorId = existingVisitorId || crypto.randomUUID();
  setVisitorCookie(res, visitorId);

  if (existingVisitorId) {
    return res.status(200).json({ tracked: false });
  }

  try {
    await Analytics.create({
      type: 'visit',
      page: page.trim().slice(0, 200),
      ip: getClientIp(req),
      userAgent: userAgent.slice(0, 500),
      visitorId,
      dayKey: getDayKey(),
    });
    return res.status(201).json({ tracked: true });
  } catch (error) {
    if (isDuplicateKeyError(error)) return res.status(200).json({ tracked: false });
    return res.status(500).json({ message: error.message });
  }
});

// @desc    Get visitor and booking statistics
// @route   GET /api/analytics/stats
// @access  Private/Admin
router.get('/stats', protect, admin, async (req, res) => {
  try {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const startOfTomorrow = new Date(startOfToday);
    startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);
    const todayFilter = { createdAt: { $gte: startOfToday, $lt: startOfTomorrow } };
    const trustedVisit = {
      type: 'visit',
      ip: { $exists: true },
      userAgent: { $exists: true },
      dayKey: { $exists: true },
    };
    const trustedBooking = { type: 'booking', bookingId: { $exists: true } };

    const [totalVisitors, totalBookings, todayVisitors, todayBookings] = await Promise.all([
      Analytics.countDocuments(trustedVisit),
      Analytics.countDocuments(trustedBooking),
      Analytics.countDocuments({ ...todayFilter, ...trustedVisit }),
      Analytics.countDocuments({ ...todayFilter, ...trustedBooking }),
    ]);

    res.json({ totalVisitors, totalBookings, todayVisitors, todayBookings });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
module.exports.recordBookingEvent = recordBookingEvent;
