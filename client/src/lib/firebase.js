import { initializeApp } from 'firebase/app';
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const firebaseApp = initializeApp(firebaseConfig);
export const firebaseAuth = getAuth(firebaseApp);

const getRecaptchaVerifier = (containerId = 'recaptcha-container') => {
  if (typeof window === 'undefined') {
    throw new Error('RecaptchaVerifier requires a browser environment.');
  }

  const win = window;
  if (win.firebaseRecaptchaVerifier) {
    return win.firebaseRecaptchaVerifier;
  }

  win.firebaseRecaptchaVerifier = new RecaptchaVerifier(containerId, { size: 'invisible' }, firebaseAuth);
  return win.firebaseRecaptchaVerifier;
};

export function normalizePhoneNumber(phoneNumber) {
  if (!phoneNumber) return '';
  const digits = phoneNumber.toString().replace(/\D/g, '');
  return digits.startsWith('0') ? `+91${digits.slice(1)}` : digits.startsWith('+') ? `+${digits.replace(/[^\d]/g, '')}` : `+91${digits}`;
}

export function sendPhoneOtp(phoneNumber, containerId = 'recaptcha-container') {
  const verifier = getRecaptchaVerifier(containerId);
  return signInWithPhoneNumber(firebaseAuth, phoneNumber, verifier);
}

export function confirmPhoneOtp(confirmationResult, code) {
  return confirmationResult.confirm(code);
}
