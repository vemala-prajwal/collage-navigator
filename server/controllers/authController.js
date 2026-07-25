const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { CAMPUSES } = require('../constants/campuses');

const generateToken = (user) => jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'dev-secret', { expiresIn: '7d' });

const formatValidationErrors = (errors) => errors.array().map((error) => error.msg).join(', ');

const registerUser = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: formatValidationErrors(errors) });
    }

    const { name, email, password, campus, role } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'An account with this email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, passwordHash, campus, role: role || 'student' });

    res.status(201).json({
      token: generateToken(user),
      user: { id: user._id, name: user.name, email: user.email, campus: user.campus, role: user.role },
    });
  } catch (error) {
    next(error);
  }
};

const loginUser = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: formatValidationErrors(errors) });
    }

    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    res.json({
      token: generateToken(user),
      user: { id: user._id, name: user.name, email: user.email, campus: user.campus, role: user.role },
    });
  } catch (error) {
    next(error);
  }
};

const registerValidators = [
  body('name').isString().trim().notEmpty().withMessage('Full name is required'),
  body('email').isEmail().normalizeEmail().withMessage('A valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('campus').isIn(CAMPUSES).withMessage('Please select a valid campus'),
];

const loginValidators = [
  body('email').isEmail().normalizeEmail().withMessage('A valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

const getCampuses = (req, res) => {
  res.json({ campuses: CAMPUSES });
};

module.exports = { registerUser, loginUser, registerValidators, loginValidators, getCampuses };
