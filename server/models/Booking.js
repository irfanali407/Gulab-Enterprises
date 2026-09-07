const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    name: {
      type: String,
      required: [true, 'Please add contact name for booking'],
    },
    phone: {
      type: String,
      required: [true, 'Please add a contact phone number'],
    },
    email: {
      type: String,
      required: [true, 'Please add a contact email'],
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please add a valid contact email'],
    },
    address: {
      type: String,
      required: [true, 'Please add a service address'],
    },
    serviceType: {
      type: String,
      required: [true, 'Please select a service type'],
      enum: [
        'RO Service',
        'Washing Machine Repair',
        'AC Service',
        'Refrigerator Repair',
        'Microwave Repair',
      ],
    },
    date: {
      type: Date,
      required: [true, 'Please select a service date'],
    },
    language: {
      type: String,
      enum: ['en', 'hi'],
      default: 'en',
    },
    status: {
      type: String,
      required: true,
      enum: ['Pending', 'Approved', 'In Progress', 'Completed', 'Cancelled'],
      default: 'Pending',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Booking', bookingSchema);
