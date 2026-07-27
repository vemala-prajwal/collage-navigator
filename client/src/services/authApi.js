import axios from 'axios';
import { CAMPUSES } from '../lib/campuses';
import { supabase } from '../lib/supabaseClient';

// Relative path routes through Vite proxy in dev and the host API in production.
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '/api/auth';

const client = axios.create({
  baseURL: apiBaseUrl,
  timeout: 15000,
});

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

const ensureSupabase = () => {
  if (!supabase) {
    throw new Error('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
  }

  return supabase;
};

const shouldUseSupabaseFallback = (error) => {
  const status = error?.response?.status;

  return (
    !error?.response ||
    status === 405 ||
    status === 404 ||
    status === 502 ||
    status === 503 ||
    error?.code === 'ECONNABORTED' ||
    error?.message === 'Network Error'
  );
};

const getErrorMessage = (error) => {
  const responseData = error?.response?.data;

  if (typeof responseData === 'string' && responseData.trim()) {
    return responseData;
  }

  if (responseData?.message) {
    return responseData.message;
  }

  if (responseData?.error) {
    return responseData.error;
  }

  if (responseData?.errors?.length) {
    return responseData.errors.map((item) => item.msg || item.message || item).filter(Boolean).join(', ');
  }

  if (error?.response?.status === 405) {
    return 'Registration is unavailable on this host. Please try again in a moment.';
  }

  if (error?.message === 'Network Error') {
    return 'Unable to reach the server. Make sure the backend is running.';
  }

  if (error?.message) {
    return error.message;
  }

  return 'Something went wrong. Please try again.';
};

const registerWithSupabase = async ({ name, email, password, campus, sanUsn }) => {
  const authClient = ensureSupabase();

  const { data, error } = await authClient.auth.signUp({
    email: email.toLowerCase(),
    password,
    options: {
      data: {
        name,
        campus,
        role: 'student',
        sanUsn: sanUsn || '',
      },
    },
  });

  if (error) {
    if (/already registered|already exists|duplicate/i.test(error.message)) {
      throw new Error('An account with this email already exists');
    }

    throw new Error(error.message);
  }

  if (!data.user) {
    throw new Error('Unable to create your account right now.');
  }

  if (!data.session) {
    const { data: loginData, error: loginError } = await authClient.auth.signInWithPassword({
      email: email.toLowerCase(),
      password,
    });

    if (loginError) {
      throw new Error('Account created. Please check your email to confirm your address, then sign in.');
    }

    return {
      token: loginData.session.access_token,
      user: mapSupabaseUser(loginData.user),
    };
  }

  return {
    token: data.session.access_token,
    user: mapSupabaseUser(data.user),
  };
};

const loginWithSupabase = async ({ email, password }) => {
  const authClient = ensureSupabase();
  const { data, error } = await authClient.auth.signInWithPassword({
    email: email.toLowerCase(),
    password,
  });

  if (error) {
    throw new Error(error.message === 'Invalid login credentials' ? 'Invalid credentials' : error.message);
  }

  return {
    token: data.session.access_token,
    user: mapSupabaseUser(data.user),
  };
};

const fetchCurrentUserFromSupabase = async (token) => {
  if (!supabase || !token) {
    return null;
  }

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) {
    return null;
  }

  return mapSupabaseUser(data.user);
};

export async function registerUser(payload) {
  try {
    const { data } = await client.post('/register', payload);
    return data;
  } catch (error) {
    if (shouldUseSupabaseFallback(error)) {
      return registerWithSupabase(payload);
    }

    throw new Error(getErrorMessage(error));
  }
}

export async function loginUser(payload) {
  try {
    const { data } = await client.post('/login', payload);
    return data;
  } catch (error) {
    if (shouldUseSupabaseFallback(error)) {
      return loginWithSupabase(payload);
    }

    throw new Error(getErrorMessage(error));
  }
}

export async function fetchCurrentUser(token) {
  try {
    const { data } = await client.get('/me', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return data.user;
  } catch (error) {
    if (shouldUseSupabaseFallback(error)) {
      return fetchCurrentUserFromSupabase(token);
    }

    return null;
  }
}

export async function fetchCampuses() {
  try {
    const { data } = await client.get('/campuses');
    return data.campuses;
  } catch {
    return CAMPUSES;
  }
}
