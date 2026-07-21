const { validationResult } = require('express-validator');
const CanteenItem = require('../models/CanteenItem');

/**
 * Create a canteen menu item.
 */
const createCanteenItem = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const item = await CanteenItem.create({ ...req.body, lastUpdatedBy: req.user._id });
    res.status(201).json(item);
  } catch (error) {
    next(error);
  }
};

/**
 * List all canteen items.
 */
const getCanteenItems = async (req, res, next) => {
  try {
    const items = await CanteenItem.find().sort({ updatedAt: -1 });
    res.json(items);
  } catch (error) {
    next(error);
  }
};

/**
 * Update a canteen menu item.
 */
const updateCanteenItem = async (req, res, next) => {
  try {
    const item = await CanteenItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Canteen item not found' });
    }

    Object.assign(item, req.body, { lastUpdatedBy: req.user._id, updatedAt: Date.now() });
    await item.save();
    res.json(item);
  } catch (error) {
    next(error);
  }
};

/**
 * Toggle status quickly for a canteen item.
 */
const toggleCanteenItemStatus = async (req, res, next) => {
  try {
    const item = await CanteenItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Canteen item not found' });
    }

    const statuses = ['available', 'limited', 'soldOut'];
    const nextStatus = statuses[(statuses.indexOf(item.status) + 1) % statuses.length];
    item.status = nextStatus;
    item.updatedAt = Date.now();
    item.lastUpdatedBy = req.user._id;
    await item.save();

    res.json(item);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a canteen item.
 */
const deleteCanteenItem = async (req, res, next) => {
  try {
    const item = await CanteenItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Canteen item not found' });
    }

    await item.deleteOne();
    res.json({ message: 'Canteen item deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createCanteenItem,
  getCanteenItems,
  updateCanteenItem,
  toggleCanteenItemStatus,
  deleteCanteenItem,
};
