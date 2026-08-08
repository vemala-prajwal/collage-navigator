/**
 * otpService.js
 *
 * Centralized OTP generation, hashing, verification, and single-use JWT
 * reset token management for phone-based flows (password reset & registration).
 *
 * Security:
 *  - OTPs are stored as SHA-256 hashes (never plaintext)
 *  - Max 5 verification attempts before lockout
 *  - OTPs expire after 10 minutes
 *  - Rate limiting: 1 OTP request per identifier per 60 seconds
 *  - Reset tokens are single-use, signed JWTs, invalidated on use
 */

const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const OTP_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes
const OTP_RATE_LIMIT_MS = 60 * 1000;  // 60-second cooldown between requests
const MAX_ATTEMPTS = 5;
const RESET_TOKEN_EXPIRY = '15m';

const OTP_SALT = process.env.OTP_SALT || 'campus_navigator_otp_salt_default';
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

// In-memory store: phone -> { hashedOtp, expiresAt, attempts, lastRequestAt }
const otpStore = new Map();

// Set of used reset tokens to enforce single-use
const usedResetTokens = new Set();

/**
 * Hash an OTP with SHA-256 and a salt for secure storage.
 */
const hashOtp = (otp) =>
  crypto.createHash('sha256').update(`${OTP_SALT}:${otp}`).digest('hex');

/**
 * Generate a cryptographically secure 6-digit OTP.
 */
const generateOtp = () => {
  const bytes = crypto.randomBytes(4);
  const num = bytes.readUInt32BE(0) % 1000000;
  return String(num).padStart(6, '0');
};

/**
 * Create and store a new OTP for a phone number.
 * Enforces rate limiting (60s cooldown between requests per identifier).
 * Returns the plaintext OTP (to be sent via SMS) and masked phone.
 *
 * @param {string} phone - Normalized E.164 phone number
 * @returns {{ plainOtp: string }}
 */
const createPhoneOtp = (phone) => {
  const existing = otpStore.get(phone);
  const now = Date.now();

  if (existing && (now - existing.lastRequestAt) < OTP_RATE_LIMIT_MS) {
    const retryAfterSeconds = Math.ceil((OTP_RATE_LIMIT_MS - (now - existing.lastRequestAt)) / 1000);
    const error = new Error(`Please wait ${retryAfterSeconds} seconds before requesting another code.`);
    error.statusCode = 429;
    error.retryAfterSeconds = retryAfterSeconds;
    throw error;
  }

  const plainOtp = generateOtp();
  const hashedOtp = hashOtp(plainOtp);

  otpStore.set(phone, {
    hashedOtp,
    expiresAt: now + OTP_EXPIRY_MS,
    attempts: 0,
    lastRequestAt: now,
  });

  return { plainOtp };
};

/**
 * Verify a 6-digit OTP for a phone number.
 * Throws on invalid/expired/max-attempts exceeded.
 * Deletes the OTP entry on success.
 *
 * @param {string} phone - Normalized E.164 phone number
 * @param {string} otp - The 6-digit code entered by the user
 */
const verifyPhoneOtp = (phone, otp) => {
  const record = otpStore.get(phone);

  if (!record) {
    const error = new Error('No verification code found. Please request a new one.');
    error.statusCode = 400;
    throw error;
  }

  if (Date.now() > record.expiresAt) {
    otpStore.delete(phone);
    const error = new Error('Verification code has expired. Please request a new one.');
    error.statusCode = 400;
    throw error;
  }

  if (record.attempts >= MAX_ATTEMPTS) {
    otpStore.delete(phone);
    const error = new Error('Too many incorrect attempts. Please request a new code.');
    error.statusCode = 429;
    throw error;
  }

  const hashedInput = hashOtp(String(otp).trim());
  if (hashedInput !== record.hashedOtp) {
    record.attempts += 1;
    const remaining = MAX_ATTEMPTS - record.attempts;
    const error = new Error(
      remaining > 0
        ? `Incorrect verification code. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`
        : 'Too many incorrect attempts. Please request a new code.'
    );
    error.statusCode = 400;
    error.remainingAttempts = remaining;
    if (remaining <= 0) otpStore.delete(phone);
    throw error;
  }

  // OTP verified — remove from store (single-use)
  otpStore.delete(phone);
};

/**
 * Issue a short-lived, single-use JWT reset token after OTP verification.
 * @param {string} phone
 * @returns {string} resetToken
 */
const issueResetToken = (phone) => {
  const token = jwt.sign(
    { phone, purpose: 'password_reset' },
    JWT_SECRET,
    { expiresIn: RESET_TOKEN_EXPIRY }
  );
  return token;
};

/**
 * Verify and consume a password reset token (single-use enforcement).
 * @param {string} token
 * @returns {{ phone: string }}
 */
const consumeResetToken = (token) => {
  if (usedResetTokens.has(token)) {
    const error = new Error('Reset token has already been used. Please start the process again.');
    error.statusCode = 400;
    throw error;
  }

  let decoded;
  try {
    decoded = jwt.verify(token, JWT_SECRET);
  } catch {
    const error = new Error('Reset token is invalid or has expired.');
    error.statusCode = 400;
    throw error;
  }

  if (decoded.purpose !== 'password_reset') {
    const error = new Error('Invalid reset token.');
    error.statusCode = 400;
    throw error;
  }

  // Mark as used
  usedResetTokens.add(token);
  // Prune used tokens set periodically to avoid memory leaks
  if (usedResetTokens.size > 10000) {
    const iter = usedResetTokens.values();
    for (let i = 0; i < 1000; i++) usedResetTokens.delete(iter.next().value);
  }

  return { phone: decoded.phone };
};

module.exports = {
  createPhoneOtp,
  verifyPhoneOtp,
  issueResetToken,
  consumeResetToken,
};
