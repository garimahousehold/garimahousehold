import { auth } from "./firebase.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";

onAuthStateChanged(auth, (user) => {

    if (!user) {

        window.location.href = "login.html";

    }

});
