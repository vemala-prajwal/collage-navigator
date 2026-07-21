const express = require('express');
const { body } = require('express-validator');
const { protect, authorizeRoles } = require('../middleware/auth');
const {
  createCanteenItem,
  getCanteenItems,
  updateCanteenItem,
  toggleCanteenItemStatus,
  deleteCanteenItem,
} = require('../controllers/canteenController');

const router = express.Router();

const canteenValidators = [
  body('name').isString().trim().notEmpty(),
  body('price').isFloat({ gt: 0 }),
  body('status').optional().isIn(['available', 'limited', 'soldOut']),
  body('category').isString().trim().notEmpty(),
];

router.get('/', getCanteenItems);
router.post('/', protect, authorizeRoles('admin', 'canteenStaff'), canteenValidators, createCanteenItem);
router.put('/:id', protect, authorizeRoles('admin', 'canteenStaff'), canteenValidators, updateCanteenItem);
router.patch('/:id/toggle-status', protect, authorizeRoles('admin', 'canteenStaff'), toggleCanteenItemStatus);
router.delete('/:id', protect, authorizeRoles('admin', 'canteenStaff'), deleteCanteenItem);

module.exports = router;
