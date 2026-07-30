// ==========================================
// Garima's House Hold
// checkout.js
// ==========================================

import { db } from "./firebase.js";

import {
    addDoc,
    collection
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";
import {
    loadCoupons,
    applyCoupon,
    removeCoupon,
    saveAppliedCoupon,
    loadAppliedCoupon
} from "./coupon.js";
// =======================
// Load Cart
// =======================

let cart = JSON.parse(localStorage.getItem("cart")) || [];

const checkoutItems = document.getElementById("checkout-items");
const itemsCount = document.getElementById("checkout-items-count");
const subtotal = document.getElementById("checkout-subtotal");
const totalElement = document.getElementById("checkout-total");

let grandTotal = 0;
let totalQty = 0;

// Coupon Variables
let discount = 0;
let finalTotal = 0;

function updateSummary() {
    finalTotal = grandTotal - discount;

    const d=document.getElementById("discount-amount");
    if(d) d.innerText="₹"+discount.toLocaleString("en-IN");

    if(totalElement){
        totalElement.innerText="₹"+finalTotal.toLocaleString("en-IN");
    }
}

// =======================
// Load Checkout Items
// =======================

function loadCheckout() {

    checkoutItems.innerHTML = "";

    grandTotal = 0;
    totalQty = 0;

    if (cart.length === 0) {

        checkoutItems.innerHTML = `
            <p>Your cart is empty.</p>
        `;

        itemsCount.innerText = "0";
        subtotal.innerText = "₹0";
        totalElement.innerText = "₹0";

        return;
    }

    cart.forEach(item => {

        const qty = item.qty || 1;
        const itemTotal = item.price * qty;

        grandTotal += itemTotal;
        totalQty += qty;

        checkoutItems.innerHTML += `

        <div class="checkout-item">

            <div>

                <strong>${item.name}</strong><br>

                Qty : ${qty}

            </div>

            <strong>

                ₹${itemTotal.toLocaleString("en-IN")}

            </strong>

        </div>

        <hr>

        `;

    });

    itemsCount.innerText = totalQty;
    subtotal.innerText = "₹" + grandTotal.toLocaleString("en-IN");
    updateSummary();

}

loadCheckout();
// =======================
// Place Order
// =======================

const checkoutForm = document.getElementById("checkout-form");

checkoutForm.addEventListener("submit", async (e) => {

    e.preventDefault();

    if (cart.length === 0) {
        alert("Your cart is empty.");
        return;
    }

    const name = document.getElementById("name").value.trim();
    const mobile = document.getElementById("mobile").value.trim();
    const email = document.getElementById("email").value.trim();
    const address = document.getElementById("address").value.trim();
    const city = document.getElementById("city").value.trim();
    const state = document.getElementById("state").value.trim();
    const pincode = document.getElementById("pincode").value.trim();

    if (!name || !mobile || !address || !city || !state || !pincode) {
        alert("Please fill all required fields.");
        return;
    }

    try {

        const orderRef = await addDoc(collection(db, "orders"), {

            customerName: name,
            mobile: mobile,
            email: email,
            address: address,
            city: city,
            state: state,
            pincode: pincode,

            products: cart,

            total: finalTotal,

            paymentMethod: document.querySelector(
                'input[name="payment"]:checked'
            ).value,

            status: "Pending",

            createdAt: new Date()

        });

        startPayment();

        console.log("Order ID :", orderRef.id);

        // Razorpay Integration Next Part

    }

    catch (error) {

        console.error(error);

        alert("Failed to create order.");

    }

});
// =======================
// WhatsApp Order
// =======================

const whatsappBtn = document.getElementById("whatsapp-order-btn");

if (whatsappBtn) {

    whatsappBtn.addEventListener("click", () => {

        const name = document.getElementById("name").value.trim();
        const mobile = document.getElementById("mobile").value.trim();
        const address = document.getElementById("address").value.trim();
        const city = document.getElementById("city").value.trim();
        const state = document.getElementById("state").value.trim();
        const pincode = document.getElementById("pincode").value.trim();

        let message = `🛍️ *Garima's House Hold*%0A%0A`;

        message += `👤 Name : ${name}%0A`;
        message += `📞 Mobile : ${mobile}%0A`;
        message += `🏠 Address : ${address}, ${city}, ${state} - ${pincode}%0A%0A`;

        message += `🛒 *Products*%0A`;

        cart.forEach(item => {

            message += `• ${item.name} × ${item.qty} = ₹${item.price * item.qty}%0A`;

        });

        message += `%0A💰 *Grand Total : ₹${finalTotal}*`;

        window.open(
            `https://wa.me/919374445544?text=${message}`,
            "_blank"
        );

    });

}

// =======================
// Order Success
// =======================

function orderSuccess() {

    localStorage.removeItem("cart");

    alert("Thank you! Your order has been placed successfully.");

    window.location.href = "index.html";

}
// =======================
// Razorpay Payment
// =======================

async function startPayment() {

    const options = {

        key: "YOUR_RAZORPAY_KEY_ID",

        amount: finalTotal * 100,

        currency: "INR",

        name: "Garima's House Hold",

        description: "Online Purchase",

        image: "logo.png",

        handler: async function (response) {

            alert("Payment Successful!");

            console.log(response);

            localStorage.removeItem("cart");

            window.location.href = "success.html";

        },

        theme: {
            color: "#ff6b35"
        }

    };

    const rzp = new Razorpay(options);

    rzp.open();

}


// =======================
// Coupon Events
// =======================
loadCoupons();

const applyBtn=document.getElementById("apply-coupon");
if(applyBtn){
applyBtn.addEventListener("click",()=>{
 const code=document.getElementById("coupon-code").value.trim();
 const result=applyCoupon(code,grandTotal);
 const msg=document.getElementById("coupon-message");
 if(!result.success){
   if(msg) msg.innerText=result.message;
   return;
 }
 discount=result.discount;
 saveAppliedCoupon();
 updateSummary();
 if(msg) msg.innerText="✅ Coupon Applied";
 const rb=document.getElementById("remove-coupon");
 if(rb) rb.style.display="inline-block";
});
}

const removeBtn=document.getElementById("remove-coupon");
if(removeBtn){
removeBtn.addEventListener("click",()=>{
 removeCoupon();
 discount=0;
 updateSummary();
 localStorage.removeItem("appliedCoupon");
 const msg=document.getElementById("coupon-message");
 if(msg) msg.innerText="";
 removeBtn.style.display="none";
});
}

const saved=loadAppliedCoupon();
if(saved){
 const r=applyCoupon(saved.code,grandTotal);
 if(r.success){
   discount=r.discount;
   updateSummary();
   const inp=document.getElementById("coupon-code");
   if(inp) inp.value=saved.code;
   const rb=document.getElementById("remove-coupon");
   if(rb) rb.style.display="inline-block";
 }
}
