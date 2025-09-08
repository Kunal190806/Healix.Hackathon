// lib/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCQQQacdm7yPnmTkAXWmdZ6rgFVmvV3FGo",
  authDomain: "healix-8rutd.firebaseapp.com",
  projectId: "healix-8rutd",
  storageBucket: "healix-8rutd.appspot.com",
  messagingSenderId: "75019576835",
  appId: "1:75019576835:web:8c37d3ba4c9527f42c9036"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
