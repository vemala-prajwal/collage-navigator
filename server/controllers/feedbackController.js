const { validationResult } = require('express-validator');
const Feedback = require('../models/Feedback');

/**
 * Submit feedback for a location, canteen item, or faculty.
 */
const submitFeedback = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const feedback = await Feedback.create({ ...req.body, userId: req.user._id });
    res.status(201).json(feedback);
  } catch (error) {
    next(error);
  }
};

/**
 * Fetch feedback for a given target.
 */
const getFeedbackForTarget = async (req, res, next) => {
  try {
    const { targetType, targetId } = req.params;
    const feedbacks = await Feedback.find({ targetType, targetId }).populate('userId', 'name');
    const averageRating = feedbacks.length
      ? (feedbacks.reduce((sum, item) => sum + item.rating, 0) / feedbacks.length).toFixed(1)
      : '0.0';

    res.json({ feedbacks, averageRating });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete feedback as an admin moderator.
 */
const deleteFeedback = async (req, res, next) => {
  try {
    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    await feedback.deleteOne();
    res.json({ message: 'Feedback deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = { submitFeedback, getFeedbackForTarget, deleteFeedback };
