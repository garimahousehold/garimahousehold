// ==========================================
// Firebase Imports
// ==========================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";

import { getFirestore } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

import { getAuth } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";

// ==========================================
// Firebase Configuration
// ==========================================

const firebaseConfig = {

  apiKey: "AIzaSyAEyj0zgHep8frvIc8B8ZXkqtRL_4VxKR0",

  authDomain: "garima-house-hold.firebaseapp.com",

  projectId: "garima-house-hold",

  storageBucket: "garima-house-hold.firebasestorage.app",

  messagingSenderId: "463243317223",

  appId: "1:463243317223:web:218bee4879da4aa544b742",

  measurementId: "G-YV13XNYLEG"

};

// ==========================================
// Initialize Firebase
// ==========================================

const app = initializeApp(firebaseConfig);

// ==========================================
// Services
// ==========================================

const db = getFirestore(app);

const auth = getAuth(app);

// ==========================================
// Exports
// ==========================================

export { db, auth };

// ==========================================
// Console
// ==========================================

console.log("✅ Firebase Connected Successfully");
