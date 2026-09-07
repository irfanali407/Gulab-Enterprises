const express = require('express');
const Service = require('../models/Service');
const { protect, admin } = require('../middleware/auth');
const defaultServices = require('../config/defaultServices');

const router = express.Router();

const ensureDefaultServices = async () => {
  await Promise.all(
    defaultServices.map((service) =>
      Service.updateOne({ slug: service.slug }, { $setOnInsert: service }, { upsert: true })
    )
  );
};

// @desc    Get all services and prices
// @route   GET /api/services
// @access  Public
router.get('/', async (req, res) => {
  try {
    const services = await Service.find().sort({ createdAt: 1 });
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: 'Unable to fetch services' });
  }
});

// @desc    Get all services for the admin panel
// @route   GET /api/services/admin
// @access  Private/Admin
router.get('/admin', protect, admin, async (req, res) => {
  try {
    const services = await Service.find().sort({ createdAt: 1 });
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: 'Unable to fetch services' });
  }
});

// @desc    Add a service
// @route   POST /api/services
// @access  Private/Admin
router.post('/', protect, admin, async (req, res) => {
  try {
    const service = await Service.create(req.body);
    res.status(201).json(service);
  } catch (error) {
    const statusCode = error.code === 11000 || error.name === 'ValidationError' ? 400 : 500;
    res.status(statusCode).json({ message: error.code === 11000 ? 'A service with this slug already exists' : error.message });
  }
});

// @desc    Update a service, including its price
// @route   PUT /api/services/:id
// @access  Private/Admin
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const service = await Service.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    res.json(service);
  } catch (error) {
    const statusCode = error.name === 'ValidationError' || error.code === 11000 ? 400 : 500;
    res.status(statusCode).json({ message: error.code === 11000 ? 'A service with this slug already exists' : error.message });
  }
});

// @desc    Delete a service
// @route   DELETE /api/services/:id
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    res.json({ message: 'Service deleted successfully', serviceId: service._id });
  } catch (error) {
    res.status(500).json({ message: 'Unable to delete service' });
  }
});

module.exports = router;
module.exports.initializeServices = ensureDefaultServices;
