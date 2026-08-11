import { initializeApp } from 'firebase/app';
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber, signOut } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.authDomain &&
  firebaseConfig.projectId &&
  firebaseConfig.appId &&
  firebaseConfig.apiKey !== 'undefined'
);

let _firebaseApp = null;
const getFirebaseApp = () => {
  if (_firebaseApp) return _firebaseApp;
  _firebaseApp = initializeApp(firebaseConfig);
  return _firebaseApp;
};

let _firebaseAuth = null;
const getFirebaseAuth = () => {
  if (_firebaseAuth) return _firebaseAuth;
  if (typeof window === 'undefined') {
    throw new Error('getFirebaseAuth requires a browser environment.');
  }
  _firebaseAuth = getAuth(getFirebaseApp());
  return _firebaseAuth;
};

const getRecaptchaVerifier = (containerId = 'recaptcha-container') => {
  if (typeof window === 'undefined') {
    throw new Error('RecaptchaVerifier requires a browser environment.');
  }

  const win = window;
  if (win.firebaseRecaptchaVerifier) {
    return win.firebaseRecaptchaVerifier;
  }

  win.firebaseRecaptchaVerifier = new RecaptchaVerifier(containerId, { size: 'invisible' }, getFirebaseAuth());
  return win.firebaseRecaptchaVerifier;
};

const resetRecaptchaVerifier = () => {
  if (typeof window === 'undefined') return;
  const win = window;
  if (win.firebaseRecaptchaVerifier) {
    try {
      win.firebaseRecaptchaVerifier.clear();
    } catch {
      // Ignore cleanup errors; the next send attempt will create a new verifier.
    }
    delete win.firebaseRecaptchaVerifier;
  }
};

const mapFirebasePhoneError = (err) => {
  const code = err?.code || '';
  if (code === 'auth/invalid-phone-number') return 'Please enter a valid phone number in international format.';
  if (code === 'auth/too-many-requests') return 'Too many SMS attempts. Please wait before requesting another code.';
  if (code === 'auth/quota-exceeded') return 'SMS quota has been exceeded for this Firebase project.';
  if (code === 'auth/captcha-check-failed') return 'reCAPTCHA verification failed. Please try again.';
  if (code === 'auth/unauthorized-domain') return 'This domain is not authorized in Firebase Phone Authentication.';
  if (code === 'auth/app-not-authorized') return 'This Firebase app is not authorized to use Phone Authentication.';
  if (code === 'auth/invalid-verification-code') return 'Incorrect verification code. Please check the 6 digits and try again.';
  if (code === 'auth/code-expired' || code === 'auth/session-expired') return 'Verification code has expired. Please request a new code.';
  return err?.message || 'Unable to send SMS verification code.';
};

export function normalizePhoneNumber(phoneNumber) {
  if (!phoneNumber) return '';
  const raw = phoneNumber.toString().trim();
  const digits = raw.replace(/\D/g, '');
  if (!digits) return '';
  if (raw.startsWith('+')) return `+${digits}`;
  if (/^0\d{10}$/.test(digits)) return `+91${digits.slice(1)}`;
  if (/^\d{10}$/.test(digits)) return `+91${digits}`;
  return `+${digits}`;
}

export async function sendPhoneOtp(phoneNumber, containerId = 'recaptcha-container') {
  const normalized = normalizePhoneNumber(phoneNumber);

  if (!isFirebaseConfigured) {
    throw new Error('Firebase Phone Authentication is not configured. Add the VITE_FIREBASE_* environment variables.');
  }

  try {
    const verifier = getRecaptchaVerifier(containerId);
    return await signInWithPhoneNumber(getFirebaseAuth(), normalized, verifier);
  } catch (err) {
    resetRecaptchaVerifier();
    throw new Error(mapFirebasePhoneError(err));
  }
}

export async function confirmPhoneOtp(confirmationResult, code) {
  try {
    return await confirmationResult.confirm(code);
  } catch (err) {
    throw new Error(mapFirebasePhoneError(err));
  }
}

export async function clearFirebasePhoneSession() {
  try {
    await signOut(getFirebaseAuth());
  } catch {
    // Firebase is only used as a phone verifier in this app.
  }
}

export { getFirebaseAuth };
