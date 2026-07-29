const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');
const { CAMPUSES } = require('../constants/campuses');

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SERVICE_ROLE ||
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

const supabase = supabaseUrl && supabaseServiceRoleKey
  ? createClient(supabaseUrl, supabaseServiceRoleKey)
  : null;

const generateToken = (user) =>
  jwt.sign(
    { id: user.id, role: user.role, sanUsn: user.sanUsn || '' },
    process.env.JWT_SECRET || 'dev-secret',
    { expiresIn: '7d' }
  );

const validateRegisterPayload = ({ name, email, password, campus, sanUsn }) => {
  const errors = [];

  if (!name || !String(name).trim()) {
    errors.push('Full name is required');
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim())) {
    errors.push('A valid email is required');
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

const validateLoginPayload = ({ email, password }) => {
  const errors = [];

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim())) {
    errors.push('A valid email is required');
  }

  if (!password) {
    errors.push('Password is required');
  }

  return errors;
};

const ensureSupabase = () => {
  if (!supabase) {
    const error = new Error('Supabase is not configured on the server.');
    error.statusCode = 500;
    throw error;
  }

  return supabase;
};

const mapSupabaseUser = (user) => {
  const metadata = user.user_metadata || {};

  return {
    id: user.id,
    name: metadata.name || user.email,
    email: user.email,
    campus: metadata.campus || 'Main Campus',
    role: metadata.role || 'student',
    sanUsn: metadata.sanUsn || '',
  };
};

const fetchUserProfileById = async (authClient, userId, decodedFallback = {}) => {
  const { data, error } = await authClient.auth.admin.getUserById(userId);

  if (!error && data?.user) {
    return mapSupabaseUser(data.user);
  }

  return {
    id: decodedFallback.id || userId,
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

const confirmUserEmail = async (authClient, userId) => {
  await authClient.auth.admin.updateUserById(userId, { email_confirm: true });
};

const registerAccount = async ({ name, email, password, campus, role, sanUsn }) => {
  const validationErrors = validateRegisterPayload({ name, email, password, campus, sanUsn });
  if (validationErrors.length) {
    const error = new Error(validationErrors.join(', '));
    error.statusCode = 400;
    throw error;
  }

  const authClient = ensureSupabase();
  const normalizedEmail = String(email).trim().toLowerCase();
  const normalizedRole = role || 'student';
  const normalizedSanUsn = String(sanUsn || '').trim().toUpperCase();

  // Check if the email is already registered before attempting creation.
  // Wrap in try/catch so a Supabase admin API failure never surfaces as
  // an unstructured error; we simply skip the pre-check and let createUser
  // handle duplicates itself.
  try {
    const existingUser = await findUserByEmail(authClient, normalizedEmail);
    if (existingUser) {
      const duplicateError = new Error('An account with this email already exists.');
      duplicateError.statusCode = 409;
      throw duplicateError;
    }
  } catch (preCheckError) {
    // Re-throw only if it is our own structured error (has statusCode).
    if (preCheckError.statusCode) {
      throw preCheckError;
    }
    // Otherwise log and continue — createUser will catch true duplicates below.
    console.error('[registerAccount] pre-check error:', preCheckError.message || preCheckError);
  }

  const { data, error } = await authClient.auth.admin.createUser({
    email: normalizedEmail,
    password,
    email_confirm: true,
    user_metadata: {
      name: String(name).trim(),
      campus,
      role: normalizedRole,
      sanUsn: normalizedSanUsn,
    },
  });

  if (error) {
    // Supabase may still return 422 / duplicate errors if race-condition hit.
    if (
      /already|exists|duplicate|registered/i.test(error.message) ||
      error.status === 422
    ) {
      const duplicateError = new Error('An account with this email already exists.');
      duplicateError.statusCode = 409;
      throw duplicateError;
    }

    const serviceError = new Error(error.message || 'Account creation failed.');
    serviceError.statusCode = 500;
    throw serviceError;
  }

  return {
    token: generateToken({ id: data.user.id, role: normalizedRole, sanUsn: normalizedSanUsn }),
    user: {
      id: data.user.id,
      name: String(name).trim(),
      email: normalizedEmail,
      campus,
      role: normalizedRole,
      sanUsn: normalizedSanUsn,
    },
  };
};

const loginAccount = async ({ email, password }) => {
  const validationErrors = validateLoginPayload({ email, password });
  if (validationErrors.length) {
    const error = new Error(validationErrors.join(', '));
    error.statusCode = 400;
    throw error;
  }

  const authClient = ensureSupabase();
  const normalizedEmail = String(email).trim().toLowerCase();

  let { data, error } = await authClient.auth.signInWithPassword({
    email: normalizedEmail,
    password,
  });

  // If Supabase reports the email is unconfirmed (e.g. old account created without
  // email_confirm:true), auto-confirm it with the admin API and retry once.
  if (error && /email not confirmed/i.test(error.message)) {
    try {
      const unconfirmedUser = await findUserByEmail(authClient, normalizedEmail);
      if (unconfirmedUser) {
        await authClient.auth.admin.updateUserById(unconfirmedUser.id, { email_confirm: true });
        const retry = await authClient.auth.signInWithPassword({
          email: normalizedEmail,
          password,
        });
        if (!retry.error) {
          data = retry.data;
          error = null;
        }
      }
    } catch {
      // Fall through to the error handler below.
    }
  }

  if (error) {
    const authError = new Error('Invalid email or password.');
    authError.statusCode = 401;
    throw authError;
  }

  const metadata = data.user.user_metadata || {};

  return {
    token: generateToken({
      id: data.user.id,
      role: metadata.role || 'student',
      sanUsn: metadata.sanUsn || '',
    }),
    user: {
      id: data.user.id,
      name: metadata.name || normalizedEmail,
      email: data.user.email,
      campus: metadata.campus || 'Main Campus',
      role: metadata.role || 'student',
      sanUsn: metadata.sanUsn || '',
    },
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
    return fetchUserProfileById(authClient, decoded.id, decoded);
  } catch (jwtError) {
    if (!supabase) {
      const error = new Error('Not authorized, invalid token');
      error.statusCode = 401;
      throw error;
    }

    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data?.user) {
      const authError = new Error('Not authorized, invalid token');
      authError.statusCode = 401;
      throw authError;
    }

    return mapSupabaseUser(data.user);
  }
};

module.exports = {
  CAMPUSES,
  registerAccount,
  loginAccount,
  getCurrentUser,
  validateRegisterPayload,
  validateLoginPayload,
};
