// =====================================
// GARIMA'S HOUSE HOLD - CHECKOUT
// =====================================

import { db } from "./firebase.js";

import {
    collection,
    addDoc,
    serverTimestamp,
    getDoc,
    doc
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

// =====================================
// SHIPPING RULES
// Rajasthan      = ₹70 per started kg
// Outside RJ     = ₹100 per started kg
// =====================================

const RAJASTHAN_RATE = 70;
const OUTSIDE_RAJASTHAN_RATE = 100;

// Product weight is read from Firestore.
// Supported field names:
// weightKg, weight, productWeightKg, productWeight, weightGrams
//
// IMPORTANT:
// If a product has no weight field yet, the checkout uses 1 kg
// as a temporary fallback so an order cannot silently become FREE.
// Add the actual product weight in Firestore for accurate shipping.
const DEFAULT_PRODUCT_WEIGHT_KG = 1;

let cart = JSON.parse(localStorage.getItem("cart")) || [];

const cartContainer = document.getElementById("checkoutProducts");

let subtotal = 0;
let totalWeightKg = 0;
let deliveryCharge = 0;

function money(value) {
    return "₹" + Number(value || 0).toLocaleString("en-IN");
}

// =====================================
// GET PRODUCT WEIGHT
// =====================================

function getProductWeightKg(product) {

    const weightKgCandidates = [
        product.weightKg,
        product.weight,
        product.productWeightKg,
        product.productWeight
    ];

    for (const value of weightKgCandidates) {

        const num = Number(value);

        if (Number.isFinite(num) && num > 0) {
            return num;
        }
    }

    // Support grams if stored separately.
    const grams = Number(product.weightGrams);

    if (Number.isFinite(grams) && grams > 0) {
        return grams / 1000;
    }

    return DEFAULT_PRODUCT_WEIGHT_KG;
}

// =====================================
// RAJASTHAN CHECK
// =====================================

function isRajasthan(state) {

    const normalized = String(state || "")
        .trim()
        .toLowerCase()
        .replace(/\./g, "")
        .replace(/\s+/g, " ");

    return [
        "rajasthan",
        "rajsthan",
        "raj",
        "rj"
    ].includes(normalized);
}

// =====================================
// CALCULATE DELIVERY
// =====================================

function calculateDelivery() {

    const state = document
        .getElementById("customerState")
        .value;

    const rate = isRajasthan(state)
        ? RAJASTHAN_RATE
        : OUTSIDE_RAJASTHAN_RATE;

    // "Started kg":
    // 0.1 kg -> 1 kg
    // 1.0 kg -> 1 kg
    // 1.4 kg -> 2 kg
    // 2.1 kg -> 3 kg
    const chargeableKg = totalWeightKg > 0
        ? Math.ceil(totalWeightKg)
        : 0;

    deliveryCharge = chargeableKg * rate;

    const weightEl = document.getElementById("totalWeight");
    const deliveryEl = document.getElementById("deliveryCharge");

    if (weightEl) {
        weightEl.textContent =
            totalWeightKg > 0
                ? totalWeightKg.toFixed(2) + " kg"
                : "0 kg";
    }

    if (deliveryEl) {
        deliveryEl.textContent = money(deliveryCharge);
    }

    updateGrandTotal();
}

// =====================================
// GRAND TOTAL
// =====================================

function updateGrandTotal() {

    const grandTotal = subtotal + deliveryCharge;

    document.getElementById("grandTotal").textContent =
        money(grandTotal);
}

// =====================================
// LOAD CART
// =====================================

async function loadCheckout() {

    cartContainer.innerHTML = "";

    subtotal = 0;
    totalWeightKg = 0;
    deliveryCharge = 0;

    if (!cart.length) {

        cartContainer.innerHTML = `
            <div class="checkout-empty">
                <p>Your cart is empty.</p>
            </div>
        `;

        document.getElementById("subtotal").textContent = "₹0";
        document.getElementById("discount").textContent = "₹0";
        document.getElementById("totalWeight").textContent = "0 kg";
        document.getElementById("deliveryCharge").textContent = "₹0";
        document.getElementById("grandTotal").textContent = "₹0";

        return;
    }

    for (const item of cart) {

        const snap = await getDoc(
            doc(db, "products", item.id)
        );

        if (!snap.exists()) continue;

        const product = snap.data();

        const price = Number(product.price || 0);
        const qty = Number(item.qty || 1);

        const itemTotal = price * qty;

        const productWeightKg =
            getProductWeightKg(product);

        const itemWeightKg =
            productWeightKg * qty;

        subtotal += itemTotal;
        totalWeightKg += itemWeightKg;

        cartContainer.innerHTML += `

        <div class="checkout-item">

            <img
                src="${product.image || 'image/no-image.png'}"
                class="checkout-image"
                onerror="this.src='image/no-image.png'"
                alt="${product.name || 'Product'}">

            <div class="checkout-info">

                <h4>${product.name || "Product"}</h4>

                <p>
                    ${money(price)} × ${qty}
                </p>

                <small>
                    Weight: ${productWeightKg.toFixed(2)} kg × ${qty}
                </small>

            </div>

            <strong>${money(itemTotal)}</strong>

        </div>

        `;
    }

    document.getElementById("subtotal").textContent =
        money(subtotal);

    document.getElementById("discount").textContent =
        "₹0";

    calculateDelivery();
}

loadCheckout();

// =====================================
// RECALCULATE WHEN STATE CHANGES
// =====================================

document
    .getElementById("customerState")
    .addEventListener("input", calculateDelivery);

document
    .getElementById("customerPincode")
    .addEventListener("input", calculateDelivery);

// =====================================
// COPY UPI
// =====================================

document
    .getElementById("copyUPI")
    .addEventListener("click", () => {

        const upi =
            document.getElementById("upiId");

        navigator.clipboard
            .writeText(upi.value)
            .then(() => {
                alert("UPI ID Copied");
            })
            .catch(() => {
                alert("Unable to copy UPI ID.");
            });
    });

// =====================================
// PLACE ORDER
// =====================================

document
    .getElementById("placeOrderBtn")
    .addEventListener("click", async () => {

        const name =
            document.getElementById("customerName")
                .value.trim();

        const mobile =
            document.getElementById("customerMobile")
                .value.trim();

        const email =
            document.getElementById("customerEmail")
                .value.trim();

        const address =
            document.getElementById("customerAddress")
                .value.trim();

        const city =
            document.getElementById("customerCity")
                .value.trim();

        const state =
            document.getElementById("customerState")
                .value.trim();

        const pincode =
            document.getElementById("customerPincode")
                .value.trim();

        const confirmPayment =
            document.getElementById("paymentConfirm")
                .checked;

        const screenshot =
            document.getElementById("paymentScreenshot")
                .files[0];

        if (!cart.length) {
            alert("Your cart is empty.");
            return;
        }

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
            !pincode
        ) {
            alert("Please fill all required fields.");
            return;
        }

        if (!/^\d{10}$/.test(mobile)) {
            alert("Enter a valid 10 digit mobile number.");
            return;
        }

        if (!/^\d{6}$/.test(pincode)) {
            alert("Enter a valid 6 digit pincode.");
            return;
        }

        if (!confirmPayment) {
            alert(
                "Please confirm that payment has been completed."
            );
            return;
        }

        // Make sure the latest state is reflected in the total.
        calculateDelivery();

        const finalTotal =
            subtotal + deliveryCharge;

        const chargeableKg =
            totalWeightKg > 0
                ? Math.ceil(totalWeightKg)
                : 0;

        const shippingRate =
            isRajasthan(state)
                ? RAJASTHAN_RATE
                : OUTSIDE_RAJASTHAN_RATE;

        const btn =
            document.getElementById("placeOrderBtn");

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

                subtotal,

                totalWeightKg,

                chargeableWeightKg: chargeableKg,

                shippingRate,

                deliveryCharge,

                discount: 0,

                total: finalTotal,

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
                "Order Placed Successfully!\n\n" +
                "Order ID : " +
                docRef.id +
                "\n\nYour payment will be verified soon."
            );

            const productsList = cart
                .map(item =>
                    `• ${item.qty} x ${item.id}`
                )
                .join("\n");

            const message =
`🛒 *New Order - Garima's House Hold*

🆔 Order ID: ${docRef.id}

👤 Name: ${name}

📞 Mobile: ${mobile}

📍 Address:
${address}
${city}, ${state} - ${pincode}

🛍️ Products:
${productsList}

⚖️ Total Weight: ${totalWeightKg.toFixed(2)} kg
📦 Chargeable Weight: ${chargeableKg} kg
🚚 Delivery: ₹${deliveryCharge}

💰 Subtotal: ₹${subtotal}
💰 *Total: ₹${finalTotal}*

💳 Payment: UPI
UPI ID: 9468659714@ybl

✅ Payment Completed`;

            window.open(
                `https://wa.me/919374445544?text=${encodeURIComponent(message)}`,
                "_blank"
            );

            window.location.href =
                "order-success.html?id=" +
                docRef.id;

        } catch (error) {

            console.error(error);

            alert(
                "Something went wrong. Please try again."
            );

        } finally {

            btn.disabled = false;

            btn.innerHTML =
                '<i class="fa-solid fa-circle-check"></i> Place Order';
        }
    });
