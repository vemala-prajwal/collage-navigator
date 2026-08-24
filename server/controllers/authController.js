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
      const bodyRes = { message: error.message };
      if (error.retryAfterSeconds != null) bodyRes.retryAfterSeconds = error.retryAfterSeconds;
      return res.status(error.statusCode).json(bodyRes);
    }
    next(error);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: formatValidationErrors(errors) });
    }

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
    const statusCode = error.statusCode || 400;
    const bodyRes = { message: error.message || 'Unable to process password reset.' };
    if (error.retryAfterSeconds != null) bodyRes.retryAfterSeconds = error.retryAfterSeconds;
    return res.status(statusCode).json(bodyRes);
  }
};

const verifyOtp = async (req, res, next) => {
  try {
    const result = await verifyPhonePasswordResetOtp(req.body);
    res.json(result);
  } catch (error) {
    const statusCode = error.statusCode || 400;
    const bodyRes = { message: error.message || 'Verification failed.' };
    if (error.remainingAttempts != null) bodyRes.remainingAttempts = error.remainingAttempts;
    return res.status(statusCode).json(bodyRes);
  }
};

const resetPasswordToken = async (req, res, next) => {
  try {
    const result = await resetPasswordWithToken(req.body);
    res.json(result);
  } catch (error) {
    const statusCode = error.statusCode || 400;
    return res.status(statusCode).json({ message: error.message || 'Password reset failed.' });
  }
};

const registerValidators = [
  body('name').notEmpty().withMessage('Full name is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('campus').notEmpty().withMessage('Campus selection is required'),
  body('sanUsn').notEmpty().withMessage('SAN/USN number is required'),
];

const loginValidators = [
  body('identifier')
    .custom((value, { req }) => Boolean(value || req.body.email || req.body.phone))
    .withMessage('Email or phone number is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

const forgotPasswordValidators = [
  body('email').isEmail().normalizeEmail().withMessage('A valid email is required'),
];

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
  forgotPasswordValidators,
  getCampuses,
};
