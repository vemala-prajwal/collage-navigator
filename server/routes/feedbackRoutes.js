const express = require('express');
const { body } = require('express-validator');
const { protect, authorizeRoles } = require('../middleware/auth');
const { submitFeedback, getFeedbackForTarget, deleteFeedback } = require('../controllers/feedbackController');

const router = express.Router();

const feedbackValidators = [
  body('targetType').isIn(['location', 'canteenItem', 'faculty']),
  body('targetId').isString().trim().notEmpty(),
  body('rating').isInt({ min: 1, max: 5 }),
  body('comment').optional().isString(),
];

router.post('/', protect, feedbackValidators, submitFeedback);
router.get('/:targetType/:targetId', getFeedbackForTarget);
router.delete('/:id', protect, authorizeRoles('admin'), deleteFeedback);

module.exports = router;
