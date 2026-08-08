const { body, validationResult } = require('express-validator');
const {
  CAMPUSES,
  registerAccount,
  verifyPhoneRegistrationOtp,
  loginAccount,
  requestPasswordReset,
  requestPhonePasswordReset,
  verifyPhonePasswordResetOtp,
  resetPasswordWithToken,
} = require('../lib/authService');

const formatValidationErrors = (errors) => errors.array().map((error) => error.msg).join(', ');

const registerUser = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: formatValidationErrors(errors) });
    }

    const result = await registerAccount(req.body);
    res.status(201).json(result);
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    next(error);
  }
};

const verifyRegistrationOtp = async (req, res, next) => {
  try {
    const result = await verifyPhoneRegistrationOtp(req.body);
    res.status(201).json(result);
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    next(error);
  }
};

const loginUser = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: formatValidationErrors(errors) });
    }

    const result = await loginAccount(req.body);
    res.json(result);
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    next(error);
  }
};

const registerValidators = [
  body('name').isString().trim().notEmpty().withMessage('Full name is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('campus').isIn(CAMPUSES).withMessage('Please select a valid campus'),
  body('sanUsn')
    .isString()
    .trim()
    .notEmpty().withMessage('SAN/USN number is required')
    .matches(/^[A-Za-z0-9]+$/).withMessage('SAN/USN must contain only letters and numbers'),
];

const loginValidators = [
  body('password').notEmpty().withMessage('Password is required'),
];

const forgotPassword = async (req, res, next) => {
  try {
    const result = await requestPasswordReset(req.body);
    res.json(result);
  } catch (error) {
    if (error.statusCode) {
      const bodyRes = { message: error.message };
      if (error.retryAfterSeconds != null) bodyRes.retryAfterSeconds = error.retryAfterSeconds;
      return res.status(error.statusCode).json(bodyRes);
    }
    next(error);
  }
};

const forgotPasswordPhone = async (req, res, next) => {
  try {
    const result = await requestPhonePasswordReset(req.body);
    res.json(result);
  } catch (error) {
    if (error.statusCode) {
      const bodyRes = { message: error.message };
      if (error.retryAfterSeconds != null) bodyRes.retryAfterSeconds = error.retryAfterSeconds;
      return res.status(error.statusCode).json(bodyRes);
    }
    next(error);
  }
};

const verifyOtp = async (req, res, next) => {
  try {
    const result = await verifyPhonePasswordResetOtp(req.body);
    res.json(result);
  } catch (error) {
    if (error.statusCode) {
      const bodyRes = { message: error.message };
      if (error.remainingAttempts != null) bodyRes.remainingAttempts = error.remainingAttempts;
      return res.status(error.statusCode).json(bodyRes);
    }
    next(error);
  }
};

const resetPasswordToken = async (req, res, next) => {
  try {
    const result = await resetPasswordWithToken(req.body);
    res.json(result);
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    next(error);
  }
};

const getCampuses = (req, res) => {
  res.json({ campuses: CAMPUSES });
};

module.exports = {
  registerUser,
  verifyRegistrationOtp,
  loginUser,
  forgotPassword,
  forgotPasswordPhone,
  verifyOtp,
  resetPasswordToken,
  registerValidators,
  loginValidators,
  getCampuses,
};

