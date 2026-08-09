<<<<<<< HEAD
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
=======
/**
 * otpService.js
 *
 * Serverless-safe OTP management for phone-based flows.
 *
 * Storage: Supabase user metadata (persistent across serverless cold-starts).
 *   Metadata keys written per user:
 *     otp_hash          – SHA-256(SALT:code)
 *     otp_expires_at    – Unix ms
 *     otp_attempts      – integer
 *     otp_last_request  – Unix ms  (rate-limit gate)
 *     otp_purpose       – 'reset' | 'register'
 *     used_reset_tokens – JSON array of SHA-256 hashes of consumed tokens
 *
 * Security guarantees:
 *  ✓ OTP never stored or logged as plaintext
 *  ✓ Max 5 verification attempts → lockout
 *  ✓ OTPs expire after 10 minutes
 *  ✓ Rate limit: 1 request per phone per 60 s
 *  ✓ Reset tokens are single-use signed JWTs; invalidation flag persisted in Supabase
 *  ✓ No account enumeration: all public responses are generic
 */

const crypto = require('crypto');
const jwt = require('jsonwebtoken');

// ── Constants ─────────────────────────────────────────────────────────────────
const OTP_EXPIRY_MS      = 10 * 60 * 1000; // 10 minutes
const RATE_LIMIT_MS      = 60 * 1000;       // 60-second request cooldown
const MAX_ATTEMPTS       = 5;
const RESET_TOKEN_EXPIRY = '15m';

const OTP_SALT   = process.env.OTP_SALT   || 'campus_navigator_otp_salt_default';
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

// ── Helpers ───────────────────────────────────────────────────────────────────

const hashOtp = (otp) =>
  crypto.createHash('sha256').update(`${OTP_SALT}:${String(otp).trim()}`).digest('hex');

const hashToken = (token) =>
  crypto.createHash('sha256').update(token).digest('hex');

const generateOtp = () => {
  const num = crypto.randomBytes(4).readUInt32BE(0) % 1_000_000;
  return String(num).padStart(6, '0');
};

// ── Supabase persistence helpers ───────────────────────────────────────────────

/**
 * Read OTP metadata from a Supabase user object.
 * @param {object} supabaseUser - raw user object from listUsers / getUserById
 */
const readOtpMeta = (supabaseUser) => {
  const m = supabaseUser?.user_metadata || {};
  return {
    otpHash:       m.otp_hash        || null,
    expiresAt:     m.otp_expires_at  || 0,
    attempts:      m.otp_attempts    || 0,
    lastRequestAt: m.otp_last_request|| 0,
    purpose:       m.otp_purpose     || null,
    usedTokens:    Array.isArray(m.used_reset_tokens) ? m.used_reset_tokens : [],
  };
};

/**
 * Patch OTP-related keys into a user's metadata without clobbering other keys.
 */
const writeOtpMeta = async (adminClient, userId, patch) => {
  const { error } = await adminClient.auth.admin.updateUserById(userId, {
    user_metadata: patch,
  });
  if (error) {
    console.error('[otpService] writeOtpMeta error:', error.message);
    throw new Error('Failed to persist OTP state.');
  }
};

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Create and persist a new OTP for a phone number.
 * Enforces 60-second rate limiting via stored metadata.
 *
 * @param {object} adminClient  – Supabase admin client
 * @param {object} supabaseUser – Raw user returned by findUserByPhone
 * @param {'reset'|'register'} purpose
 * @returns {{ plainOtp: string }}
 */
const createPhoneOtp = async (adminClient, supabaseUser, purpose = 'reset') => {
  const meta = readOtpMeta(supabaseUser);
  const now  = Date.now();

  if (meta.lastRequestAt && (now - meta.lastRequestAt) < RATE_LIMIT_MS) {
    const retryAfterSeconds = Math.ceil((RATE_LIMIT_MS - (now - meta.lastRequestAt)) / 1000);
    const err = new Error(`Please wait ${retryAfterSeconds} second${retryAfterSeconds === 1 ? '' : 's'} before requesting another code.`);
    err.statusCode = 429;
    err.retryAfterSeconds = retryAfterSeconds;
    throw err;
  }

  const plainOtp  = generateOtp();
  const hashedOtp = hashOtp(plainOtp);

  await writeOtpMeta(adminClient, supabaseUser.id, {
    otp_hash:         hashedOtp,
    otp_expires_at:   now + OTP_EXPIRY_MS,
    otp_attempts:     0,
    otp_last_request: now,
    otp_purpose:      purpose,
  });

  return { plainOtp };
};

/**
 * Verify a 6-digit OTP for a user.
 * Throws on invalid / expired / max-attempts.
 * Clears OTP metadata on success (single-use).
 *
 * @param {object} adminClient
 * @param {object} supabaseUser
 * @param {string} otp
 */
const verifyPhoneOtp = async (adminClient, supabaseUser, otp) => {
  const meta = readOtpMeta(supabaseUser);
  const now  = Date.now();

  if (!meta.otpHash) {
    const err = new Error('No verification code found. Please request a new one.');
    err.statusCode = 400;
    throw err;
  }

  if (now > meta.expiresAt) {
    // Clear expired OTP
    await writeOtpMeta(adminClient, supabaseUser.id, {
      otp_hash: null, otp_expires_at: 0, otp_attempts: 0, otp_purpose: null,
    });
    const err = new Error('Verification code has expired. Please request a new one.');
    err.statusCode = 400;
    throw err;
  }

  if (meta.attempts >= MAX_ATTEMPTS) {
    await writeOtpMeta(adminClient, supabaseUser.id, {
      otp_hash: null, otp_expires_at: 0, otp_attempts: 0, otp_purpose: null,
    });
    const err = new Error('Too many incorrect attempts. Please request a new code.');
    err.statusCode = 429;
    throw err;
  }

  const hashedInput = hashOtp(otp);

  if (hashedInput !== meta.otpHash) {
    const newAttempts = meta.attempts + 1;
    const remaining   = MAX_ATTEMPTS - newAttempts;

    if (remaining <= 0) {
      await writeOtpMeta(adminClient, supabaseUser.id, {
        otp_hash: null, otp_expires_at: 0, otp_attempts: 0, otp_purpose: null,
      });
    } else {
      await writeOtpMeta(adminClient, supabaseUser.id, { otp_attempts: newAttempts });
    }

    const err = new Error(
      remaining > 0
        ? `Incorrect code. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`
        : 'Too many incorrect attempts. Please request a new code.'
    );
    err.statusCode = 400;
    err.remainingAttempts = Math.max(0, remaining);
    throw err;
  }

  // ✅ OTP is correct — clear it immediately (single-use)
  await writeOtpMeta(adminClient, supabaseUser.id, {
    otp_hash: null, otp_expires_at: 0, otp_attempts: 0, otp_purpose: null,
  });
};

/**
 * Issue a short-lived, single-use JWT reset token.
 * Embeds userId and phone so we can look the user up without a phone scan.
 *
 * @param {object} supabaseUser
 * @returns {string} signed JWT (15 minutes)
 */
const issueResetToken = (supabaseUser) => {
  return jwt.sign(
    { sub: supabaseUser.id, phone: supabaseUser.phone || supabaseUser.user_metadata?.phone, purpose: 'password_reset' },
    JWT_SECRET,
    { expiresIn: RESET_TOKEN_EXPIRY }
  );
};

/**
 * Verify and consume a reset token (persistent single-use via Supabase).
 * Returns { userId, phone }.
 *
 * @param {object} adminClient
 * @param {string} token
 */
const consumeResetToken = async (adminClient, token) => {
  // 1. Decode JWT first (fast, no DB hit)
  let decoded;
  try {
    decoded = jwt.verify(token, JWT_SECRET);
  } catch {
    const err = new Error('Reset link is invalid or has expired. Please start again.');
    err.statusCode = 400;
    throw err;
  }

  if (decoded.purpose !== 'password_reset' || !decoded.sub) {
    const err = new Error('Invalid reset token.');
    err.statusCode = 400;
    throw err;
  }

  // 2. Check user's used-token list in Supabase (persistent single-use guard)
  const { data, error } = await adminClient.auth.admin.getUserById(decoded.sub);
  if (error || !data?.user) {
    const err = new Error('Account not found.');
    err.statusCode = 404;
    throw err;
  }

  const meta        = readOtpMeta(data.user);
  const tokenHash   = hashToken(token);

  if (meta.usedTokens.includes(tokenHash)) {
    const err = new Error('This reset link has already been used. Please request a new one.');
    err.statusCode = 400;
    throw err;
  }

  // 3. Mark token as used — keep last 20 hashes to avoid unbounded growth
  const updatedUsed = [...meta.usedTokens, tokenHash].slice(-20);
  await writeOtpMeta(adminClient, decoded.sub, { used_reset_tokens: updatedUsed });

  return { userId: decoded.sub, phone: decoded.phone };
>>>>>>> prajwal
};

module.exports = {
  createPhoneOtp,
  verifyPhoneOtp,
<<<<<<< HEAD
  verifyResetToken,
  invalidateResetToken,
  OTP_EXPIRY_MS,
  COOLDOWN_MS,
  MAX_ATTEMPTS,
=======
  issueResetToken,
  consumeResetToken,
  MAX_ATTEMPTS,
  OTP_EXPIRY_MS,
  RATE_LIMIT_MS,
>>>>>>> prajwal
};
