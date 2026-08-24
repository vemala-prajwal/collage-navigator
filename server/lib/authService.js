const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');
const { verifyFirebaseIdToken } = require('./firebaseAdmin');
const { CAMPUSES } = require('../constants/campuses');

// Load environment variables before anything reads them. In local dev the
// server/.env file is used; on Vercel/other platforms the env vars are usually
// already in process.env, so a missing file is a no-op. This also keeps module
// load order irrelevant: no matter which entrypoint requires this file first,
// the Supabase credentials are available by the time they are needed.
const envCandidates = [
  path.resolve(__dirname, '../.env'),
  path.resolve(__dirname, '../../.env'),
  path.resolve(__dirname, '../../client/.env'),
  path.resolve(__dirname, '../client/.env'),
  path.resolve(process.cwd(), '.env'),
  path.resolve(process.cwd(), 'client/.env'),
];
for (const candidate of envCandidates) {
  if (fs.existsSync(candidate)) {
    dotenv.config({ path: candidate });
    break;
  }
}

let supabaseClients = null;

// Keep the admin and public clients separate. The admin client can create an
// already-confirmed account, while the public client keeps registration
// functional on deployments that only expose the standard Supabase anon key.
const getSupabaseClients = () => {
  if (supabaseClients) return supabaseClients;

  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SERVICE_ROLE ||
    process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY;
  const clientOptions = { auth: { persistSession: false, autoRefreshToken: false } };

  supabaseClients = {
    admin: supabaseUrl && serviceRoleKey ? createClient(supabaseUrl, serviceRoleKey, clientOptions) : null,
    public: supabaseUrl && anonKey ? createClient(supabaseUrl, anonKey, clientOptions) : null,
  };

  return supabaseClients;
};

const getSupabaseAdminClient = () => getSupabaseClients().admin;

const getSupabaseClient = () => {
  const { admin, public: publicClient } = getSupabaseClients();
  return admin || publicClient;
};

const generateToken = (user) =>
  jwt.sign(
    {
      id: user.id,
      role: user.role,
      sanUsn: user.sanUsn || '',
      name: user.name || '',
      email: user.email || '',
      campus: user.campus || '',
    },
    process.env.JWT_SECRET || 'dev-secret',
    { expiresIn: '7d' }
  );

/**
 * Supabase Admin API errors often embed a JSON string inside error.message,
 * e.g. '{"code":"500","message":"A server error has occurred"}'.
 * This helper parses that and returns a clean, user-facing message string.
 */
const extractSupabaseMessage = (error) => {
  if (!error) return 'An unexpected error occurred.';

  let raw = error.message || error.error_description || error.error || '';

  // Attempt to parse if the message looks like JSON.
  if (typeof raw === 'string' && raw.trim().startsWith('{')) {
    try {
      const parsed = JSON.parse(raw);
      raw = parsed.message || parsed.error_description || parsed.error || raw;
    } catch {
      // Not valid JSON — keep raw as-is.
    }
  }

  const lower = String(raw).toLowerCase();

  if (!raw || lower === 'a server error has occurred') {
    return 'Account creation failed. Please try again in a moment.';
  }
  if (/already|exists|duplicate|registered/i.test(raw)) {
    return 'An account with this email already exists.';
  }
  if (/password/i.test(raw)) {
    return 'Password does not meet requirements. Please use a stronger password.';
  }
  if (/email/i.test(raw) && /invalid|format/i.test(raw)) {
    return 'Please enter a valid email address.';
  }

  // Generic sanitised fallback.
  return 'Account creation failed. Please try again.';
};

/**
 * Normalizes phone numbers to standard E.164 format.
 * Defaults to +91 (India) if a 10-digit number is provided without a country code.
 */
const normalizePhoneNumber = (phone) => {
  if (!phone) return '';
  let str = String(phone).trim().replace(/[\s()-]/g, '');
  if (!str) return '';
  if (str.startsWith('+')) {
    return str;
  }
  if (/^\d{10}$/.test(str)) {
    return `+91${str}`;
  }
  if (/^0\d{10}$/.test(str)) {
    return `+91${str.slice(1)}`;
  }
  return `+${str}`;
};

const getPasswordResetRedirectUrl = (redirectTo) => {
  if (redirectTo) {
    try {
      const url = new URL(redirectTo);
      if (url.protocol === 'https:' || url.hostname === 'localhost') return url.toString();
    } catch {
      // Use the configured fallback below for malformed client input.
    }
  }

  const configuredResetUrl =
    process.env.PASSWORD_RESET_REDIRECT_URL || process.env.VITE_PASSWORD_RESET_REDIRECT_URL;
  if (configuredResetUrl) {
    try {
      return new URL(configuredResetUrl).toString();
    } catch {
      // Continue to the site URL fallback.
    }
  }

  const siteUrl = process.env.CLIENT_URL || process.env.VITE_SITE_URL;
  if (siteUrl) {
    try {
      return new URL('/reset-password', siteUrl).toString();
    } catch {
      // Continue to the local-development fallback.
    }
  }

  return 'http://localhost:5173/reset-password';
};

const validateRegisterPayload = ({ name, email, phone, password, campus, sanUsn } = {}) => {
  const errors = [];

  if (!name || !String(name).trim()) {
    errors.push('Full name is required');
  }

  const rawEmail = String(email || '').trim();
  const rawPhone = String(phone || '').trim();

  if (!rawEmail && !rawPhone) {
    errors.push('Either an email address or phone number is required');
  } else {
    if (rawEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rawEmail)) {
      errors.push('Please enter a valid email address');
    }
    if (rawPhone) {
      const normalized = normalizePhoneNumber(rawPhone);
      const digitsOnly = normalized.replace(/\D/g, '');
      if (digitsOnly.length < 7 || digitsOnly.length > 15) {
        errors.push('Please enter a valid phone number (e.g. +91 9876543210)');
      }
    }
  }

  if (!password || String(password).length < 8) {
    errors.push('Password must be at least 8 characters');
  }

  if (!campus || !CAMPUSES.includes(campus)) {
    errors.push('Please select a valid campus');
  }

  const normalizedSanUsn = String(sanUsn || '').trim();
  if (!normalizedSanUsn) {
    errors.push('SAN/USN number is required');
  } else if (!/^[A-Za-z0-9]+$/.test(normalizedSanUsn)) {
    errors.push('SAN/USN must contain only letters and numbers');
  }

  return errors;
};

const validateLoginPayload = ({ email, phone, identifier, password } = {}) => {
  const errors = [];
  const target = String(identifier || email || phone || '').trim();

  if (!target) {
    errors.push('Email address or phone number is required');
  }

  if (!password) {
    errors.push('Password is required');
  }

  return errors;
};

const ensureSupabase = () => {
  const authClient = getSupabaseClient();

  if (!authClient) {
    const error = new Error('Supabase is not configured on the server.');
    error.statusCode = 500;
    throw error;
  }

  return authClient;
};

const mapSupabaseUser = (user) => {
  const metadata = user.user_metadata || {};

  return {
    id: user.id,
    name: metadata.name || user.email || metadata.phone || 'User',
    email: user.email || metadata.email || '',
    phone: user.phone || metadata.phone || '',
    phoneVerified: Boolean(metadata.phone_verified || metadata.phoneVerified),
    campus: metadata.campus || 'Main Campus',
    role: metadata.role || 'student',
    sanUsn: metadata.sanUsn || '',
  };
};

const fetchUserProfileById = async (authClient, userId, decodedFallback = {}) => {
  let data = null;
  let error = null;

  try {
    if (authClient.auth.admin) {
      ({ data, error } = await authClient.auth.admin.getUserById(userId));
    } else {
      error = new Error('Admin auth is unavailable');
    }
  } catch (adminError) {
    error = adminError;
  }

  if (!error && data?.user) {
    return mapSupabaseUser(data.user);
  }

  return {
    id: decodedFallback.id || userId,
    name: decodedFallback.name || '',
    email: decodedFallback.email || '',
    campus: decodedFallback.campus || 'Main Campus',
    role: decodedFallback.role || 'student',
    sanUsn: decodedFallback.sanUsn || '',
  };
};

const findUserByEmail = async (authClient, email) => {
  const normalizedEmail = email.toLowerCase();
  let page = 1;
  const perPage = 200;

  while (page <= 25) {
    const { data, error } = await authClient.auth.admin.listUsers({ page, perPage });

    // If the admin API call fails, stop searching and return null rather than
    // throwing a raw Supabase error that has no statusCode and would reach the
    // global error handler with a non-string message (causing '[object Object]').
    if (error) {
      console.error('[findUserByEmail] listUsers error:', error.message || error);
      return null;
    }

    const match = data?.users?.find((user) => user.email?.toLowerCase() === normalizedEmail);
    if (match) {
      return match;
    }

    if (!data?.users?.length || data.users.length < perPage) {
      break;
    }

    page += 1;
  }

  return null;
};

const findUserByPhone = async (authClient, phone) => {
  if (!authClient || !authClient.auth || !authClient.auth.admin) {
    return null;
  }

  let page = 1;
  const perPage = 200;
  const cleanPhone = phone ? normalizePhoneNumber(phone) : '';
  const syntheticEmail = cleanPhone ? `${cleanPhone.replace(/\+/g, '')}@phone.campusnavigator.internal` : '';

  while (page <= 25) {
    const { data, error } = await authClient.auth.admin.listUsers({ page, perPage });

    if (error) {
      console.error('[findUserByPhone] listUsers error:', error.message || error);
      return null;
    }

    const match = data?.users?.find((user) => {
      const meta = user.user_metadata || {};
      const uPhone = user.phone ? normalizePhoneNumber(user.phone) : '';
      const mPhone = meta.phone ? normalizePhoneNumber(meta.phone) : '';
      return (
        (cleanPhone && (uPhone === cleanPhone || mPhone === cleanPhone || user.phone === phone || meta.phone === phone)) ||
        (syntheticEmail && user.email?.toLowerCase() === syntheticEmail.toLowerCase())
      );
    });

    if (match) return match;

    if (!data?.users?.length || data.users.length < perPage) break;
    page += 1;
  }

  return null;
};

const confirmUserEmail = async (authClient, userId) => {
  await authClient.auth.admin.updateUserById(userId, { email_confirm: true });
};

const isDuplicateAuthError = (error) =>
  /already|exists|duplicate|registered/i.test(error?.message || '') ||
  error?.status === 422 ||
  error?.code === 'user_already_exists';

const createRegistrationError = (error) => {
  const registrationError = new Error(extractSupabaseMessage(error));
  registrationError.statusCode = isDuplicateAuthError(error) ? 409 : 500;
  return registrationError;
};

const signUpWithClient = async ({ authClient, email, password, name, campus, role, sanUsn }) => {
  const { data, error } = await authClient.auth.signUp({
    email,
    password,
    options: {
      data: { name, campus, role, sanUsn },
    },
  });

  if (error) {
    throw createRegistrationError(error);
  }

  if (!data?.user) {
    throw createRegistrationError(new Error('Account creation failed.'));
  }

  // Supabase masks duplicate accounts on public sign-up by returning a user
  // without identities. Treat that response as a conflict rather than showing
  // a misleading success state.
  if (Array.isArray(data.user.identities) && data.user.identities.length === 0) {
    throw createRegistrationError({ message: 'User already registered' });
  }

  return {
    user: data.user,
    requiresEmailConfirmation: !data.session,
  };
};

const pendingRegistrations = new Map();

const requestPhoneRegistration = async (payload = {}) => {
  const { name, phone, password, campus, sanUsn } = payload;
  const validationErrors = validateRegisterPayload({ name, phone, password, campus, sanUsn });
  if (validationErrors.length) {
    const error = new Error(validationErrors.join(', '));
    error.statusCode = 400;
    throw error;
  }

  const normalizedPhone = normalizePhoneNumber(phone);
  const { admin: adminClient } = getSupabaseClients();

  // Check duplicate phone registration
  if (adminClient) {
    const existing = await findUserByPhone(adminClient, normalizedPhone);
    if (existing) {
      const duplicateError = new Error('An account with this phone number is already registered.');
      duplicateError.statusCode = 409;
      throw duplicateError;
    }
  }

  // Store pending registration details
  pendingRegistrations.set(normalizedPhone, {
    name: String(name).trim(),
    phone: normalizedPhone,
    password,
    campus,
    sanUsn: String(sanUsn).trim().toUpperCase(),
    role: 'student',
  });

  const lastFour = normalizedPhone.slice(-4);
  const maskedPhone = `${normalizedPhone.slice(0, 3)} *****${lastFour}`;

  return {
    requiresOtp: true,
    maskedPhone,
    phone: normalizedPhone,
    message: `Verification code will be sent to ${maskedPhone} via SMS.`,
  };
};

const verifyPhoneRegistrationOtp = async ({ phone, otp, firebaseToken } = {}) => {
  if (!phone || !firebaseToken) {
    const error = new Error('Phone number and Firebase verification token are required.');
    error.statusCode = 400;
    throw error;
  }

  const decodedToken = await verifyFirebaseIdToken(firebaseToken);
  const normalizedPhone = normalizePhoneNumber(phone);
  if (!decodedToken.phone_number || decodedToken.phone_number !== normalizedPhone) {
    const error = new Error('Firebase token does not match the provided phone number.');
    error.statusCode = 403;
    throw error;
  }

  const pending = pendingRegistrations.get(normalizedPhone);
  if (!pending) {
    const error = new Error('Registration session expired. Please register again.');
    error.statusCode = 400;
    throw error;
  }

  const { admin: adminClient, public: publicClient } = getSupabaseClients();
  const authClient = adminClient || publicClient;
  if (!authClient) ensureSupabase();

  let createdUser = null;
  // Generate synthetic email for Supabase auth if only phone provided
  const syntheticEmail = `${normalizedPhone.replace(/\+/g, '')}@phone.campusnavigator.internal`;

  if (adminClient) {
    const { data, error } = await adminClient.auth.admin.createUser({
      email: syntheticEmail,
      phone: normalizedPhone,
      password: pending.password,
      email_confirm: true,
      phone_confirm: true,
      user_metadata: {
        name: pending.name,
        campus: pending.campus,
        role: pending.role,
        sanUsn: pending.sanUsn,
        phone: normalizedPhone,
        phone_verified: true,
      },
    });

    if (!error && data?.user) {
      createdUser = data.user;
    } else {
      console.error('[verifyPhoneRegistrationOtp] createUser error:', error);
      throw createRegistrationError(error || new Error('Failed to create account'));
    }
  } else {
    const { data, error } = await publicClient.auth.signUp({
      email: syntheticEmail,
      password: pending.password,
      options: {
        data: {
          name: pending.name,
          campus: pending.campus,
          role: pending.role,
          sanUsn: pending.sanUsn,
          phone: normalizedPhone,
          phone_verified: true,
        },
      },
    });
    if (error || !data?.user) throw createRegistrationError(error || new Error('Failed to create account'));
    createdUser = data.user;
  }

  // Clear pending
  pendingRegistrations.delete(normalizedPhone);

  const user = {
    id: createdUser.id,
    name: pending.name,
    email: '',
    phone: normalizedPhone,
    phoneVerified: true,
    campus: pending.campus,
    role: pending.role,
    sanUsn: pending.sanUsn,
  };

  return {
    token: generateToken(user),
    user,
  };
};

const registerAccount = async (payload = {}) => {
  const { name, email, phone, password, campus, sanUsn } = payload;

  // Route to phone registration flow if phone provided and no email
  if (phone && !email) {
    return requestPhoneRegistration(payload);
  }

  const validationErrors = validateRegisterPayload({ name, email, phone, password, campus, sanUsn });
  if (validationErrors.length) {
    const error = new Error(validationErrors.join(', '));
    error.statusCode = 400;
    throw error;
  }

  const { admin: adminClient, public: publicClient } = getSupabaseClients();
  const authClient = adminClient || publicClient;
  if (!authClient) {
    ensureSupabase();
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const normalizedPhone = phone ? normalizePhoneNumber(phone) : '';
  const normalizedRole = 'student';
  const normalizedSanUsn = String(sanUsn || '').trim().toUpperCase();

  let createdUser;
  let requiresEmailConfirmation = false;

  if (adminClient) {
    try {
      const existingUser = await findUserByEmail(adminClient, normalizedEmail);
      if (existingUser) {
        const duplicateError = new Error('An account with this email already exists.');
        duplicateError.statusCode = 409;
        throw duplicateError;
      }
    } catch (preCheckError) {
      if (preCheckError.statusCode) throw preCheckError;
      console.error('[registerAccount] pre-check error:', preCheckError.message || preCheckError);
    }

    const { data, error } = await adminClient.auth.admin.createUser({
      email: normalizedEmail,
      phone: normalizedPhone || undefined,
      password,
      email_confirm: true,
      user_metadata: {
        name: String(name).trim(),
        campus,
        role: normalizedRole,
        sanUsn: normalizedSanUsn,
        phone: normalizedPhone,
        phone_verified: false,
      },
    });

    if (!error && data?.user) {
      createdUser = data.user;
    } else {
      console.error('[registerAccount] createUser error:', error?.message || error);
      if (isDuplicateAuthError(error)) throw createRegistrationError(error);

      try {
        const fallbackClient = publicClient || adminClient;
        const fallbackResult = await signUpWithClient({
          authClient: fallbackClient,
          email: normalizedEmail,
          password,
          name: String(name).trim(),
          campus,
          role: normalizedRole,
          sanUsn: normalizedSanUsn,
        });
        createdUser = fallbackResult.user;
        requiresEmailConfirmation = fallbackResult.requiresEmailConfirmation;
      } catch (fallbackError) {
        if (fallbackError.statusCode) throw fallbackError;
        throw createRegistrationError(error || fallbackError);
      }
    }
  } else {
    const signupResult = await signUpWithClient({
      authClient: publicClient,
      email: normalizedEmail,
      password,
      name: String(name).trim(),
      campus,
      role: normalizedRole,
      sanUsn: normalizedSanUsn,
    });
    createdUser = signupResult.user;
    requiresEmailConfirmation = signupResult.requiresEmailConfirmation;
  }

  if (!createdUser) {
    const serviceError = new Error('Account creation failed. Please try again.');
    serviceError.statusCode = 500;
    throw serviceError;
  }

  const user = {
    id: createdUser.id,
    name: String(name).trim(),
    email: normalizedEmail,
    phone: normalizedPhone,
    phoneVerified: false,
    campus,
    role: normalizedRole,
    sanUsn: normalizedSanUsn,
  };

  return {
    token: requiresEmailConfirmation ? null : generateToken(user),
    user,
    ...(requiresEmailConfirmation
      ? {
          requiresEmailConfirmation: true,
          message: 'Account created. Check your email to confirm it before signing in.',
        }
      : {}),
  };
};

const loginAccount = async (payload = {}) => {
  const { identifier, email, phone, password } = payload;
  const targetInput = String(identifier || email || phone || '').trim();

  const validationErrors = validateLoginPayload({ identifier: targetInput, password });
  if (validationErrors.length) {
    const error = new Error(validationErrors.join(', '));
    error.statusCode = 400;
    throw error;
  }

  const authClient = ensureSupabase();
  const isPhone = !targetInput.includes('@') && /^[\d\s()+-]+$/.test(targetInput);

  let loginEmail = targetInput.toLowerCase();

  if (isPhone) {
    const normalizedPhone = normalizePhoneNumber(targetInput);
    const { admin: adminClient } = getSupabaseClients();
    if (!adminClient) {
      const error = new Error('Server configuration error: Admin client required for phone login.');
      error.statusCode = 500;
      throw error;
    }

    const matchedUser = await findUserByPhone(adminClient, normalizedPhone);
    if (!matchedUser) {
      const authError = new Error('Invalid phone number or password.');
      authError.statusCode = 401;
      throw authError;
    }

    const metadata = matchedUser.user_metadata || {};
    if (metadata.phone_verified === false) {
      const unverifiedError = new Error('Your phone number is not verified. Please verify your phone number to sign in.');
      unverifiedError.statusCode = 403;
      throw unverifiedError;
    }

    loginEmail = matchedUser.email;
  }

  let { data, error } = await authClient.auth.signInWithPassword({
    email: loginEmail,
    password,
  });

  if (error && /email not confirmed/i.test(error.message)) {
    try {
      const adminClient = getSupabaseAdminClient();
      const unconfirmedUser = adminClient ? await findUserByEmail(adminClient, loginEmail) : null;
      if (unconfirmedUser) {
        await adminClient.auth.admin.updateUserById(unconfirmedUser.id, { email_confirm: true });
        const retry = await authClient.auth.signInWithPassword({
          email: loginEmail,
          password,
        });
        if (!retry.error) {
          data = retry.data;
          error = null;
        }
      }
    } catch {
      // Fall through to error handler
    }
  }

  if (error) {
    const authError = new Error('Invalid email/phone or password.');
    authError.statusCode = 401;
    throw authError;
  }

  const metadata = data.user.user_metadata || {};
  const user = {
    id: data.user.id,
    name: metadata.name || loginEmail,
    email: data.user.email || '',
    phone: metadata.phone || data.user.phone || '',
    phoneVerified: Boolean(metadata.phone_verified),
    campus: metadata.campus || 'Main Campus',
    role: metadata.role || 'student',
    sanUsn: metadata.sanUsn || '',
  };

  return {
    token: generateToken(user),
    user,
  };
};

const getCurrentUser = async (token) => {
  if (!token) {
    const error = new Error('Not authorized, no token');
    error.statusCode = 401;
    throw error;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');
    const authClient = ensureSupabase();
    return fetchUserProfileById(getSupabaseAdminClient() || authClient, decoded.id, decoded);
  } catch (jwtError) {
    const authClient = getSupabaseClient();
    if (!authClient) {
      const error = new Error('Not authorized, invalid token');
      error.statusCode = 401;
      throw error;
    }

    const { data, error } = await authClient.auth.getUser(token);
    if (error || !data?.user) {
      const authError = new Error('Not authorized, invalid token');
      authError.statusCode = 401;
      throw authError;
    }

    return mapSupabaseUser(data.user);
  }
};


const requestPasswordReset = async ({ email, redirectTo } = {}) => {
  if (!email) {
    const error = new Error('Email address is required.');
    error.statusCode = 400;
    throw error;
  }

  const authClient = getSupabaseClient();
  if (!authClient) {
    const error = new Error('Email reset is not available right now.');
    error.statusCode = 500;
    throw error;
  }

  const normalizedEmail = String(email).trim().toLowerCase();

  const { error: sbError } = await authClient.auth.resetPasswordForEmail(normalizedEmail, {
    redirectTo: getPasswordResetRedirectUrl(redirectTo),
  });

  if (sbError) {
    if (/rate.?limit|too.?many/i.test(sbError.message)) {
      const rateLimitError = new Error('Too many requests. Please wait before requesting another reset link.');
      rateLimitError.statusCode = 429;
      rateLimitError.retryAfterSeconds = 60;
      throw rateLimitError;
    }
    console.error('[requestPasswordReset] Supabase error:', sbError.message);
  }

  return { message: 'If an account exists for this email, a reset link has been sent.' };
};

const requestPhonePasswordReset = async ({ phone } = {}) => {
  if (!phone || !String(phone).trim()) {
    const error = new Error('Phone number is required.');
    error.statusCode = 400;
    throw error;
  }

  const normalizedPhone = normalizePhoneNumber(phone);
  const digitsOnly = normalizedPhone.replace(/\D/g, '');
  if (digitsOnly.length < 7 || digitsOnly.length > 15) {
    const error = new Error('Please enter a valid phone number.');
    error.statusCode = 400;
    throw error;
  }

  const { admin: adminClient } = getSupabaseClients();

  if (adminClient) {
    try {
      await findUserByPhone(adminClient, normalizedPhone);
    } catch (err) {
      console.warn('[requestPhonePasswordReset] User lookup notice:', err.message || err);
    }
  }

  const lastFour = normalizedPhone.slice(-4);
  const maskedPhone = `${normalizedPhone.slice(0, 3)} *****${lastFour}`;

  return {
    maskedPhone,
    phone: normalizedPhone,
    message: `If this number is registered, you'll receive a code shortly.`,
  };
};

const verifyPhonePasswordResetOtp = async ({ phone, otp, firebaseToken } = {}) => {
  const { issueResetToken } = require('./otpService');

  if (!phone || !otp) {
    const error = new Error('Phone number and verification code are required.');
    error.statusCode = 400;
    throw error;
  }

  if (!firebaseToken) {
    const error = new Error('Firebase verification token is required for phone OTP flow.');
    error.statusCode = 400;
    throw error;
  }

  const normalizedPhone = normalizePhoneNumber(phone);
  if (!/^\d{6}$/.test(String(otp).trim())) {
    const error = new Error('Please enter a valid 6-digit verification code.');
    error.statusCode = 400;
    throw error;
  }

  const decodedToken = await verifyFirebaseIdToken(firebaseToken);

  if (!decodedToken.phone_number || normalizePhoneNumber(decodedToken.phone_number) !== normalizedPhone) {
    const error = new Error('Firebase token does not match the provided phone number.');
    error.statusCode = 403;
    throw error;
  }

  const { admin: adminClient } = getSupabaseClients();
  if (!adminClient) {
    const error = new Error('Server configuration error: Supabase service role is required for phone password reset.');
    error.statusCode = 500;
    throw error;
  }

  const matchedUser = await findUserByPhone(adminClient, normalizedPhone);
  if (!matchedUser) {
    const error = new Error('No account was found for this verified phone number.');
    error.statusCode = 404;
    throw error;
  }

  const resetToken = issueResetToken(matchedUser);
  return { resetToken };
};

const resetPasswordWithToken = async ({ token, password } = {}) => {
  const { consumeResetToken } = require('./otpService');

  if (!token || !password) {
    const error = new Error('Reset token and new password are required.');
    error.statusCode = 400;
    throw error;
  }

  if (String(password).length < 8) {
    const error = new Error('Password must be at least 8 characters.');
    error.statusCode = 400;
    throw error;
  }

  const { admin: adminClient } = getSupabaseClients();

  if (!adminClient || !adminClient.auth || !adminClient.auth.admin) {
    const error = new Error('Server configuration error: Supabase service role is required to update passwords.');
    error.statusCode = 500;
    throw error;
  }

  const { userId, phone } = await consumeResetToken(adminClient, token);

  let targetUserId = userId;
  if (phone) {
    const found = await findUserByPhone(adminClient, phone);
    if (found) targetUserId = found.id;
  }

  const { error: updateError } = await adminClient.auth.admin.updateUserById(targetUserId, { password });

  if (updateError) {
    console.error('[resetPasswordWithToken] update error:', updateError.message);
    const error = new Error(extractSupabaseMessage(updateError) || 'Failed to update password. Please try again.');
    error.statusCode = 400;
    throw error;
  }

  return { message: 'Password has been reset successfully.' };
};

module.exports = {
  CAMPUSES,
  registerAccount,
  verifyPhoneRegistrationOtp,
  loginAccount,
  getCurrentUser,
  requestPasswordReset,
  requestPhonePasswordReset,
  verifyPhonePasswordResetOtp,
  resetPasswordWithToken,
  validateRegisterPayload,
  validateLoginPayload,
  normalizePhoneNumber,
};
