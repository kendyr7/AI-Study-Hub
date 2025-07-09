import admin from 'firebase-admin';

// Server-side Firebase Admin config
function initializeAdminApp() {
  if (admin.apps.length > 0) {
    return admin.app();
  }

  const serviceAccountBase64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;

  if (!serviceAccountBase64 || serviceAccountBase64 === "YOUR_SERVICE_ACCOUNT_BASE64_HERE") {
    console.warn(
      'FIREBASE_SERVICE_ACCOUNT_BASE64 is not set or is a placeholder. Firebase Admin features will be disabled.'
    );
    return null;
  }

  try {
    const serviceAccountString = Buffer.from(
      serviceAccountBase64,
      'base64'
    ).toString('utf-8');

    const serviceAccount = JSON.parse(serviceAccountString);

    return admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } catch (error: any) {
    console.error('Failed to initialize Firebase Admin SDK:', error.message);
    return null;
  }
}

const adminApp = initializeAdminApp();
const adminDb = adminApp ? admin.firestore(adminApp) : null;

export { adminDb };
