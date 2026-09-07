const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['visit', 'booking'],
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    page: {
      type: String,
      required: true,
      trim: true,
    },
    ip: {
      type: String,
      required: true,
      trim: true,
    },
    userAgent: {
      type: String,
      required: true,
      trim: true,
    },
    visitorId: {
      type: String,
      trim: true,
    },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
    },
    dayKey: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

analyticsSchema.index({ type: 1, createdAt: -1 });
analyticsSchema.index({ ip: 1 });
analyticsSchema.index({ createdAt: -1 });
analyticsSchema.index(
  { type: 1, ip: 1, userAgent: 1, dayKey: 1 },
  {
    unique: true,
    partialFilterExpression: {
      type: 'visit',
      ip: { $exists: true },
      userAgent: { $exists: true },
      dayKey: { $exists: true },
    },
  }
);
analyticsSchema.index({ bookingId: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('Analytics', analyticsSchema);