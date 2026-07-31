// =====================================
// FIREBASE IMPORT
// =====================================

import { db } from "./firebase.js";

import {
    collection,
    addDoc,
    serverTimestamp,
    getDoc,
    doc
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

// =====================================
// LOAD CART
// =====================================

let cart = JSON.parse(localStorage.getItem("cart")) || [];

const cartContainer = document.getElementById("checkoutProducts");

let subtotal = 0;

async function loadCheckout() {

    cartContainer.innerHTML = "";

    subtotal = 0;

    for (const item of cart) {

        const snap = await getDoc(doc(db, "products", item.id));

        if (!snap.exists()) continue;

        const product = snap.data();

        const total = product.price * item.qty;

        subtotal += total;

        cartContainer.innerHTML += `

        <div class="checkout-item">

            <img src="${product.image}" class="checkout-image">

            <div class="checkout-info">

                <h4>${product.name}</h4>

                <p>₹${product.price} × ${item.qty}</p>

            </div>

            <strong>₹${total}</strong>

        </div>

        `;

    }

    document.getElementById("subtotal").textContent =
        "₹" + subtotal;

    document.getElementById("discount").textContent =
        "₹0";

    document.getElementById("grandTotal").textContent =
        "₹" + subtotal;

}

loadCheckout();

// =====================================
// COPY UPI
// =====================================

document.getElementById("copyUPI").addEventListener("click", () => {

    const upi = document.getElementById("upiId");

    navigator.clipboard.writeText(upi.value);

    alert("UPI ID Copied");

});
// =====================================
// PLACE ORDER
// =====================================

document.getElementById("placeOrderBtn").addEventListener("click", async () => {

    const name = document.getElementById("customerName").value.trim();
    const mobile = document.getElementById("customerMobile").value.trim();
    const email = document.getElementById("customerEmail").value.trim();
    const address = document.getElementById("customerAddress").value.trim();
    const city = document.getElementById("customerCity").value.trim();
    const state = document.getElementById("customerState").value.trim();
    const pincode = document.getElementById("customerPincode").value.trim();
    
    const confirmPayment = document.getElementById("paymentConfirm").checked;
const screenshot =
document.getElementById("paymentScreenshot").files[0];

if (!screenshot) {

    alert("Please upload your payment screenshot.");

    return;

}
    if (
        !name ||
        !mobile ||
        !address ||
        !city ||
        !state ||
        !pincode ||
     ) 
     {
        alert("Please fill all required fields.");
        return;
    }

    if (mobile.length !== 10) {
        alert("Enter a valid 10 digit mobile number.");
        return;
    }

    if (!confirmPayment) {
        alert("Please confirm that payment has been completed.");
        return;
    }

    const btn = document.getElementById("placeOrderBtn");

    btn.disabled = true;
    btn.innerHTML = "Placing Order...";

    try {

        const order = {
            customer: {
                name,
                mobile,
                email,
                address,
                city,
                state,
                pincode
            },

            products: cart,

            subtotal: subtotal,

            total: subtotal,

            payment: {
                method: "UPI",
                upiId: "9468659714@ybl",
            status: "Pending Verification"
            },

            orderStatus: "Pending",

            createdAt: serverTimestamp()

        };

        const docRef = await addDoc(
            collection(db, "orders"),
            order
        );

        localStorage.removeItem("cart");

        alert(
            "Order Placed Successfully!\n\nOrder ID : " +
            docRef.id +
            "\n\nYour payment will be verified soon."
        );

        window.location.href =
            "order-success.html?id=" + docRef.id;

    } catch (error) {

        console.error(error);

        alert("Something went wrong. Please try again.");

    }

    btn.disabled = false;

    btn.innerHTML =
        '<i class="fa-solid fa-circle-check"></i> Place Order';

});
