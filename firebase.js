// ==========================================
// Firebase Imports
// ==========================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";

import { getFirestore } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

// ==========================================
// Firebase Configuration
// ==========================================

const firebaseConfig = {
  apiKey: "YAHA_APNI_API_KEY",
  authDomain: "garima-house-hold.firebaseapp.com",
  projectId: "garima-house-hold",
  storageBucket: "garima-house-hold.firebasestorage.app",
  messagingSenderId: "463243317223",
  appId: "1:463243317223:web:218bee4879da4aa544b742"
};

// ==========================================
// Initialize Firebase
// ==========================================

const app = initializeApp(firebaseConfig);

// ==========================================
// Firestore Database
// ==========================================

const db = getFirestore(app);

// ==========================================
// Export
// ==========================================

export { db };

// ==========================================
// Console
// ==========================================

console.log("================================");
console.log("Firebase Connected Successfully");
console.log("Firestore Ready");
console.log("================================");