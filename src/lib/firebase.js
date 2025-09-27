// Firebase initialization for Habitah Admin
// Note: Requires installing the SDK: `npm i firebase`

// We isolate imports so you can import only what you need in client components
// to avoid SSR pitfalls with Auth/Analytics.

import { initializeApp, getApps, getApp } from "firebase/app";

// If you need these services, import them where used:
// import { getAuth } from "firebase/auth";
// import { getFirestore } from "firebase/firestore";
// import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Optional helpers to access services without forcing SSR usage
export const getClientAuth = async () => {
  if (typeof window === "undefined") return null;
  const { getAuth } = await import("firebase/auth");
  return getAuth(app);
};

export const getDb = async () => {
  const { getFirestore } = await import("firebase/firestore");
  return getFirestore(app);
};

export const getStorageClient = async () => {
  const { getStorage } = await import("firebase/storage");
  return getStorage(app);
};
