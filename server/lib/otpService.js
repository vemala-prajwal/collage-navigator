const crypto = require('crypto');
const jwt = require('jsonwebtoken');

// In-memory persistent OTP store. Map key = normalized phone number
const otpStore = new Map();

// Single-use token store to prevent replay attacks
const usedResetTokens = new Set();

const OTP_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes
const COOLDOWN_MS = 60 * 1000; // 60 seconds between resends
const MAX_ATTEMPTS = 5;
const OTP_SALT = process.env.OTP_SALT || 'campus_navigator_otp_salt_2026';

/** Clean up expired records every 5 minutes */
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of otpStore.entries()) {
    if (value.expiresAt < now) {
      otpStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

/** Hash OTP securely with SHA-256 */
const hashOtp = (otp) => {
  return crypto.createHash('sha256').update(String(otp) + OTP_SALT).digest('hex');
};

/** Generate a 6-digit numeric OTP */
const generateNumericOtp = () => {
  return String(crypto.randomInt(100000, 1000000));
};

/**
 * Generate and store hashed OTP for a given phone number
 */
const createPhoneOtp = (phone) => {
  const normalizedPhone = String(phone).replace(/[\s()-]/g, '');
  const existing = otpStore.get(normalizedPhone);
  const now = Date.now();

  // Check resend cooldown
  if (existing && existing.cooldownUntil > now) {
    const remainingSeconds = Math.ceil((existing.cooldownUntil - now) / 1000);
    const error = new Error(`Please wait ${remainingSeconds} seconds before requesting another code.`);
    error.statusCode = 429;
    error.retryAfterSeconds = remainingSeconds;
    throw error;
  }

  const plainOtp = generateNumericOtp();
  const hashedOtp = hashOtp(plainOtp);

  otpStore.set(normalizedPhone, {
    hashedOtp,
    expiresAt: now + OTP_EXPIRY_MS,
    cooldownUntil: now + COOLDOWN_MS,
    attempts: 0,
    maxAttempts: MAX_ATTEMPTS,
  });

  return { plainOtp, normalizedPhone, expiresAt: now + OTP_EXPIRY_MS };
};

/**
 * Verify phone OTP and issue a short-lived single-use password reset token
 */
const verifyPhoneOtp = (phone, candidateOtp) => {
  const normalizedPhone = String(phone).replace(/[\s()-]/g, '');
  const record = otpStore.get(normalizedPhone);
  const now = Date.now();

  if (!record) {
    const error = new Error('No active code request found for this phone number. Please request a new code.');
    error.statusCode = 400;
    throw error;
  }

  if (record.expiresAt < now) {
    otpStore.delete(normalizedPhone);
    const error = new Error('Verification code has expired. Please request a new code.');
    error.statusCode = 400;
    throw error;
  }

  if (record.attempts >= record.maxAttempts) {
    otpStore.delete(normalizedPhone);
    const error = new Error('Maximum verification attempts exceeded. Please request a new code.');
    error.statusCode = 429;
    throw error;
  }

  // Hash candidate and verify in constant time
  const candidateHash = hashOtp(candidateOtp);
  const isMatch = crypto.timingSafeEqual(
    Buffer.from(candidateHash, 'hex'),
    Buffer.from(record.hashedOtp, 'hex')
  );

  if (!isMatch) {
    record.attempts += 1;
    const remaining = record.maxAttempts - record.attempts;
    if (remaining <= 0) {
      otpStore.delete(normalizedPhone);
      const error = new Error('Incorrect code. Maximum attempts reached. Please request a new code.');
      error.statusCode = 429;
      throw error;
    }
    const error = new Error(`Incorrect code. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`);
    error.statusCode = 400;
    error.remainingAttempts = remaining;
    throw error;
  }

  // Successful verification -> delete OTP immediately to prevent re-use
  otpStore.delete(normalizedPhone);

  // Issue short-lived reset token (valid for 15 minutes)
  const resetToken = jwt.sign(
    {
      phone: normalizedPhone,
      purpose: 'phone_password_reset',
      jti: crypto.randomBytes(16).toString('hex'), // Unique token ID
    },
    process.env.JWT_SECRET || 'dev-secret',
    { expiresIn: '15m' }
  );

  return { resetToken, phone: normalizedPhone };
};

/**
 * Verify short-lived single-use password reset token
 */
const verifyResetToken = (token) => {
  if (!token) {
    const error = new Error('Verification token is missing.');
    error.statusCode = 401;
    throw error;
  }

  if (usedResetTokens.has(token)) {
    const error = new Error('Reset token has already been used. Please request a new reset code.');
    error.statusCode = 400;
    throw error;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');
    if (decoded.purpose !== 'phone_password_reset' || !decoded.phone) {
      const error = new Error('Invalid verification token.');
      error.statusCode = 400;
      throw error;
    }
    return decoded;
  } catch (jwtErr) {
    if (jwtErr.statusCode) throw jwtErr;
    const error = new Error('Verification token is invalid or has expired.');
    error.statusCode = 400;
    throw error;
  }
};

/** Mark reset token as used */
const invalidateResetToken = (token) => {
  usedResetTokens.add(token);
};

module.exports = {
  createPhoneOtp,
  verifyPhoneOtp,
  verifyResetToken,
  invalidateResetToken,
  OTP_EXPIRY_MS,
  COOLDOWN_MS,
  MAX_ATTEMPTS,
};
