// ==========================================
// GARIMA'S HOUSE HOLD
// FIREBASE CONFIG
// ==========================================


// ==========================================
// Firebase Imports
// ==========================================

import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";


import {
    getFirestore
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";


import {
    getStorage
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-storage.js";


import {
    getAuth
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";


// ==========================================
// Firebase Configuration
// ==========================================

const firebaseConfig = {

    apiKey:
        "AIzaSyAEyj0zgHep8frvIc8B8ZXkqtRL_4VxKR0",

    authDomain:
        "garima-house-hold.firebaseapp.com",

    projectId:
        "garima-house-hold",

    storageBucket:
        "garima-house-hold.firebasestorage.app",

    messagingSenderId:
        "463243317223",

    appId:
        "1:463243317223:web:218bee4879da4aa544b742",

    measurementId:
        "G-YV13XNYLEG"

};


// ==========================================
// Initialize Firebase
// ==========================================

const app =
    initializeApp(
        firebaseConfig
    );


// ==========================================
// Firebase Authentication
// ==========================================

const auth =
    getAuth(
        app
    );


// ==========================================
// Firestore
// ==========================================

const db =
    getFirestore(
        app
    );


// ==========================================
// Firebase Storage
// ==========================================

const storage =
    getStorage(
        app
    );


// ==========================================
// EXPORT
// ==========================================

export {
    db,
    storage,
    auth
};


// ==========================================
// CONSOLE
// ==========================================

console.log(
    "================================"
);

console.log(
    "Firebase Connected Successfully"
);

console.log(
    "Firestore Ready"
);

console.log(
    "Firebase Storage Ready"
);

console.log(
    "Firebase Authentication Ready"
);

console.log(
    "================================"
);
