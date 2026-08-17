// ==========================================
// GARIMA'S HOUSE HOLD
// ADMIN AUTHENTICATION
// PART 3
// ==========================================

// Firebase Auth
import {
    signInWithEmailAndPassword,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";

import { auth } from "./firebase.js";


// ==========================================
// DOM ELEMENTS
// ==========================================

const loginForm = document.getElementById("login-form");

const emailInput = document.getElementById("admin-email");

const passwordInput = document.getElementById("admin-password");

const loginButton = document.getElementById("login-btn");

const loginButtonText = document.getElementById("login-btn-text");

const loginSpinner = document.getElementById("login-spinner");

const loginError = document.getElementById("login-error");

const togglePassword = document.getElementById("toggle-password");


// ==========================================
// LOGIN ERROR MESSAGE
// ==========================================

function showError(message) {

    if (!loginError) return;

    loginError.innerText = message;

}


// ==========================================
// CLEAR ERROR
// ==========================================

function clearError() {

    if (!loginError) return;

    loginError.innerText = "";

}


// ==========================================
// LOADING STATE
// ==========================================

function setLoading(isLoading) {

    if (!loginButton) return;

    loginButton.disabled = isLoading;


    if (loginButtonText) {

        loginButtonText.style.display =
            isLoading ? "none" : "inline";

    }


    if (loginSpinner) {

        loginSpinner.style.display =
            isLoading ? "inline-block" : "none";

    }

}


// ==========================================
// PASSWORD SHOW / HIDE
// ==========================================

if (togglePassword) {

    togglePassword.addEventListener("click", () => {

        const isPassword =
            passwordInput.type === "password";


        passwordInput.type =
            isPassword ? "text" : "password";


        togglePassword.innerHTML =
            isPassword
                ? '<i class="fa-solid fa-eye-slash"></i>'
                : '<i class="fa-solid fa-eye"></i>';

    });

}


// ==========================================
// LOGIN FORM
// ==========================================

if (loginForm) {

    loginForm.addEventListener("submit", async (event) => {

        event.preventDefault();

        clearError();


        const email =
            emailInput.value.trim();

        const password =
            passwordInput.value;


        // ------------------------------------------
        // VALIDATION
        // ------------------------------------------

        if (!email) {

            showError("Please enter your email address.");

            emailInput.focus();

            return;

        }


        if (!password) {

            showError("Please enter your password.");

            passwordInput.focus();

            return;

        }


        setLoading(true);


        try {

            // --------------------------------------
            // FIREBASE LOGIN
            // --------------------------------------

            const userCredential =
                await signInWithEmailAndPassword(
                    auth,
                    email,
                    password
                );


            const user =
                userCredential.user;


            console.log(
                "Admin Login Successful:",
                user.email
            );


            // --------------------------------------
            // ADMIN LOGIN SUCCESS
            // --------------------------------------

            window.location.href = "admin.html";


        }

        catch (error) {

            console.error(
                "Admin Login Error:",
                error
            );


            let message =
                "Unable to login. Please check your details.";


            // --------------------------------------
            // FIREBASE ERROR MESSAGES
            // --------------------------------------

            switch (error.code) {

                case "auth/invalid-email":

                    message =
                        "Please enter a valid email address.";

                    break;


                case "auth/invalid-credential":

                    message =
                        "Incorrect email or password.";

                    break;


                case "auth/user-not-found":

                    message =
                        "Admin account not found.";

                    break;


                case "auth/wrong-password":

                    message =
                        "Incorrect password.";

                    break;


                case "auth/user-disabled":

                    message =
                        "This admin account has been disabled.";

                    break;


                case "auth/too-many-requests":

                    message =
                        "Too many attempts. Please try again later.";

                    break;


                case "auth/network-request-failed":

                    message =
                        "Network error. Please check your internet connection.";

                    break;


                default:

                    message =
                        error.message ||
                        "Login failed. Please try again.";

            }


            showError(message);

            setLoading(false);

        }

    });

}


// ==========================================
// CHECK EXISTING LOGIN
// ==========================================

onAuthStateChanged(auth, (user) => {

    if (user) {

        console.log(
            "Firebase Admin Authentication Ready"
        );

    }

});


// ==========================================
// CONSOLE
// ==========================================

console.log("==================================");

console.log("Garima's House Hold");

console.log("Admin Authentication Loaded");

console.log("==================================");
