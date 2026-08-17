/* =========================================================
   GARIMA'S HOUSE HOLD
   FINAL SCRIPT.JS
   PART 1 — FIREBASE + GLOBAL VARIABLES
========================================================= */

import { db } from "./firebase.js";

import {
    collection,
    getDocs,
    query,
    where,
    orderBy,
    limit
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";


/* =========================================================
   GLOBAL VARIABLES
========================================================= */

let allProducts = [];

let featuredProducts = [];

let bestSellerProducts = [];

let newArrivalProducts = [];

let currentCategory = "all";

let searchTerm = "";


/* =========================================================
   DOM HELPERS
========================================================= */

function getElement(id) {
    return document.getElementById(id);
}


function getProductsContainer() {

    return (
        getElement("productsGrid") ||

        getElement("productGrid") ||

        document.querySelector(".products-grid") ||

        document.querySelector(".product-grid")
    );
}


/* =========================================================
   SAFE TEXT
========================================================= */

function safeText(value) {

    if (value === null || value === undefined) {
        return "";
    }

    return String(value);
}


/* =========================================================
   PRICE FORMAT
========================================================= */

function formatPrice(value) {

    const price = Number(value);

    if (Number.isNaN(price)) {
        return "₹0";
    }

    return `₹${price.toLocaleString("en-IN")}`;
}


/* =========================================================
   PRODUCT ID
========================================================= */

function getProductId(product) {

    return (
        product.id ||

        product.productId ||

        product.uid ||

        ""
    );
}


/* =========================================================
   PRODUCT CATEGORY
========================================================= */

function getProductCategory(product) {

    return (
        product.category ||

        product.Category ||

        product.productCategory ||

        ""
    );
}


/* =========================================================
   PRODUCT IMAGE
========================================================= */

function getProductImage(product) {

    return (
        product.image ||

        product.imageUrl ||

        product.imageURL ||

        product.photo ||

        product.productImage ||

        "images/no-image.png"
    );
}


/* =========================================================
   PRODUCT NAME
========================================================= */

function getProductName(product) {

    return (
        product.name ||

        product.productName ||

        product.title ||

        "Product"
    );
}


/* =========================================================
   PRODUCT PRICE
========================================================= */

function getProductPrice(product) {

    return Number(
        product.price ||

        product.salePrice ||

        product.sellingPrice ||

        0
    );
}


/* =========================================================
   ORIGINAL PRICE
========================================================= */

function getOriginalPrice(product) {

    return Number(
        product.originalPrice ||

        product.mrp ||

        product.oldPrice ||

        0
    );
}


/* =========================================================
   STOCK
========================================================= */

function isProductInStock(product) {

    if (
        product.inStock === false ||
        product.stock === 0 ||
        product.stockStatus === "out"
    ) {
        return false;
    }

    return true;
}


/* =========================================================
   DISCOUNT CALCULATION
========================================================= */

function calculateDiscount(product) {

    const original = getOriginalPrice(product);

    const price = getProductPrice(product);

    if (
        !original ||
        !price ||
        original <= price
    ) {
        return 0;
    }

    return Math.round(
        ((original - price) / original) * 100
    );
}
/* =========================================================
   PART 2 — FIREBASE PRODUCTS LOAD
========================================================= */


/* =========================================================
   LOAD ALL PRODUCTS
========================================================= */

async function loadProducts() {

    try {

        const snapshot =
            await getDocs(
                collection(db, "products")
            );


        allProducts = [];


        snapshot.forEach((doc) => {

            const data = doc.data();


            allProducts.push({

                id: doc.id,

                ...data

            });

        });


        console.log(
            "Products loaded:",
            allProducts.length
        );


        /* ---------------------------------------------
           CREATE PRODUCT LISTS
        --------------------------------------------- */

        featuredProducts =
            allProducts.filter(
                product =>
                    product.featured === true ||
                    product.isFeatured === true
            );


        bestSellerProducts =
            allProducts.filter(
                product =>
                    product.bestSeller === true ||
                    product.isBestSeller === true
            );


        newArrivalProducts =
            allProducts.filter(
                product =>
                    product.newArrival === true ||
                    product.isNewArrival === true
            );


        /* ---------------------------------------------
           FALLBACK
           If Firebase flags are not present
        --------------------------------------------- */

        if (
            featuredProducts.length === 0
        ) {

            featuredProducts =
                allProducts.slice(0, 8);

        }


        if (
            bestSellerProducts.length === 0
        ) {

            bestSellerProducts =
                allProducts.slice(0, 8);

        }


        if (
            newArrivalProducts.length === 0
        ) {

            newArrivalProducts =
                allProducts.slice(0, 8);

        }


        /* ---------------------------------------------
           INITIAL RENDER
        --------------------------------------------- */

        renderProducts(
            featuredProducts,
            "productsGrid"
        );


        renderProducts(
            bestSellerProducts,
            "bestSellerProducts"
        );


        renderProducts(
            newArrivalProducts,
            "newArrivalProducts"
        );


        /* ---------------------------------------------
           UPDATE CATEGORY PRODUCTS
        --------------------------------------------- */

        if (
            document.getElementById(
                "categoryProducts"
            )
        ) {

            renderProducts(
                allProducts,
                "categoryProducts"
            );

        }


    } catch (error) {

        console.error(
            "Error loading products:",
            error
        );


        showProductError(
            "productsGrid"
        );


        showProductError(
            "bestSellerProducts"
        );


        showProductError(
            "newArrivalProducts"
        );

    }

}


/* =========================================================
   RENDER PRODUCTS
========================================================= */

function renderProducts(
    products,
    containerId = "productsGrid"
) {

    const container =
        document.getElementById(
            containerId
        );


    if (!container) {

        console.warn(
            "Product container not found:",
            containerId
        );

        return;

    }


    container.innerHTML = "";


    /* ---------------------------------------------
       NO PRODUCTS
    --------------------------------------------- */

    if (
        !products ||
        products.length === 0
    ) {

        container.innerHTML = `

            <div class="no-products">

                <i class="fa-solid fa-box-open"></i>

                <h3>
                    No Products Found
                </h3>

                <p>
                    Please try another category.
                </p>

            </div>

        `;

        return;

    }


    /* ---------------------------------------------
       CREATE PRODUCT CARDS
    --------------------------------------------- */

    products.forEach(
        product => {

            container.appendChild(
                createProductCard(product)
            );

        }
    );

}


/* =========================================================
   PRODUCT ERROR
========================================================= */

function showProductError(
    containerId
) {

    const container =
        document.getElementById(
            containerId
        );


    if (!container) {
        return;
    }


    container.innerHTML = `

        <div class="no-products">

            <i class="fa-solid fa-triangle-exclamation"></i>

            <h3>
                Products Could Not Load
            </h3>

            <p>
                Please refresh the page and try again.
            </p>

        </div>

    `;

}


/* =========================================================
   FILTER PRODUCTS
========================================================= */

function filterProducts() {

    let filtered =
        [...allProducts];


    /* ---------------------------------------------
       CATEGORY FILTER
    --------------------------------------------- */

    if (
        currentCategory &&
        currentCategory !== "all"
    ) {

        filtered =
            filtered.filter(
                product => {

                    const category =
                        getProductCategory(
                            product
                        )
                        .toLowerCase()
                        .trim();


                    return (
                        category ===
                        currentCategory
                            .toLowerCase()
                            .trim()
                    );

                }
            );

    }


    /* ---------------------------------------------
       SEARCH FILTER
    --------------------------------------------- */

    if (
        searchTerm
    ) {

        const search =
            searchTerm
                .toLowerCase()
                .trim();


        filtered =
            filtered.filter(
                product => {

                    const name =
                        getProductName(
                            product
                        )
                        .toLowerCase();


                    const category =
                        getProductCategory(
                            product
                        )
                        .toLowerCase();


                    return (
                        name.includes(search) ||
                        category.includes(search)
                    );

                }
            );

    }


    renderProducts(
        filtered,
        "productsGrid"
    );

}


/* =========================================================
   CATEGORY CHANGE
========================================================= */

function setCategory(
    category
) {

    currentCategory =
        category || "all";


    filterProducts();


    /* ---------------------------------------------
       ACTIVE BUTTON
    --------------------------------------------- */

    document
        .querySelectorAll(
            ".filter-btn"
        )
        .forEach(
            button => {

                const buttonCategory =
                    button.dataset.category ||
                    button.getAttribute(
                        "data-category"
                    );


                button.classList.toggle(
                    "active",

                    (
                        buttonCategory || "all"
                    )
                    .toLowerCase()
                    ===
                    currentCategory
                        .toLowerCase()
                );

            }
        );

}


/* =========================================================
   SEARCH
========================================================= */

function performSearch(
    value
) {

    searchTerm =
        value || "";


    filterProducts();

}
/* =========================================================
   PART 3 — CREATE PRODUCT CARD
========================================================= */


/* =========================================================
   CREATE PRODUCT CARD
========================================================= */

function createProductCard(product) {

    const productId =
        getProductId(product);

    const productName =
        getProductName(product);

    const productImage =
        getProductImage(product);

    const category =
        getProductCategory(product);

    const price =
        getProductPrice(product);

    const originalPrice =
        getOriginalPrice(product);

    const discount =
        calculateDiscount(product);

    const inStock =
        isProductInStock(product);


    /* ---------------------------------------------
       PRODUCT CARD
    --------------------------------------------- */

    const card =
        document.createElement("article");

    card.className =
        "product-card";


    card.dataset.productId =
        productId;


    /* ---------------------------------------------
       IMAGE AREA
    --------------------------------------------- */

    const imageWrapper =
        document.createElement("div");

    imageWrapper.className =
        "product-image";


    /* ---------------------------------------------
       DISCOUNT BADGE
    --------------------------------------------- */

    if (discount > 0) {

        const badge =
            document.createElement("span");

        badge.className =
            "discount-badge";

        badge.textContent =
            `${discount}% OFF`;

        imageWrapper.appendChild(
            badge
        );

    }


    /* ---------------------------------------------
       WISHLIST BUTTON
    --------------------------------------------- */

    const wishlistButton =
        document.createElement("button");

    wishlistButton.type =
        "button";

    wishlistButton.className =
        "wishlist-btn";

    wishlistButton.setAttribute(
        "aria-label",
        "Add to wishlist"
    );

    wishlistButton.innerHTML =
        `<i class="fa-regular fa-heart"></i>`;


    wishlistButton.addEventListener(
        "click",
        function(event) {

            event.preventDefault();

            event.stopPropagation();

            toggleWishlist(
                product
            );

        }
    );


    imageWrapper.appendChild(
        wishlistButton
    );


    /* ---------------------------------------------
       PRODUCT IMAGE
    --------------------------------------------- */

    const image =
        document.createElement("img");

    image.src =
        productImage;

    image.alt =
        productName;

    image.loading =
        "lazy";


    image.onerror =
        function() {

            this.onerror = null;

            this.src =
                "images/no-image.png";

        };


    imageWrapper.appendChild(
        image
    );


    card.appendChild(
        imageWrapper
    );


    /* ---------------------------------------------
       PRODUCT INFORMATION
    --------------------------------------------- */

    const info =
        document.createElement("div");

    info.className =
        "product-info";


    /* ---------------------------------------------
       CATEGORY
    --------------------------------------------- */

    if (category) {

        const categoryElement =
            document.createElement("div");

        categoryElement.className =
            "product-category";

        categoryElement.textContent =
            category;

        info.appendChild(
            categoryElement
        );

    }


    /* ---------------------------------------------
       PRODUCT NAME
    --------------------------------------------- */

    const name =
        document.createElement("h3");

    name.className =
        "product-name";

    name.textContent =
        productName;

    info.appendChild(
        name
    );


    /* ---------------------------------------------
       SKU
    --------------------------------------------- */

    if (product.sku) {

        const sku =
            document.createElement("div");

        sku.className =
            "product-sku";

        sku.textContent =
            `SKU: ${product.sku}`;

        info.appendChild(
            sku
        );

    }


    /* ---------------------------------------------
       PRICE
    --------------------------------------------- */

    const priceBox =
        document.createElement("div");

    priceBox.className =
        "product-price";


    const currentPrice =
        document.createElement("strong");

    currentPrice.className =
        "current-price";

    currentPrice.textContent =
        formatPrice(price);


    priceBox.appendChild(
        currentPrice
    );


    /* ---------------------------------------------
       ORIGINAL PRICE
    --------------------------------------------- */

    if (
        originalPrice > 0 &&
        originalPrice > price
    ) {

        const oldPrice =
            document.createElement("del");

        oldPrice.className =
            "original-price";

        oldPrice.textContent =
            formatPrice(
                originalPrice
            );


        priceBox.appendChild(
            oldPrice
        );

    }


    info.appendChild(
        priceBox
    );


    /* ---------------------------------------------
       DISCOUNT TEXT
    --------------------------------------------- */

    if (discount > 0) {

        const discountText =
            document.createElement("span");

        discountText.className =
            "discount-text";

        discountText.textContent =
            `You save ${formatPrice(
                Math.max(
                    originalPrice - price,
                    0
                )
            )}`;


        info.appendChild(
            discountText
        );

    }


    /* ---------------------------------------------
       STOCK STATUS
    --------------------------------------------- */

    const stock =
        document.createElement("div");

    stock.className =
        "product-stock";


    if (inStock) {

        stock.innerHTML = `
            <span class="in-stock">
                <i class="fa-solid fa-circle-check"></i>
                In Stock
            </span>
        `;

    } else {

        stock.classList.add(
            "out-of-stock"
        );

        stock.innerHTML = `
            <span>
                Out of Stock
            </span>
        `;

    }


    info.appendChild(
        stock
    );


    /* ---------------------------------------------
       ACTION BUTTONS
    --------------------------------------------- */

    const actions =
        document.createElement("div");

    actions.className =
        "product-actions";


    /* ---------------------------------------------
       ADD TO CART
    --------------------------------------------- */

    const addCartButton =
        document.createElement("button");

    addCartButton.type =
        "button";

    addCartButton.className =
        "add-cart-btn";

    addCartButton.innerHTML = `
        <i class="fa-solid fa-cart-plus"></i>
        Add to Cart
    `;


    addCartButton.disabled =
        !inStock;


    addCartButton.addEventListener(
        "click",
        function(event) {

            event.preventDefault();

            event.stopPropagation();

            if (!inStock) {
                return;
            }

            addToCart(
                product
            );

        }
    );


    actions.appendChild(
        addCartButton
    );


    /* ---------------------------------------------
       BUY NOW
    --------------------------------------------- */

    const buyButton =
        document.createElement("button");

    buyButton.type =
        "button";

    buyButton.className =
        "buy-now-btn";

    buyButton.innerHTML = `
        <i class="fa-solid fa-bolt"></i>
        Buy Now
    `;


    buyButton.disabled =
        !inStock;


    buyButton.addEventListener(
        "click",
        function(event) {

            event.preventDefault();

            event.stopPropagation();

            if (!inStock) {
                return;
            }

            buyNow(
                product
            );

        }
    );


    actions.appendChild(
        buyButton
    );


    info.appendChild(
        actions
    );


    card.appendChild(
        info
    );


    return card;
}
/* =========================================================
   PART 4 — CART + WISHLIST + BUY NOW
========================================================= */


/* =========================================================
   CART STORAGE
========================================================= */

function getCart() {

    try {

        const savedCart =
            localStorage.getItem("cart");

        if (!savedCart) {
            return [];
        }

        const cart =
            JSON.parse(savedCart);

        return Array.isArray(cart)
            ? cart
            : [];

    } catch (error) {

        console.error(
            "Cart read error:",
            error
        );

        return [];

    }

}


/* =========================================================
   SAVE CART
========================================================= */

function saveCart(cart) {

    try {

        localStorage.setItem(
            "cart",
            JSON.stringify(cart)
        );

    } catch (error) {

        console.error(
            "Cart save error:",
            error
        );

    }

}


/* =========================================================
   ADD TO CART
========================================================= */

function addToCart(product) {

    const cart =
        getCart();

    const productId =
        getProductId(product);


    const existingIndex =
        cart.findIndex(
            item =>
                getProductId(item) ===
                productId
        );


    if (existingIndex !== -1) {

        cart[existingIndex].quantity =
            Number(
                cart[existingIndex].quantity || 1
            ) + 1;

    } else {

        cart.push({

            id: productId,

            name:
                getProductName(product),

            image:
                getProductImage(product),

            price:
                getProductPrice(product),

            originalPrice:
                getOriginalPrice(product),

            category:
                getProductCategory(product),

            quantity: 1

        });

    }


    saveCart(cart);

    updateCartCount();

    showToast(
        `${getProductName(product)} added to cart`
    );

}


/* =========================================================
   REMOVE FROM CART
========================================================= */

function removeFromCart(
    productId
) {

    let cart =
        getCart();


    cart =
        cart.filter(
            item =>
                getProductId(item) !==
                productId
        );


    saveCart(cart);

    updateCartCount();

}


/* =========================================================
   UPDATE CART QUANTITY
========================================================= */

function updateCartQuantity(
    productId,
    quantity
) {

    const cart =
        getCart();


    const item =
        cart.find(
            product =>
                getProductId(product) ===
                productId
        );


    if (!item) {
        return;
    }


    quantity =
        Math.max(
            1,
            Number(quantity) || 1
        );


    item.quantity =
        quantity;


    saveCart(cart);

    updateCartCount();

}


/* =========================================================
   CART COUNT
========================================================= */

function updateCartCount() {

    const cart =
        getCart();


    const count =
        cart.reduce(
            (
                total,
                item
            ) => {

                return total +
                    Number(
                        item.quantity || 1
                    );

            },
            0
        );


    document
        .querySelectorAll(
            "#cartCount, .cart-count, .action-count"
        )
        .forEach(
            element => {

                element.textContent =
                    count;

                element.style.display =
                    count > 0
                        ? "flex"
                        : "none";

            }
        );

}


/* =========================================================
   BUY NOW
========================================================= */

function buyNow(product) {

    // Product ID se actual product find karo
    if (typeof product === "string") {

        const productId = product;

        const foundProduct =
            allProducts.find(
                item =>
                    item.id === productId
            );

        if (!foundProduct) {

            showToast(
                "Product not found. Please try again."
            );

            return;

        }

        product = foundProduct;

    }


    if (
        !isProductInStock(product)
    ) {

        showToast(
            "This product is out of stock."
        );

        return;

    }


    /* ---------------------------------------------
       Clear previous buy-now item
    --------------------------------------------- */

    const buyNowItem = {

        id:
            getProductId(product),

        name:
            getProductName(product),

        image:
            getProductImage(product),

        price:
            getProductPrice(product),

        originalPrice:
            getOriginalPrice(product),

        category:
            getProductCategory(product),

        quantity: 1

    };


    localStorage.setItem(
        "buyNowProduct",
        JSON.stringify(
            buyNowItem
        )
    );


    /* ---------------------------------------------
       Go to checkout
    --------------------------------------------- */

    window.location.href =
        "checkout.html";

}


/* =========================================================
   WISHLIST STORAGE
========================================================= */

function getWishlist() {

    try {

        const saved =
            localStorage.getItem(
                "wishlist"
            );


        if (!saved) {
            return [];
        }


        const wishlist =
            JSON.parse(saved);


        return Array.isArray(
            wishlist
        )
            ? wishlist
            : [];

    } catch (error) {

        console.error(
            "Wishlist read error:",
            error
        );

        return [];

    }

}


/* =========================================================
   SAVE WISHLIST
========================================================= */

function saveWishlist(
    wishlist
) {

    try {

        localStorage.setItem(
            "wishlist",
            JSON.stringify(
                wishlist
            )
        );

    } catch (error) {

        console.error(
            "Wishlist save error:",
            error
        );

    }

}


/* =========================================================
   TOGGLE WISHLIST
========================================================= */

function toggleWishlist(
    product
) {

    const wishlist =
        getWishlist();


    const productId =
        getProductId(product);


    const existingIndex =
        wishlist.findIndex(
            item =>
                getProductId(item) ===
                productId
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

    } else {

        wishlist.push({

            id:
                productId,

            name:
                getProductName(product),

            image:
                getProductImage(product),

            price:
                getProductPrice(product),

            originalPrice:
                getOriginalPrice(product),

            category:
                getProductCategory(product)

        });


        showToast(
            "Added to wishlist"
        );

    }


    saveWishlist(
        wishlist
    );


    updateWishlistButtons();

}


/* =========================================================
   UPDATE WISHLIST BUTTONS
========================================================= */

function updateWishlistButtons() {

    const wishlist =
        getWishlist();


    const ids =
        new Set(
            wishlist.map(
                item =>
                    getProductId(item)
            )
        );


    document
        .querySelectorAll(
            ".wishlist-btn"
        )
        .forEach(
            button => {

                const card =
                    button.closest(
                        ".product-card"
                    );


                if (!card) {
                    return;
                }


                const productId =
                    card.dataset.productId;


                const active =
                    ids.has(
                        productId
                    );


                button.classList.toggle(
                    "active",
                    active
                );


                button.innerHTML =
                    active

                    ? `<i class="fa-solid fa-heart"></i>`

                    : `<i class="fa-regular fa-heart"></i>`;

            }
        );

}


/* =========================================================
   TOAST MESSAGE
========================================================= */

function showToast(
    message
) {

    let toast =
        document.getElementById(
            "siteToast"
        );


    /* ---------------------------------------------
       CREATE TOAST IF NOT EXISTS
    --------------------------------------------- */

    if (!toast) {

        toast =
            document.createElement(
                "div"
            );


        toast.id =
            "siteToast";


        toast.style.position =
            "fixed";


        toast.style.left =
            "50%";


        toast.style.bottom =
            "30px";


        toast.style.transform =
            "translateX(-50%)";


        toast.style.zIndex =
            "9999";


        toast.style.padding =
            "13px 22px";


        toast.style.borderRadius =
            "999px";


        toast.style.background =
            "#7d2347";


        toast.style.color =
            "#fff";


        toast.style.fontSize =
            "14px";


        toast.style.fontWeight =
            "700";


        toast.style.boxShadow =
            "0 10px 30px rgba(0,0,0,.18)";


        toast.style.opacity =
            "0";


        toast.style.pointerEvents =
            "none";


        toast.style.transition =
            "opacity .25s ease";


        document.body.appendChild(
            toast
        );

    }


    toast.textContent =
        message;


    toast.style.opacity =
        "1";


    clearTimeout(
        toast._timer
    );


    toast._timer =
        setTimeout(
            () => {

                toast.style.opacity =
                    "0";

            },
            2200
        );

}


/* =========================================================
   INITIAL CART / WISHLIST STATE
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        updateCartCount();

        updateWishlistButtons();

    }
);
/* =========================================================
   PART 5 — SEARCH + FILTER + SLIDER + NAVIGATION
========================================================= */


/* =========================================================
   SEARCH INPUT
========================================================= */

function initializeSearch() {

    const searchInputs =
        document.querySelectorAll(
            "#searchInput, #searchProducts, .search-input"
        );


    searchInputs.forEach(
        input => {

            input.addEventListener(
                "input",
                function () {

                    performSearch(
                        this.value
                    );

                }
            );


            input.addEventListener(
                "keydown",
                function (event) {

                    if (
                        event.key === "Enter"
                    ) {

                        event.preventDefault();

                        performSearch(
                            this.value
                        );

                    }

                }
            );

        }
    );

}


/* =========================================================
   SEARCH BUTTON
========================================================= */

function initializeSearchButtons() {

    document
        .querySelectorAll(
            ".search-btn, #searchButton"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    function (event) {

                        event.preventDefault();


                        const input =
                            document.querySelector(
                                "#searchInput, #searchProducts, .search-input"
                            );


                        if (input) {

                            performSearch(
                                input.value
                            );

                        }

                    }
                );

            }
        );

}


/* =========================================================
   CATEGORY FILTER BUTTONS
========================================================= */

function initializeFilterButtons() {

    document
        .querySelectorAll(
            ".filter-btn"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    function (event) {

                        event.preventDefault();


                        const category =
                            this.dataset.category ||
                            this.getAttribute(
                                "data-category"
                            ) ||
                            "all";


                        setCategory(
                            category
                        );

                    }
                );

            }
        );

}


/* =========================================================
   CATEGORY LINKS
========================================================= */

function initializeCategoryLinks() {

    document
        .querySelectorAll(
            "[data-category]"
        )
        .forEach(
            element => {

                if (
                    element.classList.contains(
                        "filter-btn"
                    )
                ) {
                    return;
                }


                element.addEventListener(
                    "click",
                    function () {

                        const category =
                            this.dataset.category;


                        if (!category) {
                            return;
                        }


                        setCategory(
                            category
                        );


                        const productsSection =
                            document.querySelector(
                                "#productsGrid"
                            );


                        if (
                            productsSection
                        ) {

                            productsSection.scrollIntoView({
                                behavior:
                                    "smooth",

                                block:
                                    "start"
                            });

                        }

                    }
                );

            }
        );

}


/* =========================================================
   HERO SLIDER
========================================================= */

let currentSlide =
    0;

let sliderTimer =
    null;


function initializeHeroSlider() {

    const slides =
        document.querySelectorAll(
            ".hero-slide"
        );


    const dots =
        document.querySelectorAll(
            ".hero-dot"
        );


    if (
        slides.length === 0
    ) {
        return;
    }


    function showSlide(
        index
    ) {

        currentSlide =
            (
                index +
                slides.length
            )
            %
            slides.length;


        slides.forEach(
            (
                slide,
                i
            ) => {

                slide.classList.toggle(
                    "active",
                    i === currentSlide
                );

            }
        );


        dots.forEach(
            (
                dot,
                i
            ) => {

                dot.classList.toggle(
                    "active",
                    i === currentSlide
                );

            }
        );

    }


    window.changeHeroSlide =
        function (direction) {

            showSlide(
                currentSlide +
                direction
            );


            restartSlider();

        };


    window.goToHeroSlide =
        function (index) {

            showSlide(
                index
            );


            restartSlider();

        };


    function startSlider() {

        if (
            slides.length <= 1
        ) {
            return;
        }


        sliderTimer =
            setInterval(
                () => {

                    showSlide(
                        currentSlide + 1
                    );

                },
                5000
            );

    }


    function restartSlider() {

        clearInterval(
            sliderTimer
        );


        startSlider();

    }


    dots.forEach(
        (
            dot,
            index
        ) => {

            dot.addEventListener(
                "click",
                () => {

                    showSlide(
                        index
                    );


                    restartSlider();

                }
            );

        }
    );


    showSlide(0);

    startSlider();

}


/* =========================================================
   MOBILE MENU
========================================================= */

function initializeMobileMenu() {

    const menuButton =
        document.querySelector(
            ".mobile-menu-btn"
        );


    const navigation =
        document.querySelector(
            ".main-navigation"
        );


    if (
        !menuButton ||
        !navigation
    ) {
        return;
    }


    menuButton.addEventListener(
        "click",
        function () {

            navigation.classList.toggle(
                "open"
            );


            const isOpen =
                navigation.classList.contains(
                    "open"
                );


            this.setAttribute(
                "aria-expanded",
                isOpen
            );

        }
    );


    navigation
        .querySelectorAll("a")
        .forEach(
            link => {

                link.addEventListener(
                    "click",
                    () => {

                        navigation.classList.remove(
                            "open"
                        );


                        menuButton.setAttribute(
                            "aria-expanded",
                            "false"
                        );

                    }
                );

            }
        );

}


/* =========================================================
   BACK TO TOP
========================================================= */

function initializeBackToTop() {

    const button =
        document.querySelector(
            ".back-to-top"
        );


    if (!button) {
        return;
    }


    function updateButton() {

        if (
            window.scrollY > 500
        ) {

            button.classList.add(
                "show"
            );

        } else {

            button.classList.remove(
                "show"
            );

        }

    }


    window.addEventListener(
        "scroll",
        updateButton,
        {
            passive:true
        }
    );


    button.addEventListener(
        "click",
        function () {

            window.scrollTo({

                top:0,

                behavior:"smooth"

            });

        }
    );


    updateButton();

}


/* =========================================================
   CART LINK
========================================================= */

function initializeCartLinks() {

    document
        .querySelectorAll(
            "#cartLink, .cart-link, [data-cart-link]"
        )
        .forEach(
            link => {

                link.addEventListener(
                    "click",
                    function () {

                        if (
                            this.tagName
                                .toLowerCase()
                            ===
                            "a"
                        ) {
                            return;
                        }


                        window.location.href =
                            "cart.html";

                    }
                );

            }
        );

}


/* =========================================================
   LOAD PRODUCTS SAFELY
========================================================= */

async function initializeProducts() {

    await loadProducts();

    updateCartCount();

    updateWishlistButtons();

}


/* =========================================================
   FINAL PAGE INITIALIZATION
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        console.log(
            "Garima's House Hold loaded."
        );


        /* -----------------------------------------
           UI
        ----------------------------------------- */

        initializeSearch();

        initializeSearchButtons();

        initializeFilterButtons();

        initializeCategoryLinks();

        initializeHeroSlider();

        initializeMobileMenu();

        initializeBackToTop();

        initializeCartLinks();


        /* -----------------------------------------
           PRODUCTS
        ----------------------------------------- */

        await initializeProducts();


        /* -----------------------------------------
           FINAL STATE
        ----------------------------------------- */

        updateCartCount();

        updateWishlistButtons();


        console.log(
            "All website features initialized."
        );

    }
);


/* =========================================================
   GLOBAL EXPORTS
   Useful if HTML onclick is already present
========================================================= */

window.addToCart =
    addToCart;

window.removeFromCart =
    removeFromCart;

window.updateCartQuantity =
    updateCartQuantity;

window.toggleWishlist =
    toggleWishlist;

window.buyNow =
    buyNow;

window.performSearch =
    performSearch;

window.setCategory =
    setCategory;

window.changeHeroSlide =
    window.changeHeroSlide ||
    function () {};

window.goToHeroSlide =
    window.goToHeroSlide ||
    function () {};
    // ==========================================
// BUY NOW GLOBAL CONNECTION
// ==========================================

window.buyNow = buyNow;
window.addToCart = addToCart;

console.log("Buy Now function connected successfully");