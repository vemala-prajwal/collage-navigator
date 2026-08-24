const fs = require('fs');
const admin = require('firebase-admin');

let firebaseAdminApp = null;

const initFirebaseAdmin = () => {
  if (firebaseAdminApp) return firebaseAdminApp;

  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;

  let credential;
  if (serviceAccountKey) {
    try {
      credential = admin.credential.cert(JSON.parse(serviceAccountKey));
    } catch {
      credential = admin.credential.cert(serviceAccountKey);
    }
  } else if (serviceAccountPath && fs.existsSync(serviceAccountPath)) {
    try {
      credential = admin.credential.cert(JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8')));
    } catch {
      return null;
    }
  } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    try {
      credential = admin.credential.applicationDefault();
    } catch {
      return null;
    }
  } else {
    return null;
  }

  try {
    firebaseAdminApp = admin.initializeApp({ credential });
    return firebaseAdminApp;
  } catch (err) {
    console.warn('[firebaseAdmin] initializeApp notice:', err.message);
    return null;
  }
};

const verifyFirebaseIdToken = async (idToken) => {
  if (!idToken) {
    const error = new Error('Firebase ID token is required.');
    error.statusCode = 400;
    throw error;
  }

  try {
    const app = initFirebaseAdmin();
    if (app) {
      return await app.auth().verifyIdToken(idToken);
    }
  } catch (adminErr) {
    console.warn('[verifyFirebaseIdToken] Firebase Admin verification failed:', adminErr.message || adminErr);
  }

  const error = new Error('Firebase Admin is not configured or the Firebase token is invalid.');
  error.statusCode = 401;
  throw error;
};

module.exports = { verifyFirebaseIdToken };
