const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { sendPasswordResetEmail, sendVerificationOtpEmail } = require('../services/emailService');
const rateLimit = require('express-rate-limit');
const { isValidEmail, validatePassword } = require('../middleware/validation');

const RESET_TOKEN_TTL_MS = 30 * 60 * 1000;
const VERIFICATION_OTP_TTL_MS = 5 * 60 * 1000;
const MAX_VERIFICATION_OTP_ATTEMPTS = 5;
const hashResetToken = (token) => crypto.createHash('sha256').update(token).digest('hex');
const hashVerificationOtp = (otp) => crypto.createHash('sha256').update(otp).digest('hex');

const loginRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { message: 'Too many authentication attempts. Please try again later.' },
});

const otpRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { message: 'Too many verification attempts. Please try again later.' },
});

const registrationRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { message: 'Too many registration attempts. Please try again later.' },
});

// Generate JWT Helper
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '1h',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', registrationRateLimit, async (req, res) => {
  try {
    const name = req.body.name || req.body.username;
    const email = req.body.email?.trim().toLowerCase();
    const { password } = req.body;
    if (typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 100 || !isValidEmail(email)) {
      return res.status(400).json({ message: 'Please provide a valid name, email, and password' });
    }
    if (!validatePassword(password)) {
      return res.status(400).json({ message: 'Password must be between 8 and 128 characters' });
    }

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Check if it's the first user ever, make them admin for ease of setup/demo
    const userCount = await User.countDocuments({});
    const isAdmin = userCount === 0;
    const verificationOtp = crypto.randomInt(100000, 1000000).toString();

    // Create user
    const user = await User.create({
      name: name.trim(),
      email,
      password,
      isAdmin,
      isVerified: false,
      verificationOtp: hashVerificationOtp(verificationOtp),
      verificationOtpExpiry: new Date(Date.now() + VERIFICATION_OTP_TTL_MS),
      verificationOtpAttempts: 0,
    });

    if (user) {
      try {
        await sendVerificationOtpEmail(user.email, verificationOtp);
      } catch (emailError) {
        await User.deleteOne({ _id: user._id });
        throw emailError;
      }
      res.status(201).json({ message: 'Verification code sent. Enter the code emailed to you before signing in.' });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Unable to register account' });
  }
});

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
router.post('/login', loginRateLimit, async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();
    const { password } = req.body;

    if (!isValidEmail(email) || typeof password !== 'string' || password.length > 128) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check for user email
    const user = await User.findOne({ email });

    if (user && !user.isVerified) {
      return res.status(403).json({ message: 'Please verify your email' });
    }

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user.id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Unable to sign in' });
  }
});

// @desc    Verify a new account using its emailed OTP
// @route   POST /api/auth/verify-otp
router.post('/verify-otp', otpRateLimit, async (req, res) => {
    try {
      const email = req.body.email?.trim().toLowerCase();
      const otp = String(req.body.otp || '').trim();
      if (!email || !/^\d{6}$/.test(otp)) {
        return res.status(400).json({ message: 'Please provide your email and 6-digit verification code' });
      }

      const user = await User.findOne({ email });
      if (!user || user.isVerified) {
        return res.status(400).json({ message: 'Invalid verification code' });
      }
      if (!user.verificationOtpExpiry || user.verificationOtpExpiry <= new Date()) {
        return res.status(400).json({ message: 'Verification code has expired' });
      }
      if (user.verificationOtpAttempts >= MAX_VERIFICATION_OTP_ATTEMPTS) {
        return res.status(429).json({ message: 'Too many incorrect attempts. Please request a new code.' });
      }
      if (hashVerificationOtp(otp) !== user.verificationOtp) {
        user.verificationOtpAttempts += 1;
        await user.save();
        return res.status(400).json({ message: 'Invalid verification code' });
      }

      user.isVerified = true;
      user.verificationOtp = null;
      user.verificationOtpExpiry = null;
      user.verificationOtpAttempts = 0;
      await user.save();
      res.json({ message: 'Email verified successfully. You can now sign in.' });
    } catch (error) {
      res.status(500).json({ message: 'Unable to verify code' });
    }
});

// @desc    Send a password reset link
// @route   POST /api/auth/forgot-password
// @access  Public
router.post('/forgot-password', async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();
    if (!isValidEmail(email)) {
      return res.status(400).json({ message: 'Please provide a valid email address' });
    }

    const user = await User.findOne({ email });
    if (user) {
      const resetToken = crypto.randomBytes(32).toString('hex');
      user.resetToken = hashResetToken(resetToken);
      user.resetTokenExpiry = new Date(Date.now() + RESET_TOKEN_TTL_MS);
      await user.save();

      const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;
      await sendPasswordResetEmail(user.email, resetUrl);
    }

    res.json({ message: 'If an account exists for that email, a password reset link has been sent.' });
  } catch (error) {
    res.status(500).json({ message: 'Unable to send password reset email. Please try again later.' });
  }
});

// @desc    Reset a password using a valid one-time token
// @route   POST /api/auth/reset-password/:token
// @access  Public
router.post('/reset-password/:token', async (req, res) => {
  try {
    const { password, confirmPassword } = req.body;
    if (!validatePassword(password)) {
      return res.status(400).json({ message: 'Password must be between 8 and 128 characters' });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    const user = await User.findOne({
      resetToken: hashResetToken(req.params.token),
      resetTokenExpiry: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Reset link is invalid or expired' });
    }

    user.password = password;
    user.resetToken = null;
    user.resetTokenExpiry = null;
    await user.save();

    res.json({ message: 'Password reset successfully. You can now sign in.' });
  } catch (error) {
    res.status(500).json({ message: 'Unable to reset password' });
  }
});

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Unable to load profile' });
  }
});

module.exports = router;
