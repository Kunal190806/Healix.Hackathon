
// lib/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAwaZ_8AZwLrglCkuRleZjZCJqMp0vJS3I",
  authDomain: "healix-8rutd.firebaseapp.com",
  projectId: "healix-8rutd",
  storageBucket: "healix-8rutd.appspot.com",
  messagingSenderId: "1032994992983",
  appId: "1:1032994992983:web:0b4b29d5b7826359a34b28",
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
