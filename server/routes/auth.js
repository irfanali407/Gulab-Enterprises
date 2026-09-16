const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { sendPasswordResetEmail, sendVerificationOtpEmail } = require('../services/emailService');
const rateLimit = require('express-rate-limit');
const { isValidEmail, validatePassword } = require('../middleware/validation');

const RESET_TOKEN_TTL_MS = 30 * 60 * 1000;
const VERIFICATION_OTP_TTL_MS = 5 * 60 * 1000;
const MAX_VERIFICATION_OTP_ATTEMPTS = 5;

const hashResetToken = (token) =>
  crypto.createHash('sha256').update(token).digest('hex');

const hashVerificationOtp = (otp) =>
  crypto.createHash('sha256').update(otp).digest('hex');

// 🔐 Rate Limits
const registrationRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
});

// 🔐 JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '1h',
  });
};

// ================= REGISTER =================
router.post('/register', registrationRateLimit, async (req, res) => {
  try {
    console.log("📦 BODY:", req.body);

    const name = req.body.name || req.body.username;
    const email = req.body.email?.trim().toLowerCase();
    const { password } = req.body;

    // ✅ Validation
    if (
      typeof name !== 'string' ||
      name.trim().length < 2 ||
      !isValidEmail(email)
    ) {
      return res.status(400).json({ message: 'Invalid name or email' });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({ message: 'Password must be 8+ chars' });
    }

    // ✅ Check existing user
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // 👑 First user = admin
    const userCount = await User.countDocuments({});
    const isAdmin = userCount === 0;

    // 🔐 Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 🔢 OTP
    const verificationOtp = crypto.randomInt(100000, 1000000).toString();

    // 👤 Create user
    const user = await User.create({
      name: name.trim(),
      email,
      password: hashedPassword,
      isAdmin,
      isVerified: false,
      verificationOtp: hashVerificationOtp(verificationOtp),
      verificationOtpExpiry: new Date(Date.now() + VERIFICATION_OTP_TTL_MS),
      verificationOtpAttempts: 0,
    });

    // 📧 Send email (SAFE)
    try {
      await sendVerificationOtpEmail(user.email, verificationOtp);
      console.log("✅ OTP sent");
    } catch (emailError) {
      console.error("❌ Email failed:", emailError.message);
      // ❗ user delete नहीं करेंगे
    }

    res.status(201).json({
      message: "User registered. Check email for OTP.",
    });

  } catch (error) {
    console.error("🔥 REGISTER ERROR:", error);
    res.status(500).json({ message: error.message });
  }
});

// ================= LOGIN =================
router.post('/login', async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();
    const { password } = req.body;

    if (!isValidEmail(email) || !password) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    if (!user.isVerified) {
      return res.status(403).json({ message: 'Please verify your email' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Wrong password' });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      token: generateToken(user._id),
    });

  } catch (error) {
    console.error("🔥 LOGIN ERROR:", error);
    res.status(500).json({ message: error.message });
  }
});

// ================= PROFILE =================
router.get('/profile', protect, async (req, res) => {
  res.json(req.user);
});

module.exports = router;