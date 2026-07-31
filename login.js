import { auth } from "./firebase.js";

import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";

console.log("Login JS Loaded");
console.log("✅ Login JS Loaded");
const loginForm = document.getElementById("loginForm");
const email = document.getElementById("email");
const password = document.getElementById("password");
const remember = document.getElementById("remember");
const message = document.getElementById("message");
const resetPassword = document.getElementById("resetPassword");

// Already logged in?
onAuthStateChanged(auth, (user) => {
    if (user) {
        window.location.href = "dashboard.html";
    }
});

// Login
loginForm.addEventListener("submit", async (e) => {

    e.preventDefault();

    message.style.color = "#333";
    message.innerText = "Logging in...";

    try {

        const persistence = remember.checked
            ? browserLocalPersistence
            : browserSessionPersistence;

        await setPersistence(auth, persistence);

        await signInWithEmailAndPassword(
            auth,
            email.value.trim(),
            password.value
        );

        message.style.color = "green";
        message.innerText = "Login Successful";

        setTimeout(() => {
            window.location.href = "dashboard.html";
        }, 700);

    } catch (error) {

        message.style.color = "red";

        switch (error.code) {

            case "auth/invalid-credential":
                message.innerText = "Invalid Email or Password";
                break;

            case "auth/user-not-found":
                message.innerText = "User not found";
                break;

            case "auth/wrong-password":
                message.innerText = "Incorrect password";
                break;

            case "auth/too-many-requests":
                message.innerText = "Too many attempts. Try again later.";
                break;

            default:
                message.innerText = error.message;

        }

    }

});

// Forgot Password
resetPassword.addEventListener("click", async () => {

    if (!email.value.trim()) {
        alert("Please enter your email first.");
        return;
    }

    try {

        await sendPasswordResetEmail(auth, email.value.trim());

        alert("Password reset email sent successfully.");

    } catch (error) {

        alert(error.message);

    }

});
