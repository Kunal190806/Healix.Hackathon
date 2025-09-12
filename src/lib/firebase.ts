// lib/firebase.ts
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import {
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  Firestore,
} from "firebase/firestore";

// ✅ Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCKuykOGu445JC9dXF7TkDiD_02C-sq3Xg",
  authDomain: "healix-2-55914771-322a9.firebaseapp.com",
  projectId: "healix-2-55914771-322a9",
  storageBucket: "healix-2-55914771-322a9.appspot.com",
  messagingSenderId: "638476279907",
  appId: "1:638476279907:web:1ec47b623768c8ea8fc1e3",
};

// ✅ Initialize app only once
let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

// ✅ Export Auth
export const auth: Auth = getAuth(app);

// ✅ Initialize Firestore with persistence
let db: Firestore;
try {
  db = initializeFirestore(app, {
    localCache: persistentLocalCache(),
  });
} catch (err) {
  console.warn("Firestore persistence not supported, using default cache:", err);
  db = getFirestore(app);
}

export { db };
