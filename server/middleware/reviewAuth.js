const Review = require('../models/Review');
const mongoose = require('mongoose');

const loadReview = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid review ID' });
    }
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
    req.review = review;
    next();
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const reviewOwner = (req, res, next) => {
  if (req.review.userId.toString() !== req.user._id.toString()) {
    return res.status(403).json({ success: false, message: 'Only the review owner can edit it' });
  }
  next();
};

const reviewOwnerOrAdmin = (req, res, next) => {
  if (req.review.userId.toString() !== req.user._id.toString() && !req.user.isAdmin) {
    return res.status(403).json({ success: false, message: 'Only the review owner or an admin can delete it' });
  }
  next();
};

module.exports = { loadReview, reviewOwner, reviewOwnerOrAdmin };