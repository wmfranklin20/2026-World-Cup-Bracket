import { getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

interface FirebaseEnv {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
}

function readEnv(): FirebaseEnv {
  const env = import.meta.env;
  const required = {
    apiKey: env.VITE_FIREBASE_API_KEY,
    authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: env.VITE_FIREBASE_APP_ID,
  };
  const missing = Object.entries(required)
    .filter(([, v]) => !v)
    .map(([k]) => `VITE_FIREBASE_${k.replace(/[A-Z]/g, (c) => `_${c}`).toUpperCase()}`);
  if (missing.length > 0) {
    throw new Error(
      `Firebase config missing env vars: ${missing.join(', ')}. ` +
        `Copy .env.example to .env.local and fill values from the Firebase console.`,
    );
  }
  return {
    ...(required as Required<typeof required>),
    measurementId: env.VITE_FIREBASE_MEASUREMENT_ID,
  };
}

const config = readEnv();

export const app: FirebaseApp =
  getApps()[0] ?? initializeApp(config);

export const db: Firestore = getFirestore(app);
export const auth: Auth = getAuth(app);
