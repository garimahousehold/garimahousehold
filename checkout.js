// =====================================
// GARIMA'S HOUSE HOLD - CHECKOUT
// PART 1
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
// =====================================

const RAJASTHAN_RATE = 70;
const OUTSIDE_RAJASTHAN_RATE = 100;

const DEFAULT_PRODUCT_WEIGHT_KG = 1;


// =====================================
// BUY NOW / CART
// =====================================

const savedBuyNow =
    localStorage.getItem("buyNowProduct");

const buyNowData =
    savedBuyNow
        ? JSON.parse(savedBuyNow)
        : null;

const isBuyNow =
    !!buyNowData;


let cart = isBuyNow

    ? [{
        id:
            buyNowData.id,

        qty:
            Number(
                buyNowData.quantity ||
                buyNowData.qty ||
                1
            ),

        quantity:
            Number(
                buyNowData.quantity ||
                buyNowData.qty ||
                1
            ),

        name:
            buyNowData.name || "",

        image:
            buyNowData.image || "",

        price:
            buyNowData.price || 0,

        mrp:
            buyNowData.originalPrice ||
            buyNowData.mrp ||
            0,

        category:
            buyNowData.category || ""
    }]

    : (
        JSON.parse(
            localStorage.getItem("cart")
        ) || []
    );


const cartContainer =
    document.getElementById(
        "checkoutProducts"
    );


let subtotal = 0;

let totalWeightKg = 0;

let deliveryCharge = 0;


// =====================================
// MONEY
// =====================================

function money(value) {

    return (
        "₹" +
        Number(
            value || 0
        ).toLocaleString(
            "en-IN"
        )
    );

}
// =====================================
// GET PRODUCT WEIGHT
// PART 2
// =====================================

function getProductWeightKg(product) {

    const weightKgCandidates = [

        product.weightKg,

        product.weight,

        product.productWeightKg,

        product.productWeight

    ];


    for (
        const value
        of weightKgCandidates
    ) {

        const num =
            Number(value);


        if (
            Number.isFinite(num) &&
            num > 0
        ) {

            return num;

        }

    }


    // Weight in grams

    const grams =
        Number(
            product.weightGrams
        );


    if (
        Number.isFinite(grams) &&
        grams > 0
    ) {

        return grams / 1000;

    }


    // Default weight

    return DEFAULT_PRODUCT_WEIGHT_KG;

}


// =====================================
// RAJASTHAN CHECK
// =====================================

function isRajasthan(state) {

    const normalized =
        String(
            state || ""
        )
        .trim()
        .toLowerCase()
        .replace(
            /\./g,
            ""
        )
        .replace(
            /\s+/g,
            " "
        );


    return [

        "rajasthan",

        "rajsthan",

        "raj",

        "rj"

    ].includes(
        normalized
    );

}


// =====================================
// PINCODE CHECK
// =====================================

function isRajasthanPincode(
    pincode
) {

    const pin =
        String(
            pincode || ""
        )
        .replace(
            /\D/g,
            ""
        );


    if (
        !/^\d{6}$/.test(pin)
    ) {

        return false;

    }


    const firstTwo =
        Number(
            pin.slice(
                0,
                2
            )
        );


    return (
        firstTwo >= 30 &&
        firstTwo <= 34
    );

}


// =====================================
// AUTO DETECT STATE
// =====================================

function detectStateFromPincode() {

    const pincodeEl =
        document.getElementById(
            "customerPincode"
        );


    const stateEl =
        document.getElementById(
            "customerState"
        );


    if (
        !pincodeEl ||
        !stateEl
    ) {

        return;

    }


    const pin =
        pincodeEl.value
            .replace(
                /\D/g,
                ""
            )
            .slice(
                0,
                6
            );


    pincodeEl.value =
        pin;


    if (
        pin.length === 6
    ) {

        stateEl.value =
            isRajasthanPincode(
                pin
            )
                ? "Rajasthan"
                : "Outside Rajasthan";

    }

}
// =====================================
// CALCULATE DELIVERY
// PART 3
// =====================================

function calculateDelivery() {

    const stateEl =
        document.getElementById(
            "customerState"
        );

    const pincodeEl =
        document.getElementById(
            "customerPincode"
        );


    const state =
        stateEl
            ? stateEl.value
            : "";


    const pincode =
        pincodeEl
            ? pincodeEl.value
            : "";


    const rajasthan =
        isRajasthanPincode(
            pincode
        ) ||
        (
            !/^\d{6}$/.test(
                pincode
            ) &&
            isRajasthan(
                state
            )
        );


    const rate =
        rajasthan
            ? RAJASTHAN_RATE
            : OUTSIDE_RAJASTHAN_RATE;


    // Started kg calculation
    const chargeableKg =
        totalWeightKg > 0
            ? Math.ceil(
                totalWeightKg
            )
            : 0;


    deliveryCharge =
        chargeableKg * rate;


    const weightEl =
        document.getElementById(
            "totalWeight"
        );


    const deliveryEl =
        document.getElementById(
            "deliveryCharge"
        );


    if (weightEl) {

        weightEl.textContent =
            totalWeightKg > 0
                ? totalWeightKg.toFixed(
                    2
                ) + " kg"
                : "0 kg";

    }


    if (deliveryEl) {

        deliveryEl.textContent =
            money(
                deliveryCharge
            );

    }


    updateGrandTotal();

}


// =====================================
// GRAND TOTAL
// =====================================

function updateGrandTotal() {

    const grandTotal =
        subtotal +
        deliveryCharge;


    const totalEl =
        document.getElementById(
            "grandTotal"
        );


    if (totalEl) {

        totalEl.textContent =
            money(
                grandTotal
            );

    }

}
// =====================================
// LOAD CHECKOUT PRODUCTS
// PART 4
// =====================================

async function loadCheckout() {

    cartContainer.innerHTML = "";

    subtotal = 0;
    totalWeightKg = 0;
    deliveryCharge = 0;


    // =================================
    // EMPTY CART
    // =================================

    if (!cart.length) {

        cartContainer.innerHTML = `
            <div class="checkout-empty">

                <p>
                    Your cart is empty.
                </p>

            </div>
        `;


        document.getElementById(
            "subtotal"
        ).textContent = "₹0";


        document.getElementById(
            "discount"
        ).textContent = "₹0";


        document.getElementById(
            "totalWeight"
        ).textContent = "0 kg";


        document.getElementById(
            "deliveryCharge"
        ).textContent = "₹0";


        document.getElementById(
            "grandTotal"
        ).textContent = "₹0";


        return;
    }


    // =================================
// LOAD PRODUCTS
// =================================

for (
    const item of cart
) {

    let product = null;


    // ---------------------------------
    // 1. Pehle Firebase se product lao
    // ---------------------------------

    try {

        const snap =
            await getDoc(
                doc(
                    db,
                    "products",
                    item.id
                )
            );


        if (
            snap.exists()
        ) {

            product =
                snap.data();

        }

    } catch (error) {

        console.error(
            "Product loading error:",
            error
        );

    }


    // ---------------------------------
    // 2. Firebase mein na mile to
    //    Buy Now ka saved product use karo
    // ---------------------------------

    if (!product) {

        product = {

            name:
                item.name || "Product",

            image:
                item.image || "image/no-image.png",

            price:
                Number(
                    item.price || 0
                ),

            weightKg:
                Number(
                    item.weightKg || 1
                )

        };

    }


    // ---------------------------------
    // 3. Price
    // ---------------------------------

    const price =
        Number(
            product.price ||
            item.price ||
            0
        );


    // ---------------------------------
    // 4. Quantity
    // ---------------------------------

    const qty =
        Number(
            item.qty ||
            item.quantity ||
            1
        );


    // ---------------------------------
    // 5. Total
    // ---------------------------------

    const itemTotal =
        price * qty;


    // ---------------------------------
    // 6. Weight
    // ---------------------------------

    const productWeightKg =
        getProductWeightKg(
            product
        );


    const itemWeightKg =
        productWeightKg * qty;


    subtotal +=
        itemTotal;


    totalWeightKg +=
        itemWeightKg;

        item.sku = product.sku || item.sku || "";


    // ---------------------------------
    // 7. Show Product
    // ---------------------------------

    cartContainer.innerHTML += `

        <div class="checkout-item">

            <img
                src="${
                    product.image ||
                    item.image ||
                    "image/no-image.png"
                }"
                class="checkout-image"
                onerror="
                    this.src='image/no-image.png'
                "
                alt="${
                    product.name ||
                    item.name ||
                    "Product"
                }"
            >


            <div class="checkout-info">

                <h4>
                    ${
                        product.name ||
                        item.name ||
                        "Product"
                    }
                </h4>


                <p>
                    ${money(price)}
                    ×
                    ${qty}
                </p>


                <small>
                    Weight:
                    ${productWeightKg.toFixed(2)}
                    kg ×
                    ${qty}
                </small>

            </div>


            <strong>
                ${money(itemTotal)}
            </strong>

        </div>

    `;

}

    // =================================
    // SUMMARY
    // =================================

    document.getElementById(
        "subtotal"
    ).textContent =
        money(subtotal);


    document.getElementById(
        "discount"
    ).textContent =
        "₹0";


    calculateDelivery();

}


// =====================================
// INITIAL LOAD
// =====================================

detectStateFromPincode();

loadCheckout();
// =====================================
// PART 5
// STATE + PINCODE + UPI + PLACE ORDER
// =====================================


// =====================================
// RECALCULATE WHEN STATE CHANGES
// =====================================

const stateInput =
    document.getElementById(
        "customerState"
    );

if (stateInput) {

    stateInput.addEventListener(
        "input",
        calculateDelivery
    );

}


// =====================================
// RECALCULATE WHEN PINCODE CHANGES
// =====================================

const pincodeInput =
    document.getElementById(
        "customerPincode"
    );

if (pincodeInput) {

    pincodeInput.addEventListener(
        "input",
        () => {

            detectStateFromPincode();

            calculateDelivery();

        }
    );

}


// =====================================
// COPY UPI
// =====================================

const copyUPI =
    document.getElementById(
        "copyUPI"
    );


if (copyUPI) {

    copyUPI.addEventListener(
        "click",
        () => {

            const upi =
                document.getElementById(
                    "upiId"
                );


            if (!upi) {
                return;
            }


            navigator.clipboard
                .writeText(
                    upi.value
                )
                .then(
                    () => {

                        alert(
                            "UPI ID Copied"
                        );

                    }
                )
                .catch(
                    () => {

                        alert(
                            "Unable to copy UPI ID."
                        );

                    }
                );

        }
    );

}


// =====================================
// PLACE ORDER
// =====================================

const placeOrderBtn =
    document.getElementById(
        "placeOrderBtn"
    );


if (placeOrderBtn) {

    placeOrderBtn.addEventListener(
        "click",
        async () => {

            const name =
                document.getElementById(
                    "customerName"
                ).value.trim();


            const mobile =
                document.getElementById(
                    "customerMobile"
                ).value.trim();


            const email =
                document.getElementById(
                    "customerEmail"
                ).value.trim();


            const address =
                document.getElementById(
                    "customerAddress"
                ).value.trim();


            const city =
                document.getElementById(
                    "customerCity"
                ).value.trim();


            const state =
                document.getElementById(
                    "customerState"
                ).value.trim();


            const pincode =
                document.getElementById(
                    "customerPincode"
                ).value.trim();


            const confirmPayment =
                document.getElementById(
                    "paymentConfirm"
                ).checked;


            const screenshot =
                document.getElementById(
                    "paymentScreenshot"
                ).files[0];


            // -----------------------------
            // VALIDATION
            // -----------------------------

            if (!cart.length) {

                alert(
                    "Your cart is empty."
                );

                return;

            }


            if (!screenshot) {

                alert(
                    "Please upload your payment screenshot."
                );

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

                alert(
                    "Please fill all required fields."
                );

                return;

            }


            if (
                !/^\d{10}$/.test(
                    mobile
                )
            ) {

                alert(
                    "Enter a valid 10 digit mobile number."
                );

                return;

            }


            if (
                !/^\d{6}$/.test(
                    pincode
                )
            ) {

                alert(
                    "Enter a valid 6 digit pincode."
                );

                return;

            }


            if (!confirmPayment) {

                alert(
                    "Please confirm that payment has been completed."
                );

                return;

            }


            // -----------------------------
            // FINAL TOTAL
            // -----------------------------

            calculateDelivery();


            const finalTotal =
                subtotal +
                deliveryCharge;


            const chargeableKg =
                totalWeightKg > 0
                    ? Math.ceil(
                        totalWeightKg
                    )
                    : 0;


            const shippingRate =
                isRajasthanPincode(
                    pincode
                )
                    ? RAJASTHAN_RATE
                    : OUTSIDE_RAJASTHAN_RATE;


            placeOrderBtn.disabled =
                true;


            placeOrderBtn.innerHTML =
                "Placing Order...";


            try {

                // -------------------------
                // ORDER DATA
                // -------------------------

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

    // PRODUCTS
    products: cart.map(item => ({

        id:
            item.id || "",

        name:
            item.name || "Product",

        sku:
            item.sku || "",

        image:
            item.image || "",

        price:
            Number(item.price || 0),

        mrp:
            Number(
                item.mrp ||
                item.originalPrice ||
                0
            ),

        quantity:
            Number(
                item.quantity ||
                item.qty ||
                1
            ),

        qty:
            Number(
                item.qty ||
                item.quantity ||
                1
            ),

        category:
            item.category || "",

        weightKg:
            Number(
                item.weightKg ||
                item.weight ||
                1
            )

    })),

    subtotal,

    totalWeightKg,

    chargeableWeightKg:
        chargeableKg,

    shippingRate,

    deliveryCharge,

    discount: 0,

    total:
        finalTotal,

    payment: {

        method:
            "UPI",

        upiId:
            "9468659714@ybl",

        status:
            "Pending Verification"

    },

    orderStatus:
        "Pending",

    createdAt:
        serverTimestamp()

};

                // -------------------------
                // SAVE FIREBASE
                // -------------------------

                const docRef =
                    await addDoc(

                        collection(
                            db,
                            "orders"
                        ),

                        order

                    );


                // -------------------------
                // CLEAR CORRECT STORAGE
                // -------------------------

                if (isBuyNow) {

                    localStorage.removeItem(
                        "buyNowProduct"
                    );

                } else {

                    localStorage.removeItem(
                        "cart"
                    );

                }


                // -------------------------
                // WHATSAPP PRODUCTS
                // -------------------------

                const productsList =
                    cart
                        .map(
                            item => {

                                return (
                                    `• ${
                                        Number(
                                            item.qty ||
                                            item.quantity ||
                                            1
                                        )
                                    } x ${
                                        item.name ||
                                        item.id
                                    }`
                                );

                            }
                        )
                        .join("\n");


                // -------------------------
                // WHATSAPP MESSAGE
                // -------------------------

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

⚖️ Total Weight:
${totalWeightKg.toFixed(2)} kg

📦 Chargeable Weight:
${chargeableKg} kg

🚚 Delivery:
₹${deliveryCharge}

💰 Subtotal:
₹${subtotal}

💰 *Total:
₹${finalTotal}*

💳 Payment:
UPI

UPI ID:
9468659714@ybl

⏳ Payment Status:
Pending Verification`;


                // -------------------------
                // WHATSAPP
                // -------------------------

                window.open(

                    `https://wa.me/919374445544?text=${
                        encodeURIComponent(
                            message
                        )
                    }`,

                    "_blank"

                );


                // -------------------------
                // SUCCESS PAGE
                // -------------------------

                window.location.href =
                    "order-success.html?id=" +
                    docRef.id;


            } catch (error) {

                console.error(
                    "Order creation error:",
                    error
                );


                alert(
                    "Something went wrong. Please try again."
                );


                placeOrderBtn.disabled =
                    false;


                placeOrderBtn.innerHTML =
                    '<i class="fa-solid fa-circle-check"></i> Place Order';

            }

        }
    );

}
