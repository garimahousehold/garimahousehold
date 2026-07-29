import { db } from "./firebase.js";

import {
    addDoc,
    collection
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

// ============================
// Load Cart
// ============================

const cart = JSON.parse(localStorage.getItem("cart")) || [];

let total = 0;

const checkoutItems = document.getElementById("checkout-items");
const totalInput = document.getElementById("total");

// ============================
// Show Cart Products
// ============================

if (checkoutItems) {

    checkoutItems.innerHTML = "";

    if (cart.length === 0) {

        checkoutItems.innerHTML = `
            <h3>Your cart is empty.</h3>
        `;

    } else {

        cart.forEach((item) => {

            const qty = item.qty || 1;

            total += Number(item.price) * qty;

            checkoutItems.innerHTML += `

                <div class="box">

                    <img src="${item.image}" width="100">

                    <div>

                        <h3>${item.name}</h3>

                        <p>Price : ₹${item.price}</p>

                        <p>Quantity : ${qty}</p>

                        <p><b>Total : ₹${item.price * qty}</b></p>

                    </div>

                </div>

            `;

        });

    }

}

// ============================
// Total Amount
// ============================

if (totalInput) {

    totalInput.value = "₹" + total;

}

// ============================
// Place Order
// ============================

const form = document.getElementById("checkout-form");

form.addEventListener("submit", async (e) => {

    e.preventDefault();

    if (cart.length === 0) {

        alert("Your cart is empty.");

        return;

    }

    const name = document.getElementById("name").value.trim();
    const mobile = document.getElementById("mobile").value.trim();
    const address = document.getElementById("address").value.trim();
    const city = document.getElementById("city").value.trim();
    const pincode = document.getElementById("pincode").value.trim();

    try {

        await addDoc(collection(db, "orders"), {

            customerName: name,
            mobile: mobile,
            address: address,
            city: city,
            pincode: pincode,

            products: cart,

            total: total,

            status: "Pending",

            orderDate: new Date().toLocaleString()

        });

        alert("Order Placed Successfully!");

let message = `🛍️ *Garima's House Hold*%0A%0A`;

message += `👤 Name : ${name}%0A`;
message += `📞 Mobile : ${mobile}%0A`;
message += `🏠 Address : ${address}, ${city} - ${pincode}%0A%0A`;

message += `🛒 *Products*%0A`;

cart.forEach(item => {

    message += `• ${item.name} x ${item.qty} = ₹${item.price * item.qty}%0A`;

});

message += `%0A💰 *Grand Total : ₹${total}*`;

localStorage.removeItem("cart");

window.open(
    `https://wa.me/919374445544?text=${message}`,
    "_blank"
);

window.location.href = "index.html";

    }

    catch (error) {

        console.log(error);

        alert("Order Failed!");

    }

});