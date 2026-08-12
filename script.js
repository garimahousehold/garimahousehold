/* =========================================================
   GARIMA'S HOUSE HOLD
   script.js — PART 1
   ========================================================= */


/* =========================================================
   1. FIREBASE IMPORT
========================================================= */

import {
    db
} from "./firebase.js";

import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

/* =========================================================
   2. GLOBAL VARIABLES
========================================================= */

let allProducts = [];
let filteredProducts = [];

let currentCategory = "All Products";
let currentSearch = "";

let cart = JSON.parse(
    localStorage.getItem("garima_cart")
) || [];

let wishlist = JSON.parse(
    localStorage.getItem("garima_wishlist")
) || [];


/* =========================================================
   3. PAGE LOAD
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        console.log(
            "Garima's House Hold website loaded."
        );

        updateCartCount();

        updateWishlistCount();

        setupSearch();

        setupHeaderButtons();

        setupBackToTop();

        setupCategoryButtons();

        loadProducts();

    }
);


/* =========================================================
   4. LOAD PRODUCTS FROM FIRESTORE
========================================================= */

async function loadProducts() {

    try {

        console.log(
            "Loading products from Firebase..."
        );


        const productsRef =
            collection(
                db,
                "products"
            );


        const snapshot =
            await getDocs(
                productsRef
            );


        allProducts = [];


        snapshot.forEach(
            (doc) => {

                allProducts.push({

                    id: doc.id,

                    ...doc.data()

                });

            }
        );


        console.log(
            "Products loaded:",
            allProducts.length
        );


        filteredProducts =
            [...allProducts];


        renderProducts();


    } catch (error) {

        console.error(
            "Error loading products:",
            error
        );

    }

}


/* =========================================================
   5. PRODUCT IMAGE
========================================================= */

function getProductImage(product) {

    if (!product) {
        return "";
    }


    return (

        product.image ||

        product.imageUrl ||

        product.imageURL ||

        product.photo ||

        product.productImage ||

        ""

    );

}


/* =========================================================
   6. PRODUCT NAME
========================================================= */

function getProductName(product) {

    if (!product) {
        return "Product";
    }


    return (

        product.name ||

        product.productName ||

        product.title ||

        "Product"

    );

}


/* =========================================================
   7. CATEGORY
========================================================= */

function getProductCategory(product) {

    if (!product) {
        return "";
    }


    return (

        product.category ||

        product.categoryName ||

        product.cat ||

        ""

    );

}


/* =========================================================
   8. SELLING PRICE
========================================================= */

function getSellingPrice(product) {

    if (!product) {
        return 0;
    }


    return Number(

        product.price ||

        product.sellingPrice ||

        product.salePrice ||

        0

    );

}


/* =========================================================
   9. MRP
========================================================= */

function getMRP(product) {

    if (!product) {
        return 0;
    }


    return Number(

        product.mrp ||

        product.MRP ||

        product.originalPrice ||

        product.marketPrice ||

        product.price ||

        0

    );

}


/* =========================================================
   10. SKU
========================================================= */

function getSKU(product) {

    if (!product) {
        return "";
    }


    return (

        product.sku ||

        product.SKU ||

        product.skuId ||

        product.skuID ||

        ""

    );

}


/* =========================================================
   11. STOCK
========================================================= */

function getStock(product) {

    if (!product) {
        return 0;
    }


    return Number(

        product.stock ||

        product.quantity ||

        product.availableStock ||

        0

    );

}


/* =========================================================
   12. DISCOUNT
========================================================= */

function calculateDiscount(product) {

    const mrp =
        getMRP(product);


    const price =
        getSellingPrice(product);


    if (
        !mrp ||
        !price ||
        mrp <= price
    ) {

        return 0;

    }


    return Math.round(

        (
            (mrp - price) /
            mrp
        ) * 100

    );

}


/* =========================================================
   13. SEARCH SETUP
========================================================= */

function setupSearch() {

    const searchInput =
        document.querySelector(
            "#searchInput"
        );


    const searchButton =
        document.querySelector(
            "#searchButton"
        );


    if (searchInput) {

        searchInput.addEventListener(
            "input",
            () => {

                currentSearch =
                    searchInput.value
                        .trim()
                        .toLowerCase();


                applyFilters();

            }
        );

    }


    if (searchButton) {

        searchButton.addEventListener(
            "click",
            () => {

                currentSearch =
                    searchInput
                        ? searchInput.value
                            .trim()
                            .toLowerCase()
                        : "";


                applyFilters();

            }
        );

    }

}


/* =========================================================
   14. APPLY SEARCH + CATEGORY
========================================================= */

function applyFilters() {

    filteredProducts =
        allProducts.filter(
            (product) => {


                const name =
                    getProductName(product)
                        .toLowerCase();


                const category =
                    getProductCategory(product)
                        .toLowerCase();


                const sku =
                    getSKU(product)
                        .toLowerCase();


                const searchMatch =

                    !currentSearch ||

                    name.includes(
                        currentSearch
                    ) ||

                    category.includes(
                        currentSearch
                    ) ||

                    sku.includes(
                        currentSearch
                    );


                const categoryMatch =

                    currentCategory ===
                    "All Products"

                    ||

                    category ===
                    currentCategory
                        .toLowerCase();


                return (

                    searchMatch &&

                    categoryMatch

                );

            }
        );


    renderProducts();

}


/* =========================================================
   15. CHANGE CATEGORY
========================================================= */

function setCategory(category) {

    currentCategory =
        category || "All Products";


    applyFilters();

}


/* =========================================================
   16. RENDER PRODUCTS
========================================================= */

function renderProducts() {

    const container =

        document.querySelector(
            "#productGrid"
        )

        ||

        document.querySelector(
            ".product-grid"
        )

        ||

        document.querySelector(
            "#featuredProducts"
        );


    if (!container) {

        console.log(
            "Product container not found."
        );

        return;

    }


    container.innerHTML = "";


    if (
        !filteredProducts ||
        filteredProducts.length === 0
    ) {

        container.innerHTML = `

            <div class="no-products">

                <div class="no-products-icon">
                    🛍️
                </div>

                <h3>
                    No Products Found
                </h3>

                <p>
                    Try another search or category.
                </p>

            </div>

        `;

        return;

    }


    filteredProducts.forEach(
        (product) => {

            const card =
                createProductCard(
                    product
                );


            container.appendChild(
                card
            );

        }
    );

}


/* =========================================================
   17. CREATE PRODUCT CARD
========================================================= */

function createProductCard(product) {

    const card =
        document.createElement(
            "article"
        );


    card.className =
        "product-card";


    const image =
        getProductImage(product);


    const name =
        getProductName(product);


    const category =
        getProductCategory(product);


    const price =
        getSellingPrice(product);


    const mrp =
        getMRP(product);


    const sku =
        getSKU(product);


    const discount =
        calculateDiscount(product);


    const stock =
        getStock(product);


    const isWishlisted =
        wishlist.some(
            item =>
                item.id ===
                product.id
        );


    card.innerHTML = `

        <div class="product-image">

            <button
                class="wishlist-btn
                ${isWishlisted ? "active" : ""}"
                onclick="
                    toggleWishlist('${product.id}')
                "
                aria-label="Wishlist"
            >

                <i class="${
                    isWishlisted
                        ? "fa-solid"
                        : "fa-regular"
                } fa-heart"></i>

            </button>


            ${
                discount > 0

                ? `

                    <span class="discount-badge">
                        ${discount}% OFF
                    </span>

                  `

                : ""

            }


            <img
                src="${image}"
                alt="${name}"
                loading="lazy"
                onerror="
                    this.onerror=null;
                    this.src='logo_image/logo.png';
                "
            />

        </div>


        <div class="product-info">


            <span class="product-category">

                ${
                    category ||
                    "Home Essentials"
                }

            </span>


            <h3 class="product-name">
                ${name}
            </h3>


            ${
                sku

                ? `

                    <div class="product-sku">

                        SKU:
                        <strong>
                            ${sku}
                        </strong>

                    </div>

                  `

                : ""

            }


            <div class="product-price">


                <strong>
                    ₹${price}
                </strong>


                ${
                    mrp > price

                    ? `

                        <del>
                            ₹${mrp}
                        </del>

                      `

                    : ""

                }


            </div>


            ${
                discount > 0

                ? `

                    <span class="discount-text">
                        Save ${discount}%
                    </span>

                  `

                : ""

            }


            <div class="product-stock">


                ${
                    stock > 0

                    ? `

                        <span class="in-stock">

                            <i class="fa-solid fa-circle-check"></i>

                            In Stock

                        </span>

                      `

                    : `

                        <span class="out-of-stock">

                            Out of Stock

                        </span>

                      `

                }


            </div>


            <div class="product-actions">


                <button
                    class="add-cart-btn"
                    onclick="
                        addToCart('${product.id}')
                    "
                    ${
                        stock <= 0
                            ? "disabled"
                            : ""
                    }
                >

                    <i class="fa-solid fa-cart-shopping"></i>

                    Add To Cart

                </button>


                <button
                    class="buy-now-btn"
                    onclick="
                        buyNow('${product.id}')
                    "
                    ${
                        stock <= 0
                            ? "disabled"
                            : ""
                    }
                >

                    Buy Now

                </button>


            </div>


        </div>

    `;


    card.addEventListener(
        "click",
        (event) => {

            if (
                event.target.closest(
                    "button"
                )
            ) {

                return;

            }


            openProduct(
                product.id
            );

        }
    );


    return card;

}


/* =========================================================
   18. OPEN PRODUCT PAGE
========================================================= */

function openProduct(id) {

    if (!id) {
        return;
    }


    window.location.href =

        `product.html?id=${
            encodeURIComponent(id)
        }`;

}


/* =========================================================
   19. ADD TO CART
========================================================= */

function addToCart(
    id,
    quantity = 1
) {

    const product =
        allProducts.find(
            item =>
                item.id === id
        );


    if (!product) {

        console.error(
            "Product not found:",
            id
        );

        return;

    }


    const stock =
        getStock(product);


    if (
        stock > 0 &&
        quantity > stock
    ) {

        showToast(
            "Maximum available stock reached."
        );

        return;

    }


    const existing =
        cart.find(
            item =>
                item.id === id
        );


    if (existing) {

        existing.quantity +=
            Number(quantity);

    }

    else {

        cart.push({

            id:
                product.id,

            name:
                getProductName(
                    product
                ),

            price:
                getSellingPrice(
                    product
                ),

            mrp:
                getMRP(
                    product
                ),

            image:
                getProductImage(
                    product
                ),

            sku:
                getSKU(
                    product
                ),

            quantity:
                Number(quantity)

        });

    }


    saveCart();

    updateCartCount();


    showToast(
        "Product added to cart ❤️"
    );

}


/* =========================================================
   20. SAVE CART
========================================================= */

function saveCart() {

    localStorage.setItem(
        "garima_cart",
        JSON.stringify(cart)
    );

}


/* =========================================================
   21. CART COUNT
========================================================= */

function updateCartCount() {

    const count =
        cart.reduce(
            (
                total,
                item
            ) => {

                return (

                    total +

                    Number(
                        item.quantity ||
                        0
                    )

                );

            },
            0
        );


    document
        .querySelectorAll(
            ".cart-count, #cartCount"
        )
        .forEach(
            element => {

                element.textContent =
                    count;

            }
        );

}


/* =========================================================
   22. WISHLIST COUNT
========================================================= */

function updateWishlistCount() {

    const count =
        wishlist.length;


    document
        .querySelectorAll(
            ".wishlist-count, #wishlistCount"
        )
        .forEach(
            element => {

                element.textContent =
                    count;

            }
        );

}


/* =========================================================
   23. WISHLIST
========================================================= */

function toggleWishlist(id) {

    const product =
        allProducts.find(
            item =>
                item.id === id
        );


    if (!product) {
        return;
    }


    const existingIndex =
        wishlist.findIndex(
            item =>
                item.id === id
        );


    if (
        existingIndex !== -1
    ) {

        wishlist.splice(
            existingIndex,
            1
        );


        showToast(
            "Removed from wishlist"
        );

    }

    else {

        wishlist.push({

            id:
                product.id,

            name:
                getProductName(
                    product
                ),

            price:
                getSellingPrice(
                    product
                ),

            image:
                getProductImage(
                    product
                ),

            sku:
                getSKU(
                    product
                )

        });


        showToast(
            "Added to wishlist ❤️"
        );

    }


    localStorage.setItem(
        "garima_wishlist",
        JSON.stringify(wishlist)
    );


    updateWishlistCount();


    renderProducts();

}


/* =========================================================
   24. BUY NOW
========================================================= */

function buyNow(id) {

    addToCart(
        id,
        1
    );


    setTimeout(
        () => {

            window.location.href =
                "cart.html";

        },
        300
    );

}


/* =========================================================
   25. HEADER BUTTONS
========================================================= */

function setupHeaderButtons() {


    /* CART */

    const cartButtons =
        document.querySelectorAll(
            "#cartButton, .cart-button, .cart-icon"
        );


    cartButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    window.location.href =
                        "cart.html";

                }
            );

        }
    );


    /* WISHLIST */

    const wishlistButtons =
        document.querySelectorAll(
            "#wishlistButton, .wishlist-button, .wishlist-icon"
        );


    wishlistButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    window.location.href =
                        "wishlist.html";

                }
            );

        }
    );


    /* ALL PRODUCTS */

    const allProductsButtons =
        document.querySelectorAll(
            "#allProductsButton, .all-products-button"
        );


    allProductsButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    currentCategory =
                        "All Products";


                    currentSearch =
                        "";


                    const searchInput =
                        document.querySelector(
                            "#searchInput"
                        );


                    if (searchInput) {

                        searchInput.value =
                            "";

                    }


                    applyFilters();

                }
            );

        }
    );

}


/* =========================================================
   26. BACK TO TOP
========================================================= */

function setupBackToTop() {

    const backToTop =
        document.querySelector(
            "#backToTop, .back-to-top"
        );


    if (!backToTop) {

        return;

    }


    backToTop.style.opacity =
        "0";


    backToTop.style.pointerEvents =
        "none";


    window.addEventListener(
        "scroll",
        () => {

            if (
                window.scrollY >
                400
            ) {

                backToTop.style.opacity =
                    "1";

                backToTop.style.pointerEvents =
                    "auto";

            }

            else {

                backToTop.style.opacity =
                    "0";

                backToTop.style.pointerEvents =
                    "none";

            }

        }
    );


    backToTop.addEventListener(
        "click",
        () => {

            window.scrollTo({

                top: 0,

                behavior: "smooth"

            });

        }
    );

}


/* =========================================================
   27. TOAST MESSAGE
========================================================= */

function showToast(message) {

    let toast =
        document.querySelector(
            "#garimaToast"
        );


    if (!toast) {

        toast =
            document.createElement(
                "div"
            );


        toast.id =
            "garimaToast";


        toast.className =
            "garima-toast";


        document.body.appendChild(
            toast
        );

    }


    toast.textContent =
        message;


    toast.classList.add(
        "show"
    );


    clearTimeout(
        window.garimaToastTimer
    );


    window.garimaToastTimer =
        setTimeout(
            () => {

                toast.classList.remove(
                    "show"
                );

            },
            2200
        );

}


/* =========================================================
   28. GLOBAL FUNCTIONS
========================================================= */

window.addToCart =
    addToCart;

window.buyNow =
    buyNow;

window.toggleWishlist =
    toggleWishlist;

window.openProduct =
    openProduct;

window.setCategory =
    setCategory;

window.loadProducts =
    loadProducts;


/* =========================================================
   PART 1 COMPLETE
========================================================= */
/* =========================================================
   GARIMA'S HOUSE HOLD — SCRIPT.JS
   PART 2 — PRODUCT RENDERING + SEARCH + CATEGORY
   ========================================================= */



/* =========================================================
   3. GET ALL PRODUCTS
   ========================================================= */

function getAllProducts() {

    if (typeof allProducts !== "undefined") {
        return allProducts || [];
    }

    if (typeof products !== "undefined") {
        return products || [];
    }

    if (window.allProducts) {
        return window.allProducts;
    }

    return [];
}


/* =========================================================
   4. SEARCH PRODUCTS
   ========================================================= */

function searchProducts(searchText) {

    const text = String(searchText || "")
        .trim()
        .toLowerCase();

    const all = getAllProducts();

    if (!text) {
        renderProducts(all);
        return;
    }

    const filtered = all.filter(product => {

        const name = String(
            product.name ||
            product.title ||
            ""
        ).toLowerCase();

        const category = String(
            product.category ||
            product.categoryName ||
            ""
        ).toLowerCase();

        const sku = String(
            product.sku ||
            product.SKU ||
            ""
        ).toLowerCase();

        const description = String(
            product.description ||
            ""
        ).toLowerCase();

        return (
            name.includes(text) ||
            category.includes(text) ||
            sku.includes(text) ||
            description.includes(text)
        );
    });

    renderProducts(filtered);
}



/* =========================================================
   6. SEARCH BUTTON
   ========================================================= */

function handleSearch() {

    const input =
        document.getElementById("searchInput") ||
        document.querySelector(".search-input");

    if (!input) return;

    searchProducts(input.value);
}


/* =========================================================
   7. CATEGORY FILTER
   ========================================================= */

function filterByCategory(category) {

    const all = getAllProducts();

    if (!category || category === "all") {
        renderProducts(all);
        return;
    }

    const selectedCategory =
        String(category).trim().toLowerCase();

    const filtered = all.filter(product => {

        const productCategory = String(
            product.category ||
            product.categoryName ||
            ""
        ).trim().toLowerCase();

        return (
            productCategory === selectedCategory ||
            productCategory.includes(selectedCategory)
        );
    });

    renderProducts(filtered);
}


/* =========================================================
   8. CATEGORY BUTTONS
   ========================================================= */

function setupCategoryButtons() {

    const buttons = document.querySelectorAll(
        "[data-category]"
    );

    buttons.forEach(button => {

        button.addEventListener("click", function () {

            const category =
                this.getAttribute("data-category");

            filterByCategory(category);

            buttons.forEach(btn => {
                btn.classList.remove("active");
            });

            this.classList.add("active");

        });

    });
}


/* =========================================================
   9. PRODUCT DETAILS
   ========================================================= */

function getProductById(productId) {

    const all = getAllProducts();

    return all.find(product =>
        String(product.id || product.sku) ===
        String(productId)
    );
}
/* =========================================================
   GARIMA'S HOUSE HOLD — SCRIPT.JS
   PART 3 — COUPON + SHIPPING + ORDER TOTALS
   ========================================================= */


/* =========================================================
   30. COUPON SYSTEM
   ========================================================= */

const GARIMA_COUPONS = {

    GARIMA10: {
        type: "percent",
        value: 10,
        minOrder: 499
    },

    WELCOME15: {
        type: "percent",
        value: 15,
        minOrder: 999
    },

    SAVE100: {
        type: "flat",
        value: 100,
        minOrder: 1499
    }

};


/* =========================================================
   31. COUPON STORAGE
   ========================================================= */

function getAppliedCoupon() {

    try {

        return JSON.parse(
            localStorage.getItem("garima_coupon")
        ) || null;

    } catch (error) {

        return null;

    }

}


function saveAppliedCoupon(coupon) {

    localStorage.setItem(
        "garima_coupon",
        JSON.stringify(coupon)
    );

}


function removeAppliedCoupon() {

    localStorage.removeItem(
        "garima_coupon"
    );

}


/* =========================================================
   32. CART SUBTOTAL
   ========================================================= */

function getCartSubtotal() {

    if (!Array.isArray(cart)) {
        return 0;
    }

    return cart.reduce(
        (total, item) => {

            const price =
                Number(
                    item.price ||
                    item.sellingPrice ||
                    0
                );

            const quantity =
                Number(
                    item.quantity || 1
                );

            return total +
                (price * quantity);

        },
        0
    );

}


/* =========================================================
   33. COUPON DISCOUNT
   ========================================================= */

function calculateCouponDiscount() {

    const coupon =
        getAppliedCoupon();

    const subtotal =
        getCartSubtotal();

    if (!coupon || !subtotal) {
        return 0;
    }

    const couponData =
        GARIMA_COUPONS[
            String(
                coupon.code || ""
            ).toUpperCase()
        ];

    if (!couponData) {
        return 0;
    }

    if (
        subtotal <
        Number(
            couponData.minOrder || 0
        )
    ) {

        return 0;

    }

    if (
        couponData.type ===
        "percent"
    ) {

        return Math.round(
            subtotal *
            (
                couponData.value /
                100
            )
        );

    }

    if (
        couponData.type ===
        "flat"
    ) {

        return Math.min(
            couponData.value,
            subtotal
        );

    }

    return 0;

}


/* =========================================================
   34. APPLY COUPON
   ========================================================= */

function applyCoupon(code) {

    const couponCode =
        String(code || "")
            .trim()
            .toUpperCase();

    if (!couponCode) {

        return {
            success: false,
            message:
                "Please enter a coupon code."
        };

    }

    const coupon =
        GARIMA_COUPONS[couponCode];

    if (!coupon) {

        return {
            success: false,
            message:
                "Invalid coupon code."
        };

    }

    const subtotal =
        getCartSubtotal();

    if (
        subtotal <
        Number(
            coupon.minOrder || 0
        )
    ) {

        return {
            success: false,
            message:
                `Minimum order value is ₹${coupon.minOrder}.`
        };

    }

    saveAppliedCoupon({
        code: couponCode
    });

    const discount =
        calculateCouponDiscount();

    return {
        success: true,
        code: couponCode,
        discount: discount,
        message:
            `Coupon ${couponCode} applied successfully.`
    };

}


/* =========================================================
   35. REMOVE COUPON
   ========================================================= */

function removeCoupon() {

    removeAppliedCoupon();

    return {
        success: true,
        message:
            "Coupon removed."
    };

}


/* =========================================================
   36. SHIPPING CHARGE
   ========================================================= */

function calculateShippingCharge() {

    const subtotal =
        getCartSubtotal();

    /*
       Free delivery above ₹999
       Below ₹999 → ₹79 courier charge
    */

    if (subtotal <= 0) {
        return 0;
    }

    if (subtotal >= 999) {
        return 0;
    }

    return 79;

}


/* =========================================================
   37. COMPLETE CART TOTAL
   ========================================================= */

function getCartTotals() {

    const subtotal =
        getCartSubtotal();

    const couponDiscount =
        calculateCouponDiscount();

    const shipping =
        calculateShippingCharge();

    const total =
        Math.max(
            0,
            subtotal -
            couponDiscount +
            shipping
        );

    return {

        subtotal:
            Math.round(
                subtotal
            ),

        couponDiscount:
            Math.round(
                couponDiscount
            ),

        shipping:
            Math.round(
                shipping
            ),

        total:
            Math.round(
                total
            )

    };

}


/* =========================================================
   38. FORMAT RUPEES
   ========================================================= */

function formatGarimaPrice(amount) {

    return (
        "₹" +
        Number(
            amount || 0
        ).toLocaleString(
            "en-IN"
        )
    );

}


/* =========================================================
   39. CHECK COUPON BEFORE CHECKOUT
   ========================================================= */

function validateAppliedCoupon() {

    const coupon =
        getAppliedCoupon();

    if (!coupon) {
        return true;
    }

    const couponData =
        GARIMA_COUPONS[
            String(
                coupon.code || ""
            ).toUpperCase()
        ];

    if (!couponData) {

        removeAppliedCoupon();

        return false;

    }

    const subtotal =
        getCartSubtotal();

    if (
        subtotal <
        Number(
            couponData.minOrder || 0
        )
    ) {

        removeAppliedCoupon();

        return false;

    }

    return true;

}


/* =========================================================
   40. GLOBAL COUPON FUNCTIONS
   ========================================================= */

window.applyCoupon =
    applyCoupon;

window.removeCoupon =
    removeCoupon;

window.getCartTotals =
    getCartTotals;

window.getCartSubtotal =
    getCartSubtotal;

window.calculateShippingCharge =
    calculateShippingCharge;

window.calculateCouponDiscount =
    calculateCouponDiscount;

window.formatGarimaPrice =
    formatGarimaPrice;


/* =========================================================
   41. INITIALIZE COUPON CHECK
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        validateAppliedCoupon();

        console.log(
            "Garima's House Hold — Script Part 3 loaded."
        );

    }
);
/* =========================================================
   GARIMA'S HOUSE HOLD — SCRIPT.JS
   PART 4 — CART TOTAL UI + COUPON UI
   ========================================================= */


/* =========================================================
   42. UPDATE CART TOTALS ON PAGE
   ========================================================= */

function updateCartTotalsUI() {

    const totals =
        getCartTotals();

    /* SUBTOTAL */

    document
        .querySelectorAll(
            "#cartSubtotal, .cart-subtotal"
        )
        .forEach(element => {

            element.textContent =
                formatGarimaPrice(
                    totals.subtotal
                );

        });


    /* COUPON DISCOUNT */

    document
        .querySelectorAll(
            "#couponDiscount, .coupon-discount"
        )
        .forEach(element => {

            element.textContent =
                "- " +
                formatGarimaPrice(
                    totals.couponDiscount
                );

        });


    /* SHIPPING */

    document
        .querySelectorAll(
            "#shippingCharge, .shipping-charge"
        )
        .forEach(element => {

            element.textContent =
                totals.shipping === 0
                    ? "FREE"
                    : formatGarimaPrice(
                        totals.shipping
                    );

        });


    /* FINAL TOTAL */

    document
        .querySelectorAll(
            "#cartTotal, .cart-total, #grandTotal"
        )
        .forEach(element => {

            element.textContent =
                formatGarimaPrice(
                    totals.total
                );

        });

}


/* =========================================================
   43. UPDATE COUPON DISPLAY
   ========================================================= */

function updateCouponUI() {

    const coupon =
        getAppliedCoupon();

    const couponInput =
        document.querySelector(
            "#couponInput"
        );

    const couponCode =
        document.querySelector(
            "#appliedCoupon"
        );

    const couponMessage =
        document.querySelector(
            "#couponMessage"
        );


    if (coupon) {

        if (couponInput) {

            couponInput.value =
                coupon.code || "";

        }

        if (couponCode) {

            couponCode.textContent =
                coupon.code || "";

            couponCode.style.display =
                "inline-block";

        }

        if (couponMessage) {

            couponMessage.textContent =
                "Coupon applied successfully ❤️";

            couponMessage.classList.add(
                "success"
            );

        }

    }
    else {

        if (couponCode) {

            couponCode.textContent =
                "";

            couponCode.style.display =
                "none";

        }

        if (couponMessage) {

            couponMessage.textContent =
                "";

            couponMessage.classList.remove(
                "success"
            );

        }

    }

}


/* =========================================================
   44. COUPON BUTTON
   ========================================================= */

function setupCouponButton() {

    const applyButton =
        document.querySelector(
            "#applyCoupon"
        );

    const removeButton =
        document.querySelector(
            "#removeCoupon"
        );

    const couponInput =
        document.querySelector(
            "#couponInput"
        );

    const couponMessage =
        document.querySelector(
            "#couponMessage"
        );


    /* APPLY */

    if (applyButton) {

        applyButton.addEventListener(
            "click",
            function () {

                const code =
                    couponInput
                        ? couponInput.value
                        : "";

                const result =
                    applyCoupon(code);


                if (couponMessage) {

                    couponMessage.textContent =
                        result.message;

                    couponMessage.classList.toggle(
                        "success",
                        result.success
                    );

                }


                if (result.success) {

                    showToast(
                        result.message
                    );

                    updateCouponUI();

                    updateCartTotalsUI();

                }
                else {

                    showToast(
                        result.message
                    );

                }

            }
        );

    }


    /* REMOVE */

    if (removeButton) {

        removeButton.addEventListener(
            "click",
            function () {

                removeCoupon();

                if (couponInput) {

                    couponInput.value =
                        "";

                }

                updateCouponUI();

                updateCartTotalsUI();

                showToast(
                    "Coupon removed."
                );

            }
        );

    }

}


/* =========================================================
   45. REFRESH CART TOTALS
   ========================================================= */

function refreshGarimaCart() {

    validateAppliedCoupon();

    updateCouponUI();

    updateCartTotalsUI();

    updateCartCount();

}


/* =========================================================
   46. FREE DELIVERY MESSAGE
   ========================================================= */

function updateShippingMessage() {

    const message =
        document.querySelector(
            "#shippingMessage"
        );

    if (!message) {
        return;
    }


    const subtotal =
        getCartSubtotal();


    if (subtotal <= 0) {

        message.textContent =
            "Add products to your cart.";

        return;

    }


    if (subtotal >= 999) {

        message.textContent =
            "🎉 Congratulations! You get FREE delivery.";

        return;

    }


    const remaining =
        999 - subtotal;


    message.textContent =
        `Add ${formatGarimaPrice(
            remaining
        )} more for FREE delivery.`;

}


/* =========================================================
   47. CART PAGE INITIALIZATION
   ========================================================= */

function initializeGarimaCart() {

    refreshGarimaCart();

    updateShippingMessage();

    setupCouponButton();

}


/* =========================================================
   48. LISTEN FOR CART CHANGES
   ========================================================= */

window.addEventListener(
    "storage",
    function (event) {

        if (
            event.key ===
            "garima_cart"
        ) {

            try {

                cart =
                    JSON.parse(
                        event.newValue
                    ) || [];

            }
            catch (error) {

                cart = [];

            }

            refreshGarimaCart();

            updateShippingMessage();

        }


        if (
            event.key ===
            "garima_coupon"
        ) {

            refreshGarimaCart();

        }

    }
);


/* =========================================================
   49. GLOBAL CART REFRESH
   ========================================================= */

window.refreshGarimaCart =
    refreshGarimaCart;

window.updateCartTotalsUI =
    updateCartTotalsUI;

window.updateCouponUI =
    updateCouponUI;

window.updateShippingMessage =
    updateShippingMessage;


/* =========================================================
   50. PART 4 INITIALIZE
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        initializeGarimaCart();

        console.log(
            "Garima's House Hold — Script Part 4 loaded."
        );

    }
);