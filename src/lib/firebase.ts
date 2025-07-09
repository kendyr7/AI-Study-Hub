import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import admin from 'firebase-admin';

// Client-side Firebase config
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase for the client
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);

// Server-side Firebase Admin config
function getAdminApp() {
  if (admin.apps.length > 0) {
    return admin.app();
  }

  if (!process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_BASE64 is not set in .env file');
  }

  const serviceAccountString = Buffer.from(
    process.env.FIREBASE_SERVICE_ACCOUNT_BASE64,
    'base64'
  ).toString('utf-8');

  const serviceAccount = JSON.parse(serviceAccountString);

  return admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const adminDb = admin.firestore(getAdminApp());

export { app, db, adminDb };
