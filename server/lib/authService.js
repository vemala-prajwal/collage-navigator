const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');
const { CAMPUSES } = require('../constants/campuses');

// Load environment variables before anything reads them. In local dev the
// server/.env file is used; on Vercel/other platforms the env vars are usually
// already in process.env, so a missing file is a no-op. This also keeps module
// load order irrelevant: no matter which entrypoint requires this file first,
// the Supabase credentials are available by the time they are needed.
const envCandidates = [
  path.resolve(__dirname, '../.env'),
  path.resolve(__dirname, '../../.env'),
  path.resolve(process.cwd(), '.env'),
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

const validateRegisterPayload = ({ name, email, password, campus, sanUsn } = {}) => {
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

const validateLoginPayload = ({ email, password } = {}) => {
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
    name: metadata.name || user.email,
    email: user.email,
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

const registerAccount = async (payload = {}) => {
  const { name, email, password, campus, sanUsn } = payload;
  const validationErrors = validateRegisterPayload({ name, email, password, campus, sanUsn });
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
  // Public registration must never be able to assign an elevated role.
  const normalizedRole = 'student';
  const normalizedSanUsn = String(sanUsn || '').trim().toUpperCase();

  let createdUser;
  let requiresEmailConfirmation = false;

  if (adminClient) {
    // Check for an existing account before attempting creation. If the admin
    // listing endpoint is unavailable, createUser below remains the source of
    // truth and still handles duplicates safely.
    try {
      const existingUser = await findUserByEmail(adminClient, normalizedEmail);
      if (existingUser) {
        const duplicateError = new Error('An account with this email already exists.');
        duplicateError.statusCode = 409;
        throw duplicateError;
      }
    } catch (preCheckError) {
      if (preCheckError.statusCode) {
        throw preCheckError;
      }
      console.error('[registerAccount] pre-check error:', preCheckError.message || preCheckError);
    }

    const { data, error } = await adminClient.auth.admin.createUser({
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

    if (!error && data?.user) {
      createdUser = data.user;
    } else {
      console.error('[registerAccount] createUser error:', error?.message || error);

      if (isDuplicateAuthError(error)) {
        throw createRegistrationError(error);
      }

      // Use the public client when the admin endpoint is unavailable. This
      // keeps registration usable on Vercel even when only the anon key is
      // configured, while still auto-confirming when admin access exists.
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

        if (requiresEmailConfirmation && adminClient) {
          try {
            await confirmUserEmail(adminClient, createdUser.id);
            requiresEmailConfirmation = false;
          } catch (confirmError) {
            console.warn('[registerAccount] Failed to auto-confirm fallback user:', confirmError.message);
          }
        }
      } catch (fallbackError) {
        if (fallbackError.statusCode) throw fallbackError;

        console.error('[registerAccount] signUp fallback error:', fallbackError.message || fallbackError);
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
  const { email, password } = payload;
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
      const adminClient = getSupabaseAdminClient();
      const unconfirmedUser = adminClient
        ? await findUserByEmail(adminClient, normalizedEmail)
        : null;
      if (unconfirmedUser) {
        await adminClient.auth.admin.updateUserById(unconfirmedUser.id, { email_confirm: true });
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
  const user = {
    id: data.user.id,
    name: metadata.name || normalizedEmail,
    email: data.user.email,
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

module.exports = {
  CAMPUSES,
  registerAccount,
  loginAccount,
  getCurrentUser,
  validateRegisterPayload,
  validateLoginPayload,
};
