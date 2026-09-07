const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: [true, 'Please add a service slug'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Please use a URL-safe service slug'],
    },
    name: {
      type: String,
      required: [true, 'Please add a service name'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please add a service description'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Please add a service price'],
      min: [0, 'Service price cannot be negative'],
    },
    icon: {
      type: String,
      default: 'wrench',
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Service', serviceSchema);
