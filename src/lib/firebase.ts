// lib/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {
  initializeFirestore,
  persistentLocalCache,
} from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCKuykOGu445JC9dXF7TkDiD_02C-sq3Xg",
  authDomain: "healix-2-55914771-322a9.firebaseapp.com",
  projectId: "healix-2-55914771-322a9",
  storageBucket: "healix-2-55914771-322a9.appspot.com",
  messagingSenderId: "638476279907",
  appId: "1:638476279907:web:1ec47b623768c8ea8fc1e3",
};

// Only initialize once
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// ✅ Auth
export const auth = getAuth(app);

// ✅ Firestore with persistent local cache
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache(),
});
