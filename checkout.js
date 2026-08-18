// =========================================================
// GARIMA'S HOUSE HOLD
// CHECKOUT.JS
// FRESH VERSION - PART 1
// =========================================================

import {
    collection,
    addDoc,
    doc,
    getDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

import {
    ref,
    uploadBytes,
    getDownloadURL
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-storage.js";

import {
    db,
    storage
} from "./firebase.js";


// =========================================================
// SETTINGS
// =========================================================

const UPI_ID =
    "9468659714@ybl";

const WHATSAPP_NUMBER =
    "919374445544";

const RAJASTHAN_RATE =
    50;

const OUTSIDE_RAJASTHAN_RATE =
    100;


// =========================================================
// GLOBAL VARIABLES
// =========================================================

let cart = [];

let subtotal = 0;

let totalWeightKg = 0;

let deliveryCharge = 0;

let isBuyNow = false;


// =========================================================
// DOM HELPER
// =========================================================

function $(id) {

    return document.getElementById(id);

}


// =========================================================
// SAFE TEXT
// =========================================================

function safeText(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(value);

}


// =========================================================
// GET INPUT VALUE
// =========================================================

function getValue(id) {

    const element =
        $(id);


    if (!element) {

        return "";

    }


    return safeText(
        element.value
    ).trim();

}


// =========================================================
// NUMBER VALUE
// =========================================================

function numberValue(value) {

    const number =
        Number(value);


    return Number.isFinite(number)
        ? number
        : 0;

}


// =========================================================
// MONEY
// =========================================================

function money(value) {

    return (
        "₹" +
        numberValue(
            value
        ).toLocaleString(
            "en-IN",
            {
                maximumFractionDigits: 2
            }
        )
    );

}


// =========================================================
// GET PRODUCT WEIGHT
// =========================================================

function getProductWeightKg(
    product
) {

    if (!product) {

        return 0;

    }


    let weight =
        numberValue(
            product.weightKg
        );


    if (
        weight <= 0
    ) {

        weight =
            numberValue(
                product.weight
            );

    }


    if (
        weight <= 0
    ) {

        weight =
            numberValue(
                product.shippingWeightKg
            );

    }


    return weight;

}


// =========================================================
// GET CART
// =========================================================

function loadCartData() {

    let storedCart = [];


    try {

        const rawCart =
            localStorage.getItem(
                "cart"
            );


        if (rawCart) {

            const parsed =
                JSON.parse(
                    rawCart
                );


            if (
                Array.isArray(parsed)
            ) {

                storedCart =
                    parsed;

            }

        }

    } catch (error) {

        console.error(
            "Cart loading error:",
            error
        );

    }


    // =====================================================
    // BUY NOW
    // =====================================================

    let buyNowProduct = null;


    try {

        const rawBuyNow =
            localStorage.getItem(
                "buyNowProduct"
            );


        if (rawBuyNow) {

            const parsed =
                JSON.parse(
                    rawBuyNow
                );


            if (parsed) {

                buyNowProduct =
                    parsed;

            }

        }

    } catch (error) {

        console.error(
            "Buy Now loading error:",
            error
        );

    }


    if (
        buyNowProduct
    ) {

        isBuyNow =
            true;


        return [
            buyNowProduct
        ];

    }


    isBuyNow =
        false;


    return storedCart;

}


// =========================================================
// CHECKOUT PRODUCT CONTAINER
// =========================================================

const cartContainer =
    $("checkoutProducts");


// =========================================================
// INITIAL CART
// =========================================================

cart =
    loadCartData();


// =========================================================
// INITIAL LOG
// =========================================================

console.log(
    "Fresh Checkout JS loaded."
);

console.log(
    "Cart items:",
    cart.length
);

console.log(
    "Buy Now:",
    isBuyNow
);
// =========================================================
// GARIMA'S HOUSE HOLD
// CHECKOUT.JS
// FRESH VERSION - PART 2
// PRODUCT LOADING + CART DISPLAY
// =========================================================


// =========================================================
// LOAD CHECKOUT PRODUCTS
// =========================================================

async function loadCheckoutProducts() {

    if (!cartContainer) {

        console.error(
            "checkoutProducts element not found."
        );

        return;

    }


    cartContainer.innerHTML = "";


    subtotal = 0;

    totalWeightKg = 0;

    deliveryCharge = 0;


    // =====================================================
    // EMPTY CART
    // =====================================================

    if (
        cart.length === 0
    ) {

        cartContainer.innerHTML = `

            <div
                class="checkout-empty"
            >

                <h3>
                    Your cart is empty
                </h3>

                <p>
                    Please add a product before checkout.
                </p>

            </div>

        `;

        updateCheckoutSummary();

        return;

    }


    // =====================================================
    // LOAD EACH CART ITEM
    // =====================================================

    for (
        const cartItem of cart
    ) {

        let product = null;


        // =================================================
        // GET PRODUCT FROM FIRESTORE
        // =================================================

        if (
            cartItem.id
        ) {

            try {

                const productRef =
                    doc(
                        db,
                        "products",
                        cartItem.id
                    );


                const productSnapshot =
                    await getDoc(
                        productRef
                    );


                if (
                    productSnapshot.exists()
                ) {

                    product = {

                        id:
                            productSnapshot.id,

                        ...productSnapshot.data()

                    };

                }

            } catch (error) {

                console.error(
                    "Product loading error:",
                    error
                );

            }

        }


        // =================================================
        // FALLBACK TO CART DATA
        // =================================================

        if (!product) {

            product = {

                id:
                    cartItem.id ||
                    "",

                name:
                    cartItem.name ||
                    "Product",

                image:
                    cartItem.image ||
                    cartItem.imageUrl ||
                    "image/no-image.png",

                price:
                    numberValue(
                        cartItem.price
                    ),

                mrp:
                    numberValue(
                        cartItem.mrp ||
                        cartItem.originalPrice
                    ),

                sku:
                    cartItem.sku ||
                    "",

                category:
                    cartItem.category ||
                    "",

                weightKg:
                    numberValue(
                        cartItem.weightKg ||
                        cartItem.weight
                    )

            };

        }


        // =================================================
        // PRODUCT DETAILS
        // =================================================

        const productName =
            product.name ||
            cartItem.name ||
            "Product";


        const productImage =
            product.image ||
            product.imageUrl ||
            cartItem.image ||
            cartItem.imageUrl ||
            "image/no-image.png";


        const productSku =
            product.sku ||
            cartItem.sku ||
            "";


        const price =
            numberValue(
                product.price ||
                cartItem.price
            );


        const quantity =
            Math.max(
                1,
                numberValue(
                    cartItem.quantity ||
                    cartItem.qty ||
                    1
                )
            );


        const productWeightKg =
            getProductWeightKg(
                product
            );


        const itemWeightKg =
            productWeightKg *
            quantity;


        const itemTotal =
            price *
            quantity;


        // =================================================
        // UPDATE CART ITEM
        // =================================================

        cartItem.id =
            product.id ||
            cartItem.id ||
            "";


        cartItem.name =
            productName;


        cartItem.image =
            productImage;


        cartItem.price =
            price;


        cartItem.sku =
            productSku;


        cartItem.quantity =
            quantity;


        cartItem.qty =
            quantity;


        cartItem.weightKg =
            productWeightKg;


        // =================================================
        // TOTALS
        // =================================================

        subtotal +=
            itemTotal;


        totalWeightKg +=
            itemWeightKg;


        // =================================================
        // PRODUCT HTML
        // =================================================

        cartContainer.insertAdjacentHTML(
            "beforeend",
            `

            <div
                class="checkout-item"
                data-product-id="${safeText(
                    product.id
                )}"
            >

                <div
                    class="checkout-item-image"
                >

                    <img
                        src="${safeText(
                            productImage
                        )}"
                        alt="${safeText(
                            productName
                        )}"
                        onerror="
                            this.src='image/no-image.png'
                        "
                    >

                </div>


                <div
                    class="checkout-item-info"
                >

                    <h4>
                        ${safeText(
                            productName
                        )}
                    </h4>


                    ${
                        productSku
                            ? `

                                <div
                                    class="checkout-sku"
                                >

                                    SKU:
                                    ${safeText(
                                        productSku
                                    )}

                                </div>

                              `
                            : ""
                    }


                    <div
                        class="checkout-price"
                    >

                        ${money(
                            price
                        )}

                    </div>


                    <div
                        class="checkout-quantity"
                    >

                        Quantity:
                        ${quantity}

                    </div>


                    ${
                        productWeightKg > 0
                            ? `

                                <div
                                    class="checkout-weight"
                                >

                                    Weight:
                                    ${productWeightKg.toFixed(
                                        2
                                    )}
                                    kg ×
                                    ${quantity}

                                </div>

                              `
                            : ""
                    }

                </div>


                <div
                    class="checkout-item-total"
                >

                    ${money(
                        itemTotal
                    )}

                </div>

            </div>

            `
        );

    }


    // =====================================================
    // SAVE UPDATED CART
    // =====================================================

    try {

        if (
            isBuyNow
        ) {

            localStorage.setItem(
                "buyNowProduct",
                JSON.stringify(
                    cart[0]
                )
            );

        } else {

            localStorage.setItem(
                "cart",
                JSON.stringify(
                    cart
                )
            );

        }

    } catch (error) {

        console.error(
            "Cart save error:",
            error
        );

    }


    // =====================================================
    // UPDATE SUMMARY
    // =====================================================

    updateCheckoutSummary();

}


// =========================================================
// UPDATE CHECKOUT SUMMARY
// =========================================================

function updateCheckoutSummary() {

    // =====================================================
    // SUBTOTAL
    // =====================================================

    const subtotalElement =
        $("subtotal");


    if (
        subtotalElement
    ) {

        subtotalElement.textContent =
            money(
                subtotal
            );

    }


    // =====================================================
    // DISCOUNT
    // =====================================================

    const discountElement =
        $("discount");


    if (
        discountElement
    ) {

        discountElement.textContent =
            money(
                0
            );

    }


    // =====================================================
    // TOTAL WEIGHT
    // =====================================================

    const weightElement =
        $("totalWeight");


    if (
        weightElement
    ) {

        weightElement.textContent =
            totalWeightKg > 0
                ? `${totalWeightKg.toFixed(
                    2
                )} kg`
                : "0 kg";

    }


    // =====================================================
    // DELIVERY
    // =====================================================

    const deliveryElement =
        $("deliveryCharge");


    if (
        deliveryElement
    ) {

        deliveryElement.textContent =
            money(
                deliveryCharge
            );

    }


    // =====================================================
    // GRAND TOTAL
    // =====================================================

    const grandTotalElement =
        $("grandTotal");


    if (
        grandTotalElement
    ) {

        grandTotalElement.textContent =
            money(
                subtotal +
                deliveryCharge
            );

    }


    // =====================================================
    // ITEM COUNT
    // =====================================================

    const itemCountElement =
        $("checkoutItemCount");


    if (
        itemCountElement
    ) {

        const count =
            cart.reduce(
                (
                    total,
                    item
                ) => {

                    return (
                        total +
                        Math.max(
                            1,
                            numberValue(
                                item.quantity ||
                                item.qty ||
                                1
                            )
                        )
                    );

                },
                0
            );


        itemCountElement.textContent =
            count +
            (
                count === 1
                    ? " Item"
                    : " Items"
            );

    }

}


// =========================================================
// INITIAL PRODUCT LOAD
// =========================================================

loadCheckoutProducts();


// =========================================================
// PART 2 LOADED
// =========================================================

console.log(
    "Checkout Fresh Part 2 Loaded"
);
// =========================================================
// GARIMA'S HOUSE HOLD
// CHECKOUT.JS
// FRESH VERSION - PART 3
// PINCODE + STATE + DELIVERY CALCULATION
// =========================================================


// =========================================================
// CHECK RAJASTHAN PINCODE
// =========================================================

function isRajasthanPincode(
    pincode
) {

    const pin =
        safeText(
            pincode
        )
        .replace(
            /\D/g,
            ""
        );


    if (
        pin.length !== 6
    ) {

        return false;

    }


    const firstDigit =
        Number(
            pin.charAt(0)
        );


    return (
        firstDigit === 3
    );

}


// =========================================================
// CHECK RAJASTHAN STATE
// =========================================================

function isRajasthanState(
    state
) {

    const value =
        safeText(
            state
        )
        .trim()
        .toLowerCase()
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
        value
    );

}


// =========================================================
// GET SHIPPING RATE
// =========================================================

function getShippingRate() {

    const state =
        getValue(
            "customerState"
        );


    const pincode =
        getValue(
            "customerPincode"
        );


    if (
        isRajasthanPincode(
            pincode
        )
    ) {

        return RAJASTHAN_RATE;

    }


    if (
        isRajasthanState(
            state
        )
    ) {

        return RAJASTHAN_RATE;

    }


    return OUTSIDE_RAJASTHAN_RATE;

}


// =========================================================
// CALCULATE DELIVERY CHARGE
// =========================================================

function calculateDelivery() {

    const shippingRate =
        getShippingRate();


    // =====================================================
    // CHARGEABLE WEIGHT
    // =====================================================

    const chargeableWeightKg =
        totalWeightKg > 0
            ? Math.ceil(
                totalWeightKg
            )
            : 0;


    // =====================================================
    // DELIVERY CHARGE
    // =====================================================

    deliveryCharge =
        chargeableWeightKg *
        shippingRate;


    // =====================================================
    // UPDATE SUMMARY
    // =====================================================

    updateCheckoutSummary();


    // =====================================================
    // SHOW SHIPPING RATE
    // =====================================================

    const shippingRateElement =
        $("shippingRate");


    if (
        shippingRateElement
    ) {

        shippingRateElement.textContent =
            money(
                shippingRate
            ) +
            " / kg";

    }


    // =====================================================
    // SHOW CHARGEABLE WEIGHT
    // =====================================================

    const chargeableWeightElement =
        $("chargeableWeight");


    if (
        chargeableWeightElement
    ) {

        chargeableWeightElement.textContent =
            chargeableWeightKg > 0
                ? `${chargeableWeightKg} kg`
                : "0 kg";

    }


    // =====================================================
    // SHOW DELIVERY CHARGE
    // =====================================================

    const deliveryElement =
        $("deliveryCharge");


    if (
        deliveryElement
    ) {

        deliveryElement.textContent =
            deliveryCharge === 0
                ? "FREE"
                : money(
                    deliveryCharge
                );

    }


    // =====================================================
    // UPDATE GRAND TOTAL
    // =====================================================

    const grandTotalElement =
        $("grandTotal");


    if (
        grandTotalElement
    ) {

        grandTotalElement.textContent =
            money(
                subtotal +
                deliveryCharge
            );

    }

}


// =========================================================
// AUTO DETECT STATE FROM PINCODE
// =========================================================

function detectStateFromPincode() {

    const pincodeElement =
        $("customerPincode");


    const stateElement =
        $("customerState");


    if (
        !pincodeElement ||
        !stateElement
    ) {

        return;

    }


    const pincode =
        pincodeElement.value
            .replace(
                /\D/g,
                ""
            )
            .slice(
                0,
                6
            );


    pincodeElement.value =
        pincode;


    if (
        pincode.length === 6
    ) {

        if (
            isRajasthanPincode(
                pincode
            )
        ) {

            stateElement.value =
                "Rajasthan";

        }

    }


    calculateDelivery();

}


// =========================================================
// PINCODE INPUT
// =========================================================

const customerPincode =
    $("customerPincode");


if (
    customerPincode
) {

    customerPincode.addEventListener(
        "input",
        () => {

            customerPincode.value =
                customerPincode.value
                    .replace(
                        /\D/g,
                        ""
                    )
                    .slice(
                        0,
                        6
                    );


            detectStateFromPincode();

        }
    );

}


// =========================================================
// STATE INPUT
// =========================================================

const customerState =
    $("customerState");


if (
    customerState
) {

    customerState.addEventListener(
        "input",
        () => {

            calculateDelivery();

        }
    );


    customerState.addEventListener(
        "change",
        () => {

            calculateDelivery();

        }
    );

}


// =========================================================
// CITY INPUT
// =========================================================

const customerCity =
    $("customerCity");


if (
    customerCity
) {

    customerCity.addEventListener(
        "input",
        () => {

            calculateDelivery();

        }
    );

}


// =========================================================
// INITIAL DELIVERY CALCULATION
// =========================================================

detectStateFromPincode();


// =========================================================
// PART 3 LOADED
// =========================================================

console.log(
    "Checkout Fresh Part 3 Loaded"
);

console.log(
    "Rajasthan Rate:",
    RAJASTHAN_RATE
);

console.log(
    "Outside Rajasthan Rate:",
    OUTSIDE_RAJASTHAN_RATE
);
// =========================================================
// GARIMA'S HOUSE HOLD
// CHECKOUT.JS
// FRESH VERSION - PART 4
// PAYMENT PROOF + UPI
// NO UTR
// =========================================================


// =========================================================
// UPI ID DISPLAY
// =========================================================

const upiIdElement =
    $("upiId");


if (
    upiIdElement
) {

    upiIdElement.textContent =
        UPI_ID;

}


// =========================================================
// COPY UPI ID
// =========================================================

const copyUPIButton =
    $("copyUPI");


if (
    copyUPIButton
) {

    copyUPIButton.addEventListener(
        "click",
        async () => {

            try {

                await navigator.clipboard.writeText(
                    UPI_ID
                );


                copyUPIButton.textContent =
                    "Copied";


                setTimeout(
                    () => {

                        copyUPIButton.textContent =
                            "Copy";

                    },
                    1500
                );


            } catch (error) {

                console.error(
                    "UPI copy error:",
                    error
                );


                alert(
                    "Unable to copy UPI ID."
                );

            }

        }
    );

}


// =========================================================
// PAYMENT SCREENSHOT ELEMENTS
// =========================================================

const paymentScreenshot =
    $("paymentScreenshot");


const paymentPreview =
    $("paymentPreview");


const paymentScreenshotPreview =
    $("paymentScreenshotPreview");


const paymentScreenshotName =
    $("paymentScreenshotName");


const paymentScreenshotSize =
    $("paymentScreenshotSize");


const paymentUploadError =
    $("paymentUploadError");


const removePaymentScreenshot =
    $("removePaymentScreenshot");


// =========================================================
// MAX PAYMENT FILE SIZE
// 5 MB
// =========================================================

const MAX_PAYMENT_FILE_SIZE =
    5 * 1024 * 1024;


// =========================================================
// PAYMENT SCREENSHOT CHANGE
// =========================================================

if (
    paymentScreenshot
) {

    paymentScreenshot.addEventListener(
        "change",
        () => {

            // =========================================
            // CLEAR OLD ERROR
            // =========================================

            if (
                paymentUploadError
            ) {

                paymentUploadError.textContent =
                    "";

            }


            const file =
                paymentScreenshot.files[0];


            // =========================================
            // NO FILE
            // =========================================

            if (!file) {

                if (
                    paymentPreview
                ) {

                    paymentPreview.hidden =
                        true;

                }

                return;

            }


            // =========================================
            // ALLOWED TYPES
            // =========================================

            const allowedTypes = [

                "image/jpeg",

                "image/jpg",

                "image/png",

                "image/webp"

            ];


            if (
                !allowedTypes.includes(
                    file.type
                )
            ) {

                if (
                    paymentUploadError
                ) {

                    paymentUploadError.textContent =
                        "Please upload JPG, PNG or WEBP image.";

                }


                paymentScreenshot.value =
                    "";


                if (
                    paymentPreview
                ) {

                    paymentPreview.hidden =
                        true;

                }

                return;

            }


            // =========================================
            // FILE SIZE
            // =========================================

            if (
                file.size >
                MAX_PAYMENT_FILE_SIZE
            ) {

                if (
                    paymentUploadError
                ) {

                    paymentUploadError.textContent =
                        "Payment screenshot must be less than 5 MB.";

                }


                paymentScreenshot.value =
                    "";


                if (
                    paymentPreview
                ) {

                    paymentPreview.hidden =
                        true;

                }

                return;

            }


            // =========================================
            // FILE NAME
            // =========================================

            if (
                paymentScreenshotName
            ) {

                paymentScreenshotName.textContent =
                    file.name;

            }


            // =========================================
            // FILE SIZE DISPLAY
            // =========================================

            if (
                paymentScreenshotSize
            ) {

                const sizeKB =
                    (
                        file.size /
                        1024
                    ).toFixed(
                        1
                    );


                paymentScreenshotSize.textContent =
                    sizeKB +
                    " KB";

            }


            // =========================================
            // IMAGE PREVIEW
            // =========================================

            const reader =
                new FileReader();


            reader.onload =
                event => {

                    if (
                        paymentScreenshotPreview
                    ) {

                        paymentScreenshotPreview.src =
                            event.target.result;

                    }


                    if (
                        paymentPreview
                    ) {

                        paymentPreview.hidden =
                            false;

                    }

                };


            reader.readAsDataURL(
                file
            );

        }
    );

}


// =========================================================
// REMOVE PAYMENT SCREENSHOT
// =========================================================

if (
    removePaymentScreenshot
) {

    removePaymentScreenshot.addEventListener(
        "click",
        () => {

            if (
                paymentScreenshot
            ) {

                paymentScreenshot.value =
                    "";

            }


            if (
                paymentScreenshotPreview
            ) {

                paymentScreenshotPreview.src =
                    "";

            }


            if (
                paymentScreenshotName
            ) {

                paymentScreenshotName.textContent =
                    "";

            }


            if (
                paymentScreenshotSize
            ) {

                paymentScreenshotSize.textContent =
                    "";

            }


            if (
                paymentPreview
            ) {

                paymentPreview.hidden =
                    true;

            }


            if (
                paymentUploadError
            ) {

                paymentUploadError.textContent =
                    "";

            }

        }
    );

}


// =========================================================
// PAYMENT CONFIRMATION
// =========================================================

const paymentConfirm =
    $("paymentConfirm");


if (
    paymentConfirm
) {

    paymentConfirm.addEventListener(
        "change",
        () => {

            if (
                paymentConfirm.checked
            ) {

                console.log(
                    "Payment confirmation checked."
                );

            } else {

                console.log(
                    "Payment confirmation unchecked."
                );

            }

        }
    );

}


// =========================================================
// PAYMENT SECTION INITIAL STATE
// =========================================================

if (
    paymentPreview
) {

    paymentPreview.hidden =
        true;

}


// =========================================================
// PART 4 LOADED
// =========================================================

console.log(
    "Checkout Fresh Part 4 Loaded"
);

console.log(
    "UPI Payment: READY"
);

console.log(
    "Payment Screenshot: READY"
);

console.log(
    "UTR: DISABLED"
);
// =========================================================
// GARIMA'S HOUSE HOLD
// CHECKOUT.JS
// FRESH VERSION - PART 5
// PLACE ORDER + PAYMENT PROOF + FIREBASE
// NO UTR
// =========================================================


// =========================================================
// PLACE ORDER BUTTON
// =========================================================

const placeOrderButton =
    $("placeOrderBtn");


if (
    placeOrderButton
) {

    placeOrderButton.addEventListener(
        "click",
        async () => {

            // =================================================
            // PREVENT DOUBLE CLICK
            // =================================================

            if (
                placeOrderButton.disabled
            ) {

                return;

            }


            // =================================================
            // CUSTOMER DETAILS
            // =================================================

            const name =
                getValue(
                    "customerName"
                );


            const mobile =
                getValue(
                    "customerMobile"
                );


            const email =
                getValue(
                    "customerEmail"
                );


            const address =
                getValue(
                    "customerAddress"
                );


            const city =
                getValue(
                    "customerCity"
                );


            const state =
                getValue(
                    "customerState"
                );


            const pincode =
                getValue(
                    "customerPincode"
                );


            // =================================================
            // PAYMENT CONFIRMATION
            // =================================================

            const paymentConfirmElement =
                $("paymentConfirm");


            const paymentConfirmed =
                paymentConfirmElement
                    ? paymentConfirmElement.checked
                    : false;


            // =================================================
            // PAYMENT SCREENSHOT
            // =================================================

            const screenshot =
                paymentScreenshot &&
                paymentScreenshot.files &&
                paymentScreenshot.files.length > 0
                    ? paymentScreenshot.files[0]
                    : null;


            // =================================================
            // CART CHECK
            // =================================================

            if (
                cart.length === 0
            ) {

                alert(
                    "Your cart is empty."
                );

                return;

            }


            // =================================================
            // NAME VALIDATION
            // =================================================

            if (
                !name
            ) {

                alert(
                    "Please enter your full name."
                );

                return;

            }


            // =================================================
            // MOBILE VALIDATION
            // =================================================

            if (
                !/^\d{10}$/.test(
                    mobile
                )
            ) {

                alert(
                    "Please enter a valid 10 digit mobile number."
                );

                return;

            }


            // =================================================
            // ADDRESS VALIDATION
            // =================================================

            if (
                !address
            ) {

                alert(
                    "Please enter your complete address."
                );

                return;

            }


            // =================================================
            // CITY VALIDATION
            // =================================================

            if (
                !city
            ) {

                alert(
                    "Please enter your city."
                );

                return;

            }


            // =================================================
            // STATE VALIDATION
            // =================================================

            if (
                !state
            ) {

                alert(
                    "Please enter your state."
                );

                return;

            }


            // =================================================
            // PINCODE VALIDATION
            // =================================================

            if (
                !/^\d{6}$/.test(
                    pincode
                )
            ) {

                alert(
                    "Please enter a valid 6 digit pincode."
                );

                return;

            }


            // =================================================
            // PAYMENT SCREENSHOT
            // =================================================

            if (
                !screenshot
            ) {

                alert(
                    "Please upload your payment screenshot."
                );

                return;

            }


            // =================================================
            // PAYMENT CONFIRMATION
            // =================================================

            if (
                !paymentConfirmed
            ) {

                alert(
                    "Please confirm that you have completed the UPI payment."
                );

                return;

            }


            // =================================================
            // RECALCULATE DELIVERY
            // =================================================

            calculateDelivery();


            // =================================================
            // FINAL VALUES
            // =================================================

            const shippingRate =
                getShippingRate();


            const chargeableWeightKg =
                totalWeightKg > 0
                    ? Math.ceil(
                        totalWeightKg
                    )
                    : 0;


            const finalTotal =
                subtotal +
                deliveryCharge;


            // =================================================
            // DISABLE BUTTON
            // =================================================

            placeOrderButton.disabled =
                true;


            placeOrderButton.innerHTML = `

                <i
                    class="fa-solid fa-spinner fa-spin"
                ></i>

                Processing Order...

            `;


            try {

                // =================================================
                // UPLOAD PAYMENT SCREENSHOT
                // =================================================

                const safeFileName =
                    screenshot.name
                        .replace(
                            /[^a-zA-Z0-9._-]/g,
                            "_"
                        );


                const storagePath =
                    `paymentProof/${Date.now()}_${safeFileName}`;


                const paymentStorageRef =
                    ref(
                        storage,
                        storagePath
                    );


                const uploadResult =
                    await uploadBytes(
                        paymentStorageRef,
                        screenshot
                    );


                const paymentProofUrl =
                    await getDownloadURL(
                        uploadResult.ref
                    );


                // =================================================
                // PREPARE PRODUCTS
                // =================================================

                const orderProducts =
                    cart.map(
                        item => {

                            const quantity =
                                Math.max(
                                    1,
                                    numberValue(
                                        item.quantity ||
                                        item.qty ||
                                        1
                                    )
                                );


                            return {

                                id:
                                    item.id ||
                                    "",

                                name:
                                    item.name ||
                                    "Product",

                                sku:
                                    item.sku ||
                                    "",

                                image:
                                    item.image ||
                                    "",

                                price:
                                    numberValue(
                                        item.price
                                    ),

                                quantity:
                                    quantity,

                                qty:
                                    quantity,

                                category:
                                    item.category ||
                                    "",

                                weightKg:
                                    numberValue(
                                        item.weightKg ||
                                        item.weight
                                    )

                            };

                        }
                    );


                // =================================================
                // CREATE ORDER OBJECT
                // =================================================

                const order = {

                    customer: {

                        name:
                            name,

                        mobile:
                            mobile,

                        email:
                            email,

                        address:
                            address,

                        city:
                            city,

                        state:
                            state,

                        pincode:
                            pincode

                    },


                    products:
                        orderProducts,


                    subtotal:
                        subtotal,


                    totalWeightKg:
                        totalWeightKg,


                    chargeableWeightKg:
                        chargeableWeightKg,


                    shippingRate:
                        shippingRate,


                    deliveryCharge:
                        deliveryCharge,


                    discount:
    couponDiscount,

coupon: appliedCoupon
    ? {
        code:
            appliedCoupon.code,

        type:
            appliedCoupon.type,

        value:
            appliedCoupon.value,

        discount:
            couponDiscount
    }
    : null,

total:
    finalTotal,


                    payment: {

                        method:
                            "UPI",

                        upiId:
                            UPI_ID,

                        status:
                            "Pending Verification",

                        proof:
                            paymentProofUrl,

                        paymentProof:
                            paymentProofUrl

                    },


                    orderStatus:
                        "Pending",


                    createdAt:
                        serverTimestamp()

                };


                // =================================================
                // SAVE ORDER TO FIRESTORE
                // =================================================

                const orderReference =
                    await addDoc(

                        collection(
                            db,
                            "orders"
                        ),

                        order

                    );


                // =================================================
                // WHATSAPP PRODUCT LIST
                // =================================================

                const productsList =
                    orderProducts
                        .map(
                            item => {

                                return (
                                    `• ${item.quantity} × ${item.name}`
                                );

                            }
                        )
                        .join(
                            "\n"
                        );


                // =================================================
                // WHATSAPP MESSAGE
                // =================================================

                const whatsappMessage =

`🛒 *New Order - Garima's House Hold*

🆔 Order ID:
${orderReference.id}

👤 Customer:
${name}

📞 Mobile:
${mobile}

📍 Address:
${address}
${city}, ${state} - ${pincode}

🛍️ Products:
${productsList}

⚖️ Total Weight:
${totalWeightKg.toFixed(2)} kg

📦 Chargeable Weight:
${chargeableWeightKg} kg

🚚 Delivery:
${money(deliveryCharge)}

💰 Subtotal:
${money(subtotal)}

💰 *Total:
${money(finalTotal)}*

💳 Payment:
UPI

⏳ Payment Status:
Pending Verification

📸 Payment Proof:
Uploaded`;


                // =================================================
                // OPEN WHATSAPP
                // =================================================

                const whatsappURL =
                    `https://wa.me/${WHATSAPP_NUMBER}?text=${
                        encodeURIComponent(
                            whatsappMessage
                        )
                    }`;


                window.open(
                    whatsappURL,
                    "_blank"
                );


                // =================================================
                // CLEAR CART
                // =================================================

                if (
                    isBuyNow
                ) {

                    localStorage.removeItem(
                        "buyNowProduct"
                    );

                } else {

                    localStorage.removeItem(
                        "cart"
                    );

                }


                // =================================================
                // GO TO SUCCESS PAGE
                // =================================================

                window.location.href =
                    "order-success.html?id=" +
                    encodeURIComponent(
                        orderReference.id
                    );

            } catch (error) {

                console.error(
                    "Place Order Error:",
                    error
                );


                alert(
                    "Order could not be placed. Please try again."
                );


                // =================================================
                // ENABLE BUTTON AGAIN
                // =================================================

                placeOrderButton.disabled =
                    false;


                placeOrderButton.innerHTML = `

                    <i
                        class="fa-solid fa-lock"
                    ></i>

                    Place Order

                    <i
                        class="fa-solid fa-arrow-right"
                    ></i>

                `;

            }

        }
    );

}


// =========================================================
// PART 5 LOADED
// =========================================================

console.log(
    "Checkout Fresh Part 5 Loaded"
);

console.log(
    "Place Order: READY"
);

console.log(
    "Payment Proof Upload: READY"
);

console.log(
    "Firestore Order Save: READY"
);

console.log(
    "UTR: NOT USED"
);
// =========================================================
// GARIMA'S HOUSE HOLD
// CHECKOUT COUPON SYSTEM
// FRESH VERSION - PART 3
// FIREBASE COUPON SETUP
// =========================================================


// =========================================================
// COUPON STATE
// =========================================================

let appliedCoupon = null;

let couponDiscount = 0;


// =========================================================
// COUPON DOM ELEMENTS
// =========================================================

const couponCodeInput =
    document.getElementById(
        "checkout-coupon-code"
    );


const applyCouponButton =
    document.getElementById(
        "apply-coupon"
    );


const couponMessage =
    document.getElementById(
        "coupon-message"
    );


const couponAppliedBox =
    document.getElementById(
        "coupon-applied"
    );


const appliedCouponCode =
    document.getElementById(
        "applied-coupon-code"
    );


const removeCouponButton =
    document.getElementById(
        "remove-coupon"
    );


// =========================================================
// CHECK COUPON ELEMENTS
// =========================================================

if (
    !couponCodeInput ||
    !applyCouponButton ||
    !couponMessage ||
    !couponAppliedBox ||
    !appliedCouponCode ||
    !removeCouponButton
) {

    console.warn(
        "Checkout Coupon: Required HTML elements not found."
    );

}


// =========================================================
// COUPON CODE CLEANUP
// =========================================================

function getCouponCode() {

    if (
        !couponCodeInput
    ) {

        return "";

    }


    return couponCodeInput.value
        .trim()
        .toUpperCase();

}


// =========================================================
// SHOW COUPON MESSAGE
// =========================================================

function showCouponMessage(
    message,
    type = "error"
) {

    if (
        !couponMessage
    ) {

        return;

    }


    couponMessage.textContent =
        message;


    couponMessage.className =
        `coupon-message ${type}`;


    couponMessage.hidden =
        false;

}


// =========================================================
// HIDE COUPON MESSAGE
// =========================================================

function hideCouponMessage() {

    if (
        !couponMessage
    ) {

        return;

    }


    couponMessage.textContent =
        "";


    couponMessage.hidden =
        true;


    couponMessage.className =
        "coupon-message";

}


// =========================================================
// SHOW APPLIED COUPON
// =========================================================

function showAppliedCoupon(
    code
) {

    if (
        !couponAppliedBox ||
        !appliedCouponCode
    ) {

        return;

    }


    appliedCouponCode.textContent =
        code;


    couponAppliedBox.hidden =
        false;

}


// =========================================================
// HIDE APPLIED COUPON
// =========================================================

function hideAppliedCoupon() {

    if (
        !couponAppliedBox
    ) {

        return;

    }


    couponAppliedBox.hidden =
        true;

}


// =========================================================
// RESET COUPON STATE
// =========================================================

function resetCouponState() {

    appliedCoupon =
        null;


    couponDiscount =
        0;


    hideAppliedCoupon();

    hideCouponMessage();


    if (
        couponCodeInput
    ) {

        couponCodeInput.value =
            "";

    }

}


// =========================================================
// PART 3 LOADED
// =========================================================

console.log(
    "Checkout Coupon Part 3 Loaded."
);
// =========================================================
// GARIMA'S HOUSE HOLD
// CHECKOUT COUPON SYSTEM
// FRESH VERSION - PART 4
// COUPON VALIDATION + APPLY
// =========================================================


// =========================================================
// FIND CURRENT SUBTOTAL
// =========================================================

function getCouponSubtotal() {

    /*
       Tumhare existing checkout code mein
       subtotal variable calculate hota hai.

       Agar subtotal available hai to use karo.
    */

    if (
        typeof subtotal !== "undefined" &&
        Number.isFinite(
            Number(subtotal)
        )
    ) {

        return Number(
            subtotal
        );

    }


    /*
       Fallback:
       Cart se subtotal calculate karne ki koshish.
    */

    if (
        typeof cart !== "undefined" &&
        Array.isArray(cart)
    ) {

        return cart.reduce(
            (
                total,
                item
            ) => {

                const price =
                    Number(
                        item.price || 0
                    );


                const quantity =
                    Number(
                        item.quantity ||
                        item.qty ||
                        1
                    );


                return total +
                    (
                        price *
                        quantity
                    );

            },
            0
        );

    }


    return 0;

}


// =========================================================
// CALCULATE COUPON DISCOUNT
// =========================================================

function calculateCouponDiscount(
    coupon,
    orderSubtotal
) {

    const type =
        coupon.type ||
        "percentage";


    const value =
        Number(
            coupon.value || 0
        );


    const maxDiscount =
        Number(
            coupon.maxDiscount || 0
        );


    let discount =
        0;


    // =====================================================
    // PERCENTAGE DISCOUNT
    // =====================================================

    if (
        type === "percentage"
    ) {

        discount =
            (
                orderSubtotal *
                value
            ) / 100;


        /*
           Maximum discount is applied
           only when it is greater than 0.
        */

        if (
            maxDiscount > 0 &&
            discount > maxDiscount
        ) {

            discount =
                maxDiscount;

        }

    }


    // =====================================================
    // FLAT DISCOUNT
    // =====================================================

    else if (
        type === "flat"
    ) {

        discount =
            value;

    }


    // =====================================================
    // NEVER DISCOUNT MORE THAN SUBTOTAL
    // =====================================================

    if (
        discount > orderSubtotal
    ) {

        discount =
            orderSubtotal;

    }


    if (
        discount < 0 ||
        !Number.isFinite(
            discount
        )
    ) {

        discount =
            0;

    }


    return Math.round(
        discount * 100
    ) / 100;

}


// =========================================================
// APPLY COUPON
// =========================================================

async function applyCoupon() {

    const code =
        getCouponCode();


    // =====================================================
    // EMPTY CODE
    // =====================================================

    if (
        !code
    ) {

        showCouponMessage(
            "Please enter a coupon code.",
            "error"
        );

        return;

    }


    // =====================================================
    // DISABLE BUTTON
    // =====================================================

    if (
        applyCouponButton.disabled
    ) {

        return;

    }


    applyCouponButton.disabled =
        true;


    applyCouponButton.textContent =
        "Checking...";


    hideCouponMessage();


    try {

        // =================================================
        // GET COUPONS
        // =================================================

        const snapshot =
            await getDocs(
                collection(
                    db,
                    "coupons"
                )
            );


        let selectedCoupon =
            null;


        // =================================================
        // FIND COUPON
        // =================================================

        snapshot.forEach(
            couponDoc => {

                const coupon =
                    couponDoc.data();


                const couponCode =
                    String(
                        coupon.code || ""
                    )
                    .trim()
                    .toUpperCase();


                if (
                    couponCode === code
                ) {

                    selectedCoupon = {

                        id:
                            couponDoc.id,

                        ...coupon

                    };

                }

            }
        );


        // =================================================
        // COUPON NOT FOUND
        // =================================================

        if (
            !selectedCoupon
        ) {

            showCouponMessage(
                "Invalid coupon code.",
                "error"
            );

            return;

        }


        // =================================================
        // ACTIVE CHECK
        // =================================================

        if (
            selectedCoupon.active !== true
        ) {

            showCouponMessage(
                "This coupon is currently inactive.",
                "error"
            );

            return;

        }


        // =================================================
        // EXPIRY CHECK
        // =================================================

        if (
            selectedCoupon.expiry
        ) {

            const expiryDate =
                new Date(
                    selectedCoupon.expiry +
                    "T23:59:59"
                );


            if (
                !Number.isNaN(
                    expiryDate.getTime()
                ) &&
                expiryDate < new Date()
            ) {

                showCouponMessage(
                    "This coupon has expired.",
                    "error"
                );

                return;

            }

        }


        // =================================================
        // SUBTOTAL
        // =================================================

        const orderSubtotal =
            getCouponSubtotal();


        if (
            orderSubtotal <= 0
        ) {

            showCouponMessage(
                "Your cart is empty.",
                "error"
            );

            return;

        }


        // =================================================
        // MINIMUM ORDER CHECK
        // =================================================

        const minimumOrder =
            Number(
                selectedCoupon.minimumOrder || 0
            );


        if (
            orderSubtotal <
            minimumOrder
        ) {

            showCouponMessage(
                `Minimum order value for this coupon is ₹${minimumOrder}.`,
                "error"
            );

            return;

        }


        // =================================================
        // CALCULATE DISCOUNT
        // =================================================

        const discount =
            calculateCouponDiscount(
                selectedCoupon,
                orderSubtotal
            );


        if (
            discount <= 0
        ) {

            showCouponMessage(
                "This coupon cannot be applied to the current order.",
                "error"
            );

            return;

        }


        // =================================================
        // SAVE COUPON STATE
        // =================================================

        appliedCoupon = {

            id:
                selectedCoupon.id,

            code:
                selectedCoupon.code,

            type:
                selectedCoupon.type,

            value:
                Number(
                    selectedCoupon.value || 0
                ),

            minimumOrder:
                minimumOrder,

            maxDiscount:
                Number(
                    selectedCoupon.maxDiscount || 0
                )

        };


        couponDiscount =
            discount;


        // =================================================
        // SHOW SUCCESS
        // =================================================

        showAppliedCoupon(
            selectedCoupon.code
        );


        showCouponMessage(
            `Coupon applied successfully. You saved ₹${discount.toFixed(2)}.`,
            "success"
        );


        // =================================================
        // UPDATE TOTAL
        // =================================================

        if (
            typeof updateCheckoutTotal ===
            "function"
        ) {

            updateCheckoutTotal();

        }


        if (
            typeof updateOrderSummary ===
            "function"
        ) {

            updateOrderSummary();

        }


    } catch (error) {

        console.error(
            "Apply Coupon Error:",
            error
        );


        showCouponMessage(
            "Unable to verify coupon. Please try again.",
            "error"
        );


    } finally {

        applyCouponButton.disabled =
            false;


        applyCouponButton.textContent =
            "Apply";

    }

}


// =========================================================
// APPLY BUTTON
// =========================================================

if (
    applyCouponButton
) {

    applyCouponButton.addEventListener(
        "click",
        applyCoupon
    );

}


// =========================================================
// ENTER KEY
// =========================================================

if (
    couponCodeInput
) {

    couponCodeInput.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Enter"
            ) {

                event.preventDefault();

                applyCoupon();

            }

        }
    );

}


// =========================================================
// PART 4 LOADED
// =========================================================

console.log(
    "Checkout Coupon Part 4 Loaded."
);
// =========================================================
// GARIMA'S HOUSE HOLD
// CHECKOUT COUPON SYSTEM
// FRESH VERSION - PART 5
// DISCOUNT + TOTAL UPDATE
// =========================================================


// =========================================================
// GET FINAL COUPON DISCOUNT
// =========================================================

function getAppliedCouponDiscount() {

    const discount =
        Number(
            couponDiscount || 0
        );


    if (
        !Number.isFinite(
            discount
        ) ||
        discount < 0
    ) {

        return 0;

    }


    return discount;

}


// =========================================================
// CALCULATE FINAL TOTAL
// =========================================================

function calculateCheckoutFinalTotal() {

    const orderSubtotal =
        getCouponSubtotal();


    const discount =
        getAppliedCouponDiscount();


    const delivery =
        typeof deliveryCharge !== "undefined"
            ? Number(
                deliveryCharge || 0
            )
            : 0;


    let finalTotal =
        orderSubtotal -
        discount +
        delivery;


    if (
        finalTotal < 0
    ) {

        finalTotal =
            0;

    }


    return Math.round(
        finalTotal * 100
    ) / 100;

}


// =========================================================
// UPDATE COUPON DISCOUNT DISPLAY
// =========================================================

function updateCouponDiscountDisplay() {

    /*
       Existing checkout HTML mein
       discount element alag ID se ho sakta hai.

       Isliye common IDs check kar rahe hain.
    */

    const possibleElements = [

        document.getElementById(
            "discount-amount"
        ),

        document.getElementById(
            "checkout-discount"
        ),

        document.getElementById(
            "discount"
        )

    ];


    const discountElement =
        possibleElements.find(
            element => element
        );


    if (
        discountElement
    ) {

        const discount =
            getAppliedCouponDiscount();


        discountElement.textContent =
            discount > 0
                ? `- ₹${discount.toFixed(2)}`
                : "₹0.00";

    }

}


// =========================================================
// UPDATE FINAL TOTAL DISPLAY
// =========================================================

function updateCouponFinalTotalDisplay() {

    const possibleElements = [

        document.getElementById(
            "total"
        ),

        document.getElementById(
            "checkout-total"
        ),

        document.getElementById(
            "final-total"
        ),

        document.getElementById(
            "grand-total"
        )

    ];


    const totalElement =
        possibleElements.find(
            element => element
        );


    if (
        !totalElement
    ) {

        return;

    }


    const finalTotal =
        calculateCheckoutFinalTotal();


    totalElement.textContent =
        `₹${finalTotal.toFixed(2)}`;

}


// =========================================================
// UPDATE CHECKOUT TOTAL
// =========================================================

function updateCouponCheckoutTotal() {

    updateCouponDiscountDisplay();

    updateCouponFinalTotalDisplay();

}


// =========================================================
// REMOVE COUPON
// =========================================================

function removeCoupon() {

    appliedCoupon =
        null;


    couponDiscount =
        0;


    hideAppliedCoupon();

    hideCouponMessage();


    if (
        couponCodeInput
    ) {

        couponCodeInput.value =
            "";

    }


    updateCouponCheckoutTotal();

}


// =========================================================
// REMOVE BUTTON
// =========================================================

if (
    removeCouponButton
) {

    removeCouponButton.addEventListener(
        "click",
        removeCoupon
    );

}


// =========================================================
// AFTER COUPON APPLY
// =========================================================

const originalUpdateCheckoutTotal =
    typeof updateCheckoutTotal ===
    "function"
        ? updateCheckoutTotal
        : null;


if (
    originalUpdateCheckoutTotal
) {

    /*
       Existing checkout function ko
       replace nahi kar rahe.

       Coupon discount apply hone ke baad
       existing calculation ke saath
       coupon display bhi update hoga.
    */

    window.updateCheckoutTotal =
        function () {

            originalUpdateCheckoutTotal();

            updateCouponCheckoutTotal();

        };

}


// =========================================================
// PAYMENT SUMMARY REFRESH
// =========================================================

if (
    typeof updateOrderSummary ===
    "function"
) {

    const originalUpdateOrderSummary =
        updateOrderSummary;


    window.updateOrderSummary =
        function () {

            originalUpdateOrderSummary();

            updateCouponCheckoutTotal();

        };

}


// =========================================================
// INITIAL DISPLAY
// =========================================================

updateCouponCheckoutTotal();


// =========================================================
// PART 5 LOADED
// =========================================================

console.log(
    "Checkout Coupon Part 5 Loaded."
);
// =========================================================
// CHECKOUT COUPON SYSTEM
// PART 7
// FINAL SUMMARY CONNECTION
// =========================================================


// =========================================================
// COUPON-AWARE CHECKOUT SUMMARY
// =========================================================

function updateCouponAwareCheckoutSummary() {

    try {

        // -----------------------------------------------
        // SUBTOTAL
        // -----------------------------------------------

        const subtotal =
            Number(
                getCheckoutSubtotal() || 0
            );


        // -----------------------------------------------
        // COUPON DISCOUNT
        // -----------------------------------------------

        const discount =
            Number(
                checkoutCoupon?.discount || 0
            );


        // -----------------------------------------------
        // SHIPPING
        // -----------------------------------------------

        const shipping =
            Number(
                getCheckoutShipping() || 0
            );


        // -----------------------------------------------
        // FINAL TOTAL
        // -----------------------------------------------

        const total =
            Math.max(
                0,
                subtotal -
                discount +
                shipping
            );


        // -----------------------------------------------
        // UPDATE EXISTING HTML
        // -----------------------------------------------

        const subtotalElement =
            document.getElementById(
                "subtotal"
            );


        const discountElement =
            document.getElementById(
                "discount"
            );


        const totalElement =
            document.getElementById(
                "grandTotal"
            );


        if (
            subtotalElement
        ) {

            subtotalElement.textContent =
                formatMoney(
                    subtotal
                );

        }


        if (
            discountElement
        ) {

            discountElement.textContent =
                formatMoney(
                    discount
                );

        }


        if (
            totalElement
        ) {

            totalElement.textContent =
                formatMoney(
                    total
                );

        }


        // -----------------------------------------------
        // UPDATE EXISTING CHECKOUT FUNCTION
        // -----------------------------------------------

        if (
            typeof updateCheckoutSummary ===
            "function"
        ) {

            updateCheckoutSummary();

        }


    } catch (error) {

        console.error(
            "Coupon Summary Update Error:",
            error
        );

    }

}


// =========================================================
// RUN AFTER PAGE LOAD
// =========================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        setTimeout(
            () => {

                updateCouponAwareCheckoutSummary();

            },
            300
        );

    }
);


// =========================================================
// PART 7 LOADED
// =========================================================

console.log(
    "Checkout Coupon Part 7 Loaded."
);
