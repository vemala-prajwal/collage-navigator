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

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE;

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

  if (!name || !String(name).trim()) errors.push('Full name is required');
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim())) errors.push('A valid email is required');
  if (!password || String(password).length < 8) errors.push('Password must be at least 8 characters');
  if (!campus || !CAMPUSES.includes(campus)) errors.push('Please select a valid campus');

  const normalizedSanUsn = String(sanUsn || '').trim();
  if (!normalizedSanUsn) errors.push('SAN/USN number is required');
  else if (!/^[A-Za-z0-9]+$/.test(normalizedSanUsn)) errors.push('SAN/USN must contain only letters and numbers');

  return errors;
};

const validateLoginPayload = ({ email, password }) => {
  const errors = [];
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim())) errors.push('A valid email is required');
  if (!password) errors.push('Password is required');
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

  const { data, error } = await authClient.auth.admin.createUser({
    email: normalizedEmail,
    password,
    email_confirm: true,
    user_metadata: { name: String(name).trim(), campus, role: normalizedRole, sanUsn: normalizedSanUsn },
  });

  if (error) {
    if (/already|exists|duplicate|registered/i.test(error.message)) {
      const duplicateError = new Error('An account with this email already exists');
      duplicateError.statusCode = 400;
      throw duplicateError;
    }
    throw error;
  }

  return {
    token: generateToken({ id: data.user.id, role: normalizedRole, sanUsn: normalizedSanUsn }),
    user: { id: data.user.id, name: String(name).trim(), email: normalizedEmail, campus, role: normalizedRole, sanUsn: normalizedSanUsn },
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
  const { data, error } = await authClient.auth.signInWithPassword({ email: normalizedEmail, password });

  if (error) {
    const authError = new Error('Invalid credentials');
    authError.statusCode = 401;
    throw authError;
  }

  const metadata = data.user.user_metadata || {};
  return {
    token: generateToken({ id: data.user.id, role: metadata.role || 'student', sanUsn: metadata.sanUsn || '' }),
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
