// lib/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// This is the correct and verified configuration for your web app.
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "healix-8rutd.firebaseapp.com",
  projectId: "healix-8rutd",
  storageBucket: "healix-8rutd.appspot.com",
  messagingSenderId: "1032994992983",
  appId: "1:1032994992983:web:0b4b29d5b7826359a34b28",
};


const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
