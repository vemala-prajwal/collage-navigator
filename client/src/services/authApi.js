import axios from 'axios';
import { CAMPUSES } from '../lib/campuses';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '/api/auth';

const client = axios.create({
  baseURL: apiBaseUrl,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

const createCustomError = (axiosError) => {
  const responseData = axiosError?.response?.data;
  const status = axiosError?.response?.status;

  let message = '';
  if (typeof responseData === 'string' && responseData.trim()) message = responseData;
  else if (responseData?.message) message = responseData.message;
  else if (axiosError?.message) message = axiosError.message;
  else message = 'Something went wrong. Please try again.';

  const err = new Error(message);
  if (responseData?.remainingAttempts !== undefined) err.remainingAttempts = responseData.remainingAttempts;
  if (responseData?.retryAfterSeconds !== undefined) err.retryAfterSeconds = responseData.retryAfterSeconds;
  err.status = status;
  return err;
};

export async function registerUser(payload) {
  try {
    const { data } = await client.post('/register', payload);
    return data;
  } catch (e) {
    throw createCustomError(e);
  }
}

export async function loginUser(payload) {
  try {
    const { data } = await client.post('/login', payload);
    return data;
  } catch (e) {
    throw createCustomError(e);
  }
}

export async function verifyRegistrationOtp(phone, otp, firebaseToken) {
  try {
    const { data } = await client.post('/verify-registration-otp', { phone, otp, firebaseToken });
    return data;
  } catch (e) {
    throw createCustomError(e);
  }
}

export async function requestPasswordReset(email, redirectTo) {
  try {
    const { data } = await client.post('/forgot-password', { email, redirectTo });
    return data;
  } catch (e) {
    throw createCustomError(e);
  }
}

export async function requestPhonePasswordReset(phone) {
  try {
    const { data } = await client.post('/forgot-password-phone', { phone });
    return data;
  } catch (e) {
    throw createCustomError(e);
  }
}

export async function verifyPhoneOtp(phone, otp, firebaseToken) {
  try {
    const { data } = await client.post('/verify-otp', { phone, otp, firebaseToken });
    return data;
  } catch (e) {
    throw createCustomError(e);
  }
}

export async function resetPasswordWithToken(token, password) {
  try {
    const { data } = await client.post('/reset-password-with-token', { token, password });
    return data;
  } catch (e) {
    throw createCustomError(e);
  }
}

export async function fetchCurrentUser(token) {
  if (!token) return null;
  try {
    const { data } = await client.get('/me', { headers: { Authorization: `Bearer ${token}` } });
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
