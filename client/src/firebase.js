// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";  // 👈 add this
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCgVglRtUwAwSXzdDu6MDo8zgcONyL-TBU",
  authDomain: "alumni-association-platf-b5241.firebaseapp.com",
  projectId: "alumni-association-platf-b5241",
  storageBucket: "alumni-association-platf-b5241.appspot.com",
  messagingSenderId: "470364056853",
  appId: "1:470364056853:web:e9b1411c106881482c0d1c",
  measurementId: "G-55WDDSYBLG",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Auth
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Firestore
const db = getFirestore(app);

// Storage 👇
const storage = getStorage(app);

// Optional: Analytics
const analytics = getAnalytics(app);

export { auth, googleProvider, db, storage, analytics }; // ✅ export storage
