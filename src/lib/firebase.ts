// lib/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCKuykOGu445JC9dXF7TkDiD_02C-sq3Xg",
  authDomain: "healix-2-55914771-322a9.firebaseapp.com",
  projectId: "healix-2-55914771-322a9",
  storageBucket: "healix-2-55914771-322a9.appspot.com",
  messagingSenderId: "638476279907",
  appId: "1:638476279907:web:8032775591632731c3605c",
};


const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);

if (typeof window !== 'undefined') {
  try {
    enableIndexedDbPersistence(db)
      .catch((err) => {
        if (err.code == 'failed-precondition') {
          // Multiple tabs open, persistence can only be enabled
          // in one tab at a time.
          console.warn('Firestore persistence failed: Multiple tabs open.');
        } else if (err.code == 'unimplemented') {
          // The current browser does not support all of the
          // features required to enable persistence.
          console.warn('Firestore persistence failed: Browser does not support persistence.');
        }
      });
  } catch(e) {
      console.error('Error enabling firestore persistence', e);
  }
}
