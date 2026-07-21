const express = require('express');
const { body } = require('express-validator');
const { protect, authorizeRoles } = require('../middleware/auth');
const { createLocation, getLocations, getLocationById, updateLocation, deleteLocation } = require('../controllers/locationController');

const router = express.Router();

const locationValidators = [
  body('name').isString().trim().notEmpty(),
  body('type').isIn(['classroom', 'lab', 'faculty', 'canteen', 'washroom', 'other']),
  body('building').isString().trim().notEmpty(),
  body('floor').isNumeric(),
  body('coordinates.x').isNumeric(),
  body('coordinates.y').isNumeric(),
];

router.get('/', getLocations);
router.get('/:id', getLocationById);
router.post('/', protect, authorizeRoles('admin'), locationValidators, createLocation);
router.put('/:id', protect, authorizeRoles('admin'), locationValidators, updateLocation);
router.delete('/:id', protect, authorizeRoles('admin'), deleteLocation);

module.exports = router;
