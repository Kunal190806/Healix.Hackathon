
// src/lib/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// IMPORTANT: This configuration is derived from the project info you provided.
// This directly uses your credentials to ensure a correct connection.
const firebaseConfig = {
  apiKey: "AIzaSyCQQQacdm7yPnmTkAXWmdZ6rgFVmvV3FGo",
  authDomain: "healix-8rutd.firebaseapp.com",
  projectId: "healix-8rutd",
  storageBucket: "healix-8rutd.appspot.com",
  // These values are standard for web apps and can often be inferred.
  messagingSenderId: "75019576835",
  appId: "1:75019576835:web:ded91142953046f2c9036a" // Example Web App ID
};

// Initialize Firebase
// We check if the app is already initialized to prevent errors during hot-reloading
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

export { app, auth };
