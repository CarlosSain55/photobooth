import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// getAuth() throws synchronously on an invalid/missing API key, so guard
// against that until the user has copied .env.example to .env and filled
// in a real Firebase project — otherwise the whole app would white-screen.
export const isFirebaseConfigured = !!firebaseConfig.apiKey;

export const app = isFirebaseConfigured ? initializeApp(firebaseConfig) : null;
export const auth = isFirebaseConfigured ? getAuth(app) : null;
