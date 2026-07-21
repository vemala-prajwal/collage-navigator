const { validationResult } = require('express-validator');
const Location = require('../models/Location');
const Feedback = require('../models/Feedback');

/**
 * Create a new campus location.
 */
const createLocation = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const location = await Location.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json(location);
  } catch (error) {
    next(error);
  }
};

/**
 * Fetch all public locations with optional search filtering.
 */
const getLocations = async (req, res, next) => {
  try {
    const { query, type, building } = req.query;
    const filter = {};

    if (query) filter.name = { $regex: query, $options: 'i' };
    if (type) filter.type = type;
    if (building) filter.building = { $regex: building, $options: 'i' };

    const locations = await Location.find(filter).sort({ createdAt: -1 });
    res.json(locations);
  } catch (error) {
    next(error);
  }
};

/**
 * Fetch a single location with average feedback.
 */
const getLocationById = async (req, res, next) => {
  try {
    const location = await Location.findById(req.params.id);
    if (!location) {
      return res.status(404).json({ message: 'Location not found' });
    }

    const feedbacks = await Feedback.find({ targetType: 'location', targetId: location._id });
    const averageRating = feedbacks.length
      ? (feedbacks.reduce((sum, item) => sum + item.rating, 0) / feedbacks.length).toFixed(1)
      : '0.0';

    res.json({ location, averageRating, feedbacks });
  } catch (error) {
    next(error);
  }
};

/**
 * Update an existing campus location.
 */
const updateLocation = async (req, res, next) => {
  try {
    const location = await Location.findById(req.params.id);
    if (!location) {
      return res.status(404).json({ message: 'Location not found' });
    }

    Object.assign(location, req.body);
    await location.save();
    res.json(location);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a campus location.
 */
const deleteLocation = async (req, res, next) => {
  try {
    const location = await Location.findById(req.params.id);
    if (!location) {
      return res.status(404).json({ message: 'Location not found' });
    }

    await location.deleteOne();
    res.json({ message: 'Location deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = { createLocation, getLocations, getLocationById, updateLocation, deleteLocation };
