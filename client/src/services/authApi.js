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
 * Creates an Error with attached response details (remainingAttempts, retryAfterSeconds, etc).
 */
const createCustomError = (error) => {
  const responseData = error?.response?.data;

  const parseMessage = (val) => {
    if (!val) return '';
    let str = typeof val === 'string' ? val : JSON.stringify(val);
    if (str.trim().startsWith('{')) {
      try {
        const parsed = JSON.parse(str);
        str = parsed.message || parsed.error_description || parsed.error || str;
      } catch {
        // Keep original string if parse fails
      }
    }
    return typeof str === 'string' ? str : '';
  };

  let message = '';
  if (typeof responseData === 'string' && responseData.trim()) {
    message = parseMessage(responseData);
  } else if (responseData?.message) {
    message = parseMessage(responseData.message);
  } else if (responseData?.error) {
    message = parseMessage(responseData.error);
  } else if (responseData?.errors?.length) {
    message = responseData.errors
      .map((item) => item.msg || item.message || item)
      .filter(Boolean)
      .join(', ');
  }

  const status = error?.response?.status;
  if (!message) {
    if (status === 401) message = 'Invalid credentials or password.';
    else if (status === 409) message = 'An account with this email or phone already exists.';
    else if (status === 400) message = 'Please check your details and try again.';
    else if (status === 404 || status === 405) message = 'Auth service is unavailable. Please try again shortly.';
    else if (status === 500 || status === 502 || status === 503) message = 'The server is temporarily unavailable. Please try again in a moment.';
    else if (error?.code === 'ECONNABORTED') message = 'The request timed out. Please check your connection and try again.';
    else if (error?.message === 'Network Error' || !error?.response) message = 'Unable to reach the server. Make sure you are online.';
    else message = error?.message || 'Something went wrong. Please try again.';
  }

  const customError = new Error(message);
  if (responseData?.remainingAttempts !== undefined) {
    customError.remainingAttempts = responseData.remainingAttempts;
  }
  if (responseData?.retryAfterSeconds !== undefined) {
    customError.retryAfterSeconds = responseData.retryAfterSeconds;
  }
<<<<<<< HEAD

  if (status === 404 || status === 405) {
    return 'Auth service is unavailable. Please try again shortly.';
  }

  if (status === 429) {
    // Pass the backend's message through directly — it contains the real
    // Supabase rate-limit details (e.g. actual retry-after seconds).
    return responseData?.message || 'Too many requests. Please try again in a few minutes.';
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
=======
  customError.status = status;
  return customError;
>>>>>>> prajwal
};

/** Register a new account via the backend API. */
export async function registerUser(payload) {
  try {
    const { data } = await client.post('/register', payload);
    return data;
  } catch (error) {
    throw createCustomError(error);
  }
}

/** Sign in via the backend API. Supports email or phone + password. */
export async function loginUser(payload) {
  try {
    const { data } = await client.post('/login', payload);
    return data;
  } catch (error) {
    throw createCustomError(error);
  }
}

/** Verify phone registration OTP code to activate account and sign in. */
export async function verifyRegistrationOtp(phone, otp, firebaseToken) {
  try {
    const { data } = await client.post('/verify-registration-otp', { phone, otp, firebaseToken });
    return data;
  } catch (error) {
    throw createCustomError(error);
  }
}

/** Request password reset via Email */
export async function requestPasswordReset(email) {
  try {
    const { data } = await client.post('/forgot-password', { email });
    return data;
  } catch (error) {
    throw createCustomError(error);
  }
}

/** Request password reset OTP via Phone */
export async function requestPhonePasswordReset(phone) {
  try {
    const { data } = await client.post('/forgot-password-phone', { phone });
    return data;
  } catch (error) {
    throw createCustomError(error);
  }
}

/** Verify Phone Password Reset OTP */
export async function verifyPhoneOtp(phone, otp, firebaseToken) {
  try {
    const { data } = await client.post('/verify-otp', { phone, otp, firebaseToken });
    return data;
  } catch (error) {
    throw createCustomError(error);
  }
}

/** Reset password using the verification token issued after OTP verification */
export async function resetPasswordWithToken(token, password) {
  try {
    const { data } = await client.post('/reset-password-with-token', { token, password });
    return data;
  } catch (error) {
    throw createCustomError(error);
  }
}

/** Request password reset email via the backend API. */
export async function requestPasswordReset(email, redirectTo) {
  try {
    const { data } = await client.post('/forgot-password', { email, redirectTo });
    return data;
  } catch (axiosError) {
    const message = getErrorMessage(axiosError);
    const err = new Error(message);
    const retryAfter = axiosError?.response?.data?.retryAfterSeconds;
    if (retryAfter != null) err.retryAfterSeconds = retryAfter;
    throw err;
  }
}

/** Request password reset OTP via SMS for phone number. */
export async function requestPhonePasswordReset(phone) {
  try {
    const { data } = await client.post('/forgot-password-phone', { phone });
    return data;
  } catch (axiosError) {
    const message = getErrorMessage(axiosError);
    const err = new Error(message);
    const retryAfter = axiosError?.response?.data?.retryAfterSeconds;
    if (retryAfter != null) err.retryAfterSeconds = retryAfter;
    throw err;
  }
}

/** Verify 6-digit phone OTP code. */
export async function verifyPhoneOtp(phone, otp) {
  try {
    const { data } = await client.post('/verify-otp', { phone, otp });
    return data;
  } catch (axiosError) {
    const message = getErrorMessage(axiosError);
    const err = new Error(message);
    const remaining = axiosError?.response?.data?.remainingAttempts;
    if (remaining != null) err.remainingAttempts = remaining;
    throw err;
  }
}

/** Reset password using short-lived verified token (phone flow). */
export async function resetPasswordWithToken(resetToken, newPassword) {
  try {
    const { data } = await client.post('/reset-password-with-token', { resetToken, newPassword });
    return data;
  } catch (axiosError) {
    const message = getErrorMessage(axiosError);
    throw new Error(message);
  }
}

/**
 * Validate an existing session token against the backend.
 */
export async function fetchCurrentUser(token) {
  if (!token) return null;
  try {
    const { data } = await client.get('/me', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return data.user || null;
  } catch {
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
