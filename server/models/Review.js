const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  rating: {
    type: Number,
    required: [true, 'Please provide a rating'],
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
    required: [true, 'Please provide a comment'],
    trim: true,
    maxlength: [2000, 'Comment cannot exceed 2000 characters'],
  },
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Booking',
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  serviceType: {
    type: String,
    required: true,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Supports the duplicate-review rule and public latest-first queries.
reviewSchema.index({ userId: 1, bookingId: 1 }, { unique: true });
reviewSchema.index({ createdAt: -1 });
reviewSchema.index({ serviceType: 1, rating: 1, createdAt: -1 });

module.exports = mongoose.model('Review', reviewSchema);