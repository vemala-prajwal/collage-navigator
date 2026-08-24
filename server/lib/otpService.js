const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const OTP_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes
const RATE_LIMIT_MS = 60 * 1000; // 60 seconds
const MAX_ATTEMPTS = 5;
const RESET_TOKEN_EXPIRY = '15m';

const OTP_SALT = process.env.OTP_SALT || 'campus_navigator_otp_salt_default';
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

const hashOtp = (otp) =>
  crypto.createHash('sha256').update(`${OTP_SALT}:${String(otp).trim()}`).digest('hex');

const hashToken = (token) =>
  crypto.createHash('sha256').update(token).digest('hex');

const readOtpMeta = (supabaseUser) => {
  const m = supabaseUser?.user_metadata || {};
  return {
    otpHash: m.otp_hash || null,
    expiresAt: m.otp_expires_at || 0,
    attempts: m.otp_attempts || 0,
    lastRequestAt: m.otp_last_request || 0,
    purpose: m.otp_purpose || null,
    usedTokens: Array.isArray(m.used_reset_tokens) ? m.used_reset_tokens : [],
  };
};

const writeOtpMeta = async (adminClient, userId, patch) => {
  const { error } = await adminClient.auth.admin.updateUserById(userId, {
    user_metadata: patch,
  });
  if (error) {
    console.error('[otpService] writeOtpMeta error:', error.message);
    throw new Error('Failed to persist OTP state.');
  }
};

const issueResetToken = (supabaseUser) => {
  return jwt.sign(
    {
      sub: supabaseUser.id,
      phone: supabaseUser.phone || supabaseUser.user_metadata?.phone,
      purpose: 'password_reset',
    },
    JWT_SECRET,
    { expiresIn: RESET_TOKEN_EXPIRY }
  );
};

const consumeResetToken = async (adminClient, token) => {
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

  if (adminClient && adminClient.auth && adminClient.auth.admin) {
    try {
      const { data, error } = await adminClient.auth.admin.getUserById(decoded.sub);
      if (!error && data?.user) {
        const meta = readOtpMeta(data.user);
        const tokenHash = hashToken(token);
        if (meta.usedTokens.includes(tokenHash)) {
          const err = new Error('This reset link has already been used. Please request a new one.');
          err.statusCode = 400;
          throw err;
        }

        const updatedUsed = [...meta.usedTokens, tokenHash].slice(-20);
        await writeOtpMeta(adminClient, decoded.sub, { used_reset_tokens: updatedUsed });
      }
    } catch (e) {
      if (e.statusCode) throw e;
      console.warn('[consumeResetToken] getUserById notice:', e.message || e);
    }
  }

  return { userId: decoded.sub, phone: decoded.phone };
};

module.exports = {
  issueResetToken,
  consumeResetToken,
  MAX_ATTEMPTS,
  OTP_EXPIRY_MS,
  RATE_LIMIT_MS,
};
