import { initializeApp } from 'firebase/app';
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string,
  appId: import.meta.env.VITE_FIREBASE_APP_ID as string,
};

const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.authDomain &&
  firebaseConfig.projectId &&
  firebaseConfig.appId &&
  firebaseConfig.apiKey !== 'undefined'
);

let _firebaseApp: ReturnType<typeof initializeApp> | null = null;
const getFirebaseApp = () => {
  if (_firebaseApp) return _firebaseApp;
  if (!isFirebaseConfigured) {
    throw new Error('Firebase Phone Authentication is not configured.');
  }
  _firebaseApp = initializeApp(firebaseConfig);
  return _firebaseApp;
};

let _firebaseAuth: ReturnType<typeof getAuth> | null = null;
const getFirebaseAuth = () => {
  if (_firebaseAuth) return _firebaseAuth;
  if (typeof window === 'undefined') {
    throw new Error('getFirebaseAuth requires a browser environment.');
  }
  _firebaseAuth = getAuth(getFirebaseApp());
  return _firebaseAuth;
};

const getRecaptchaVerifier = (containerId = 'recaptcha-container'): RecaptchaVerifier => {
  if (typeof window === 'undefined') {
    throw new Error('RecaptchaVerifier requires a browser environment.');
  }

  const win = window as Window & { firebaseRecaptchaVerifier?: RecaptchaVerifier };
  if (win.firebaseRecaptchaVerifier) {
    return win.firebaseRecaptchaVerifier;
  }

  win.firebaseRecaptchaVerifier = new RecaptchaVerifier(containerId, { size: 'invisible' }, getFirebaseAuth());
  return win.firebaseRecaptchaVerifier;
};

export function sendPhoneOtp(
  phoneNumber: string,
  containerId = 'recaptcha-container'
): Promise<ConfirmationResult> {
  const verifier = getRecaptchaVerifier(containerId);
  return signInWithPhoneNumber(getFirebaseAuth(), phoneNumber, verifier);
}

export function confirmPhoneOtp(confirmationResult: ConfirmationResult, code: string) {
  return confirmationResult.confirm(code);
}

export { getFirebaseAuth };
