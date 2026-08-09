const fs = require('fs');
const admin = require('firebase-admin');

let firebaseAdminApp = null;

const initFirebaseAdmin = () => {
  if (firebaseAdminApp) return firebaseAdminApp;

  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;

  let credential;
  if (serviceAccountKey) {
    credential = admin.credential.cert(JSON.parse(serviceAccountKey));
  } else if (serviceAccountPath && fs.existsSync(serviceAccountPath)) {
    credential = admin.credential.cert(JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8')));
  } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    credential = admin.credential.applicationDefault();
  } else {
    const error = new Error('Firebase admin credentials are not configured. Set FIREBASE_SERVICE_ACCOUNT_KEY, FIREBASE_SERVICE_ACCOUNT_PATH, or GOOGLE_APPLICATION_CREDENTIALS.');
    error.statusCode = 500;
    throw error;
  }

  firebaseAdminApp = admin.initializeApp({ credential });
  return firebaseAdminApp;
};

const verifyFirebaseIdToken = async (idToken) => {
  if (!idToken) {
    const error = new Error('Firebase ID token is required.');
    error.statusCode = 400;
    throw error;
  }

  const app = initFirebaseAdmin();
  return app.auth().verifyIdToken(idToken);
};

module.exports = { verifyFirebaseIdToken };
