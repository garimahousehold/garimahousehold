/* =========================================================
   GARIMA'S HOUSE HOLD
   ADMIN LOGIN
   FIREBASE 12.16.0
========================================================= */


/* =========================================================
   FIREBASE AUTH IMPORTS
========================================================= */

import {
    signInWithEmailAndPassword,
    sendPasswordResetEmail,
    setPersistence,
    browserLocalPersistence,
    browserSessionPersistence
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";


import {
    auth
} from "./firebase.js";


/* =========================================================
   LOGIN JS READY
========================================================= */

console.log(
    "========================================"
);

console.log(
    "Garima's House Hold Login JS Loaded"
);

console.log(
    "Firebase Authentication Ready"
);

console.log(
    "========================================"
);


/* =========================================================
   DOM ELEMENTS
========================================================= */

const loginForm =
    document.getElementById(
        "loginForm"
    );


const emailInput =
    document.getElementById(
        "email"
    );


const passwordInput =
    document.getElementById(
        "password"
    );


const rememberInput =
    document.getElementById(
        "remember"
    );


const message =
    document.getElementById(
        "message"
    );


const resetPasswordButton =
    document.getElementById(
        "resetPassword"
    );


/* =========================================================
   ELEMENT CHECK
========================================================= */

if (!loginForm) {

    console.error(
        "Login form not found: #loginForm"
    );

}


if (!emailInput) {

    console.error(
        "Email input not found: #email"
    );

}


if (!passwordInput) {

    console.error(
        "Password input not found: #password"
    );

}


/* =========================================================
   LOGIN
========================================================= */

if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            /* ---------------------------------------------
               CLEAR MESSAGE
            --------------------------------------------- */

            if (message) {

                message.style.color =
                    "#333";

                message.innerText =
                    "Logging in...";

            }


            /* ---------------------------------------------
               GET VALUES
            --------------------------------------------- */

            const email =
                emailInput
                    ? emailInput.value.trim()
                    : "";


            const password =
                passwordInput
                    ? passwordInput.value
                    : "";


            /* ---------------------------------------------
               VALIDATION
            --------------------------------------------- */

            if (!email) {

                if (message) {

                    message.style.color =
                        "red";

                    message.innerText =
                        "Please enter your email.";

                }

                return;

            }


            if (!password) {

                if (message) {

                    message.style.color =
                        "red";

                    message.innerText =
                        "Please enter your password.";

                }

                return;

            }


            try {

                /* -----------------------------------------
                   PERSISTENCE
                ----------------------------------------- */

                const persistence =
                    rememberInput &&
                    rememberInput.checked

                        ? browserLocalPersistence

                        : browserSessionPersistence;


                await setPersistence(
                    auth,
                    persistence
                );


                /* -----------------------------------------
                   FIREBASE LOGIN
                ----------------------------------------- */

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


                /* -----------------------------------------
                   ADMIN EMAIL CHECK
                ----------------------------------------- */

                if (
                    user.email &&
                    user.email.toLowerCase() !==
                    "garimakothari1995@gmail.com"
                ) {

                    console.error(
                        "Unauthorized admin account:",
                        user.email
                    );


                    if (message) {

                        message.style.color =
                            "red";

                        message.innerText =
                            "This account is not authorized for Admin Panel.";

                    }


                    return;

                }


                /* -----------------------------------------
                   SUCCESS MESSAGE
                ----------------------------------------- */

                if (message) {

                    message.style.color =
                        "green";

                    message.innerText =
                        "Login Successful";

                }


                /* -----------------------------------------
                   GO TO ADMIN PAGE
                ----------------------------------------- */

                setTimeout(
                    function () {

                        window.location.href =
                            "admin.html";

                    },
                    500
                );

            } catch (error) {

                console.error(
                    "Admin Login Error:",
                    error
                );


                if (message) {

                    message.style.color =
                        "red";

                }


                switch (
                    error.code
                ) {

                    case "auth/invalid-credential":

                        if (message) {

                            message.innerText =
                                "Invalid Email or Password";

                        }

                        break;


                    case "auth/user-not-found":

                        if (message) {

                            message.innerText =
                                "User not found";

                        }

                        break;


                    case "auth/wrong-password":

                        if (message) {

                            message.innerText =
                                "Incorrect password";

                        }

                        break;


                    case "auth/invalid-email":

                        if (message) {

                            message.innerText =
                                "Invalid email address";

                        }

                        break;


                    case "auth/too-many-requests":

                        if (message) {

                            message.innerText =
                                "Too many attempts. Try again later.";

                        }

                        break;


                    case "auth/network-request-failed":

                        if (message) {

                            message.innerText =
                                "Network error. Check your internet connection.";

                        }

                        break;


                    default:

                        if (message) {

                            message.innerText =
                                error.message ||
                                "Login failed.";

                        }

                        break;

                }

            }

        }
    );

}


/* =========================================================
   FORGOT PASSWORD
========================================================= */

if (resetPasswordButton) {

    resetPasswordButton.addEventListener(
        "click",
        async function () {

            const email =
                emailInput
                    ? emailInput.value.trim()
                    : "";


            if (!email) {

                alert(
                    "Please enter your email first."
                );

                return;

            }


            try {

                await sendPasswordResetEmail(
                    auth,
                    email
                );


                alert(
                    "Password reset email sent successfully."
                );


                console.log(
                    "Password reset email sent to:",
                    email
                );

            } catch (error) {

                console.error(
                    "Password Reset Error:",
                    error
                );


                alert(
                    error.message ||
                    "Unable to send password reset email."
                );

            }

        }
    );

}


/* =========================================================
   IMPORTANT
   DO NOT REDIRECT ON AUTH STATE HERE
========================================================= */

/*
   We intentionally do NOT use:

   onAuthStateChanged(auth, ...)

   to redirect to dashboard.html.

   admin.html is the Admin Panel.
*/


console.log(
    "Admin Login System Ready"
);
