const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Review = require('../models/Review');
const Booking = require('../models/Booking');
const { protect } = require('../middleware/auth');
const { loadReview, reviewOwner, reviewOwnerOrAdmin } = require('../middleware/reviewAuth');
const sanitizeComment = (comment) => comment.replace(/<[^>]*>/g, '').trim();

const sendSuccess = (res, data, statusCode = 200, pagination) => {
  const response = { success: true, data };
  if (pagination) response.pagination = pagination;
  res.status(statusCode).json(response);
};

// @desc    Get all reviews with reviewer information
// @route   GET /api/reviews
router.get('/', async (req, res) => {
  try {
    const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 10, 1), 50);
    const filter = {};

    const serviceType = typeof req.query.serviceType === 'string' ? req.query.serviceType.trim() : '';
    const ratingFilter = typeof req.query.rating === 'string' ? req.query.rating.trim() : req.query.rating;
    if (serviceType) filter.serviceType = serviceType;
    if (ratingFilter !== undefined && ratingFilter !== '') {
      const rating = Number(ratingFilter);
      if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
        return res.status(400).json({ success: false, message: 'Rating filter must be a whole number from 1 to 5' });
      }
      filter.rating = rating;
    }

    const [reviews, total] = await Promise.all([
      Review.find(filter)
        .populate('userId', 'name email')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Review.countDocuments(filter),
    ]);

    sendSuccess(res, reviews, 200, { page, limit, total, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: 'Unable to load reviews' });
  }
});

// @desc    Create a review for a completed booking
// @route   POST /api/reviews
router.post('/', protect, async (req, res) => {
  try {
    const { rating, comment, bookingId } = req.body;

    if (!mongoose.isValidObjectId(bookingId)) {
      return res.status(400).json({ message: 'A valid booking is required' });
    }
    if (!Number.isInteger(Number(rating)) || Number(rating) < 1 || Number(rating) > 5) {
      return res.status(400).json({ message: 'Rating must be a whole number from 1 to 5' });
    }
    const cleanComment = comment ? sanitizeComment(comment) : '';
    if (!cleanComment) {
      return res.status(400).json({ message: 'Please provide a comment' });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only review your own bookings' });
    }
    if (booking.status.toLowerCase() !== 'completed') {
      return res.status(400).json({ message: 'You can review a booking only after it is completed' });
    }

    const existingReview = await Review.findOne({ bookingId, userId: req.user._id });
    if (existingReview) return res.status(409).json({ message: 'You have already reviewed this booking' });

    const review = await Review.create({
      rating: Number(rating),
      comment: cleanComment,
      bookingId,
      userId: req.user._id,
      serviceType: booking.serviceType,
    });
    sendSuccess(res, await review.populate('userId', 'name email'), 201);
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ message: 'You have already reviewed this booking' });
    res.status(500).json({ message: 'Unable to create review' });
  }
});

// @desc    Update a review
// @route   PUT /api/reviews/:id
router.put('/:id', protect, loadReview, reviewOwner, async (req, res) => {
  try {
    const review = req.review;

    const { rating, comment } = req.body;
    if (!Number.isInteger(Number(rating)) || Number(rating) < 1 || Number(rating) > 5) {
      return res.status(400).json({ message: 'Rating must be a whole number from 1 to 5' });
    }
    const cleanComment = comment ? sanitizeComment(comment) : '';
    if (!cleanComment) return res.status(400).json({ message: 'Please provide a comment' });

    review.rating = Number(rating);
    review.comment = cleanComment;
    await review.save();
    sendSuccess(res, await review.populate('userId', 'name email'));
  } catch (error) {
    res.status(500).json({ message: 'Unable to update review' });
  }
});

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
router.delete('/:id', protect, loadReview, reviewOwnerOrAdmin, async (req, res) => {
  try {
    const review = req.review;
    await review.deleteOne();
    sendSuccess(res, { message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Unable to delete review' });
  }
});

module.exports = router;