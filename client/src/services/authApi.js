import axios from 'axios';
import { CAMPUSES } from '../lib/campuses';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '/api/auth';

const client = axios.create({
  baseURL: apiBaseUrl,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Extracts a human-readable error message from an Axios error.
 * All auth is routed through the backend — no client-side Supabase fallback.
 */
const getErrorMessage = (error) => {
  const responseData = error?.response?.data;

  if (typeof responseData === 'string' && responseData.trim()) {
    return responseData;
  }

  if (responseData?.message) {
    const msg = typeof responseData.message === 'string'
      ? responseData.message
      : JSON.stringify(responseData.message);
    if (msg && msg !== '{}') return msg;
  }

  if (responseData?.error) {
    const msg = typeof responseData.error === 'string'
      ? responseData.error
      : JSON.stringify(responseData.error);
    if (msg && msg !== '{}') return msg;
  }

  if (responseData?.errors?.length) {
    return responseData.errors
      .map((item) => item.msg || item.message || item)
      .filter(Boolean)
      .join(', ');
  }

  const status = error?.response?.status;

  if (status === 401) {
    return 'Invalid email or password.';
  }

  if (status === 409) {
    return 'An account with this email already exists.';
  }

  if (status === 400) {
    return responseData?.message || 'Please check your details and try again.';
  }

  if (status === 404 || status === 405) {
    return 'Auth service is unavailable. Please try again shortly.';
  }

  if (status === 500 || status === 502 || status === 503) {
    return 'The server is temporarily unavailable. Please try again in a moment.';
  }

  if (error?.code === 'ECONNABORTED') {
    return 'The request timed out. Please check your connection and try again.';
  }

  if (error?.message === 'Network Error' || !error?.response) {
    return 'Unable to reach the server. Make sure you are online and the backend is running.';
  }

  if (error?.message) {
    return error.message;
  }

  return 'Something went wrong. Please try again.';
};

/** Register a new account via the backend API. */
export async function registerUser(payload) {
  try {
    const { data } = await client.post('/register', payload);
    return data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/** Sign in via the backend API. */
export async function loginUser(payload) {
  try {
    const { data } = await client.post('/login', payload);
    return data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Validate an existing session token against the backend.
 * Returns null (without throwing) if the token is invalid/expired so the
 * AuthProvider can clear the session silently.
 */
export async function fetchCurrentUser(token) {
  if (!token) return null;
  try {
    const { data } = await client.get('/me', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return data.user || null;
  } catch {
    // Token is invalid or backend is unreachable — clear the session.
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
