const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const { protect, admin } = require('../middleware/auth');
const {
  sendBookingCreatedNotifications,
  sendBookingCompletedNotifications,
} = require('../services/emailService');
const { recordBookingEvent } = require('./analytics');
const mongoose = require('mongoose');
const { validateBooking } = require('../middleware/validation');

// @desc    Create a new booking
// @route   POST /api/bookings
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { name, phone, address, serviceType, date, language } = req.body;

    if (!validateBooking({ name, phone, address, serviceType, date, language })) {
      return res.status(400).json({ message: 'Please provide valid booking details' });
    }

    const booking = new Booking({
      userId: req.user._id,
      name: name.trim(),
      phone: phone.trim(),
      email: req.user.email,
      address: address.trim(),
      serviceType,
      date,
      language: language === 'hi' ? 'hi' : 'en',
    });

    const createdBooking = await booking.save();
    await recordBookingEvent(createdBooking, req);
    // Notifications are non-blocking so a provider outage never loses a booking.
    sendBookingCreatedNotifications(createdBooking).catch((error) => {
      console.error('Booking creation notifications failed:', error.message);
    });
    res.status(201).json(createdBooking);
  } catch (error) {
    res.status(500).json({ message: 'Unable to create booking' });
  }
});

// @desc    Get user bookings
// @route   GET /api/bookings/my
// @access  Private
router.get('/my', protect, async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Unable to load bookings' });
  }
});

// @desc    Get all bookings
// @route   GET /api/bookings
// @access  Private/Admin
router.get('/', protect, admin, async (req, res) => {
  try {
    const bookings = await Booking.find({})
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Unable to load all bookings' });
  }
});

// @desc    Update booking status
// @route   PUT /api/bookings/:id/status
// @access  Private/Admin
router.put('/:id/status', protect, admin, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid booking id' });
    const { status } = req.body;
    const allowedStatuses = ['Pending', 'Approved', 'In Progress', 'Completed', 'Cancelled'];

    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid or missing booking status' });
    }

    const booking = await Booking.findById(req.params.id);

    if (booking) {
      const wasCompleted = booking.status === 'Completed';
      booking.status = status;
      const updatedBooking = await booking.save();
      if (!wasCompleted && status === 'Completed') {
        sendBookingCompletedNotifications(updatedBooking).catch((error) => {
          console.error('Booking completion notifications failed:', error.message);
        });
      }
      res.json(updatedBooking);
    } else {
      res.status(404).json({ message: 'Booking not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Unable to update booking' });
  }
});

// @desc    Delete a booking
// @route   DELETE /api/bookings/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid booking id' });
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Verify it is either the owner deleting or the admin
    if (booking.userId.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized to delete this booking' });
    }

    await Booking.findByIdAndDelete(req.params.id);
    res.json({ message: 'Booking cancelled/deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Unable to delete booking' });
  }
});

module.exports = router;
