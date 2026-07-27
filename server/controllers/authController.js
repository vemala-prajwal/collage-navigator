const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { createClient } = require('@supabase/supabase-js');
const { CAMPUSES } = require('../constants/campuses');

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE;

const supabase = supabaseUrl && supabaseServiceRoleKey
  ? createClient(supabaseUrl, supabaseServiceRoleKey)
  : null;

const generateToken = (user) =>
  jwt.sign(
    { id: user.id, role: user.role, sanUsn: user.sanUsn || '' },
    process.env.JWT_SECRET || 'dev-secret',
    { expiresIn: '7d' }
  );

const formatValidationErrors = (errors) => errors.array().map((error) => error.msg).join(', ');

const registerUser = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: formatValidationErrors(errors) });
    }

    if (!supabase) {
      return res.status(500).json({ message: 'Supabase is not configured on the server.' });
    }

    const { name, email, password, campus, role, sanUsn } = req.body;

    const { data: existingUsers, error: lookupError } = await supabase.auth.admin.listUsers();

    if (lookupError) {
      throw lookupError;
    }

    const alreadyExists = existingUsers?.users?.some((user) => user.email?.toLowerCase() === email.toLowerCase());
    if (alreadyExists) {
      return res.status(400).json({ message: 'An account with this email already exists' });
    }

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name, campus, role: role || 'student', sanUsn: sanUsn || '' },
    });

    if (error) {
      throw error;
    }

    res.status(201).json({
      token: generateToken({ id: data.user.id, role: role || 'student', sanUsn: sanUsn || '' }),
      user: { id: data.user.id, name, email: email.toLowerCase(), campus, role: role || 'student', sanUsn: sanUsn || '' },
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

    if (!supabase) {
      return res.status(500).json({ message: 'Supabase is not configured on the server.' });
    }

    const { email, password } = req.body;
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const metadata = data.user.user_metadata || {};

    res.json({
      token: generateToken({ id: data.user.id, role: metadata.role || 'student', sanUsn: metadata.sanUsn || '' }),
      user: {
        id: data.user.id,
        name: metadata.name || email,
        email: data.user.email,
        campus: metadata.campus || 'Main Campus',
        role: metadata.role || 'student',
        sanUsn: metadata.sanUsn || '',
      },
    });
  } catch (error) {
    next(error);
  }
};

const registerValidators = [
  body('name').isString().trim().notEmpty().withMessage('Full name is required'),
  body('email').isEmail().normalizeEmail().withMessage('A valid email is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('campus').isIn(CAMPUSES).withMessage('Please select a valid campus'),
  body('sanUsn')
    .isString()
    .trim()
    .notEmpty().withMessage('SAN/USN number is required')
    .matches(/^[A-Za-z0-9]+$/).withMessage('SAN/USN must contain only letters and numbers'),
];

const loginValidators = [
  body('email').isEmail().normalizeEmail().withMessage('A valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

const getCampuses = (req, res) => {
  res.json({ campuses: CAMPUSES });
};

module.exports = { registerUser, loginUser, registerValidators, loginValidators, getCampuses };
