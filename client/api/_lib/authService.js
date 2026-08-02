const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');

const CAMPUSES = [
  'Main Campus',
  'North Campus',
  'South Campus',
  'East Campus',
  'West Campus',
  'Tech Park Campus',
];

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

const supabaseAdmin = supabaseUrl && serviceRoleKey
  ? createClient(supabaseUrl, serviceRoleKey, clientOptions)
  : null;
const supabasePublic = supabaseUrl && anonKey
  ? createClient(supabaseUrl, anonKey, clientOptions)
  : null;
const supabase = supabaseAdmin || supabasePublic;

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

const validateRegisterPayload = ({ name, email, password, campus, sanUsn } = {}) => {
  const errors = [];

  if (!name || !String(name).trim()) errors.push('Full name is required');
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim())) errors.push('A valid email is required');
  if (!password || String(password).length < 8) errors.push('Password must be at least 8 characters');
  if (!campus || !CAMPUSES.includes(campus)) errors.push('Please select a valid campus');

  const normalizedSanUsn = String(sanUsn || '').trim();
  if (!normalizedSanUsn) errors.push('SAN/USN number is required');
  else if (!/^[A-Za-z0-9]+$/.test(normalizedSanUsn)) errors.push('SAN/USN must contain only letters and numbers');

  return errors;
};

const validateLoginPayload = ({ email, password } = {}) => {
  const errors = [];
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim())) errors.push('A valid email is required');
  if (!password) errors.push('Password is required');
  return errors;
};

const extractAuthMessage = (error) => {
  const raw = error?.message || error?.error_description || error?.error || '';
  if (/already|exists|duplicate|registered/i.test(raw)) {
    return 'An account with this email already exists.';
  }
  if (/password/i.test(raw)) {
    return 'Password does not meet requirements. Please use a stronger password.';
  }
  if (/email/i.test(raw) && /invalid|format/i.test(raw)) {
    return 'Please enter a valid email address.';
  }
  return 'Account creation failed. Please try again.';
};

const isDuplicateAuthError = (error) =>
  /already|exists|duplicate|registered/i.test(error?.message || '') ||
  error?.status === 422 ||
  error?.code === 'user_already_exists';

const createRegistrationError = (error) => {
  const registrationError = new Error(extractAuthMessage(error));
  registrationError.statusCode = isDuplicateAuthError(error) ? 409 : 500;
  return registrationError;
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
  let data = null;
  let error = null;
  try {
    ({ data, error } = await authClient.auth.admin.getUserById(userId));
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

const signUpWithClient = async ({ authClient, email, password, name, campus, role, sanUsn }) => {
  const { data, error } = await authClient.auth.signUp({
    email,
    password,
    options: { data: { name, campus, role, sanUsn } },
  });

  if (error) throw createRegistrationError(error);
  if (!data?.user) throw createRegistrationError(new Error('Account creation failed.'));
  if (Array.isArray(data.user.identities) && data.user.identities.length === 0) {
    throw createRegistrationError({ message: 'User already registered' });
  }

  return { user: data.user, requiresEmailConfirmation: !data.session };
};

const registerAccount = async (payload = {}) => {
  const { name, email, password, campus, sanUsn } = payload;
  const validationErrors = validateRegisterPayload({ name, email, password, campus, sanUsn });
  if (validationErrors.length) {
    const error = new Error(validationErrors.join(', '));
    error.statusCode = 400;
    throw error;
  }

  if (!supabase) ensureSupabase();
  const normalizedEmail = String(email).trim().toLowerCase();
  const normalizedRole = 'student';
  const normalizedSanUsn = String(sanUsn || '').trim().toUpperCase();

  let createdUser;
  let requiresEmailConfirmation = false;

  if (supabaseAdmin) {
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: normalizedEmail,
      password,
      email_confirm: true,
      user_metadata: { name: String(name).trim(), campus, role: normalizedRole, sanUsn: normalizedSanUsn },
    });

    if (!error && data?.user) {
      createdUser = data.user;
    } else {
      if (isDuplicateAuthError(error)) throw createRegistrationError(error);

      try {
        const fallbackResult = await signUpWithClient({
          authClient: supabasePublic || supabaseAdmin,
          email: normalizedEmail,
          password,
          name: String(name).trim(),
          campus,
          role: normalizedRole,
          sanUsn: normalizedSanUsn,
        });
        createdUser = fallbackResult.user;
        requiresEmailConfirmation = fallbackResult.requiresEmailConfirmation;

        if (requiresEmailConfirmation) {
          try {
            await supabaseAdmin.auth.admin.updateUserById(createdUser.id, { email_confirm: true });
            requiresEmailConfirmation = false;
          } catch {
            // The account remains valid and the UI will ask the user to confirm it.
          }
        }
      } catch (fallbackError) {
        if (fallbackError.statusCode) throw fallbackError;
        throw createRegistrationError(error || fallbackError);
      }
    }
  } else {
    const signupResult = await signUpWithClient({
      authClient: supabasePublic,
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
  const { data, error } = await authClient.auth.signInWithPassword({ email: normalizedEmail, password });

  if (error) {
    const authError = new Error('Invalid credentials');
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
    return fetchUserProfileById(authClient, decoded.id, decoded);
  } catch {
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

module.exports = { CAMPUSES, registerAccount, loginAccount, getCurrentUser };
