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

export const firebaseApp = initializeApp(firebaseConfig);
export const firebaseAuth = getAuth(firebaseApp);

const getRecaptchaVerifier = (containerId = 'recaptcha-container'): RecaptchaVerifier => {
  if (typeof window === 'undefined') {
    throw new Error('RecaptchaVerifier requires a browser environment.');
  }

  const win = window as Window & { firebaseRecaptchaVerifier?: RecaptchaVerifier };
  if (win.firebaseRecaptchaVerifier) {
    return win.firebaseRecaptchaVerifier;
  }

  win.firebaseRecaptchaVerifier = new RecaptchaVerifier(containerId, { size: 'invisible' }, firebaseAuth);
  return win.firebaseRecaptchaVerifier;
};

export function sendPhoneOtp(
  phoneNumber: string,
  containerId = 'recaptcha-container'
): Promise<ConfirmationResult> {
  const verifier = getRecaptchaVerifier(containerId);
  return signInWithPhoneNumber(firebaseAuth, phoneNumber, verifier);
}

export function confirmPhoneOtp(confirmationResult: ConfirmationResult, code: string) {
  return confirmationResult.confirm(code);
}
