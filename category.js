// ==========================================
// GARIMA'S HOUSE HOLD
// CATEGORY.JS - FINAL
// ==========================================

import {
    db,
    collection,
    getDocs
} from "./firebase.js";

// ==========================================
// GLOBAL STATE
// ==========================================

let allProducts = [];
let categoryProducts = [];
let visibleProducts = [];

let selectedCategory = "";
let currentSort = "latest";

const PRODUCTS_PER_PAGE = 12;
let visibleProductCount = PRODUCTS_PER_PAGE;


// ==========================================
// DOM ELEMENTS
// ==========================================

const loader = document.getElementById("loader");
const productGrid = document.getElementById("categoryProducts");
const noProducts = document.getElementById("noProducts");

const categorySearch = document.getElementById("categorySearch");
const sortProducts = document.getElementById("sortProducts");
const inStockOnly = document.getElementById("inStockOnly");

const priceRange = document.getElementById("priceRange");
const priceValue = document.getElementById("priceValue");

const productCount = document.getElementById("productCount");
const categoryTitle = document.getElementById("categoryTitle");
const categoryHeading = document.getElementById("categoryHeading");

const cartCount = document.getElementById("cartCount");
const wishlistCount = document.getElementById("wishlistCount");

const scrollTopButton = document.getElementById("scrollTop");

const toast = document.getElementById("toast");
const toastTitle = document.getElementById("toastTitle");
const toastMessage = document.getElementById("toastMessage");


// ==========================================
// URL CATEGORY
// ==========================================

const urlParams = new URLSearchParams(window.location.search);

selectedCategory = normalizeCategory(
    urlParams.get("cat") || ""
);


// ==========================================
// LOCAL STORAGE
// ==========================================

let cart = getStorageArray("cart");
let wishlist = getStorageArray("wishlist");

function getStorageArray(key) {
    try {
        const value = JSON.parse(localStorage.getItem(key));
        return Array.isArray(value) ? value : [];
    } catch (error) {
        console.warn(`Unable to read ${key} from localStorage.`, error);
        return [];
    }
}

function saveCart() {
    localStorage.setItem("cart", JSON.stringify(cart));
}

function saveWishlist() {
    localStorage.setItem("wishlist", JSON.stringify(wishlist));
}


// ==========================================
// HELPERS
// ==========================================

function normalizeCategory(value) {
    return decodeURIComponent(String(value || ""))
        .replace(/\+/g, " ")
        .trim();
}

function escapeHTML(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function formatPrice(value) {
    return Number(value || 0).toLocaleString("en-IN");
}

function getProductPrice(product) {
    return Number(product?.price ?? product?.salePrice ?? 0);
}

function getOriginalPrice(product) {
    return Number(
        product?.originalPrice ??
        product?.mrp ??
        0
    );
}

function getProductImage(product) {
    if (product?.image) return product.image;
    if (product?.imageUrl) return product.imageUrl;

    if (Array.isArray(product?.images) && product.images.length) {
        return product.images[0];
    }

    return "images/placeholder.jpg";
}

function isOutOfStock(product) {
    return (
        product?.available === false ||
        Number(product?.stock) === 0
    );
}

function getStockHTML(product) {
    if (isOutOfStock(product)) {
        return {
            text: "Out of Stock",
            className: "out-of-stock"
        };
    }

    if (
        typeof product?.stock === "number" &&
        product.stock > 0 &&
        product.stock <= 5
    ) {
        return {
            text: `Only ${product.stock} left`,
            className: "low-stock"
        };
    }

    return {
        text: "In Stock",
        className: "in-stock"
    };
}

function getProductDate(product) {
    const value = product?.createdAt;

    if (!value) return 0;

    if (typeof value?.toDate === "function") {
        return value.toDate().getTime();
    }

    if (value instanceof Date) {
        return value.getTime();
    }

    if (typeof value === "number") {
        return value;
    }

    const timestamp = new Date(value).getTime();
    return Number.isNaN(timestamp) ? 0 : timestamp;
}


// ==========================================
// LOADER
// ==========================================

function showLoader() {
    if (loader) loader.style.display = "flex";
}

function hideLoader() {
    if (loader) loader.style.display = "none";
}


// ==========================================
// CATEGORY HEADER
// ==========================================

function updateCategoryHeader() {
    const title = selectedCategory || "All Products";

    if (categoryTitle) {
        categoryTitle.textContent = title;
    }

    if (categoryHeading) {
        categoryHeading.textContent = title;
    }
}


// ==========================================
// LOAD PRODUCTS
// ==========================================

async function loadProducts() {
    showLoader();

    try {
        const snapshot = await getDocs(
            collection(db, "products")
        );

        allProducts = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        filterByCategory();

    } catch (error) {
        console.error("Error loading products:", error);

        categoryProducts = [];
        visibleProducts = [];

        if (productGrid) {
            productGrid.innerHTML = "";
        }

        if (noProducts) {
            noProducts.style.display = "block";
            noProducts.innerHTML = `
                <i class="fa-solid fa-triangle-exclamation"></i>
                <h3>Something went wrong</h3>
                <p>Please try again later.</p>
            `;
        }

        updateProductCount(0);

    } finally {
        hideLoader();
    }
}


// ==========================================
// CATEGORY FILTER
// ==========================================

function filterByCategory() {
    if (
        !selectedCategory ||
        selectedCategory.toLowerCase() === "all products"
    ) {
        categoryProducts = [...allProducts];
    } else {
        const wanted = selectedCategory.toLowerCase();

        categoryProducts = allProducts.filter(product => {
            const category = normalizeCategory(
                product?.category || ""
            ).toLowerCase();

            return category === wanted;
        });
    }

    resetPagination();
    applyFilters();
}


// ==========================================
// SEARCH
// ==========================================

function matchesSearch(product, searchText) {
    if (!searchText) return true;

    const name = String(product?.name || "").toLowerCase();
    const category = String(product?.category || "").toLowerCase();
    const description = String(product?.description || "").toLowerCase();

    return (
        name.includes(searchText) ||
        category.includes(searchText) ||
        description.includes(searchText)
    );
}


// ==========================================
// SORT
// ==========================================

function sortProductList(products) {
    const sorted = [...products];

    switch (currentSort) {
        case "priceLow":
            sorted.sort(
                (a, b) =>
                    getProductPrice(a) -
                    getProductPrice(b)
            );
            break;

        case "priceHigh":
            sorted.sort(
                (a, b) =>
                    getProductPrice(b) -
                    getProductPrice(a)
            );
            break;

        case "name":
            sorted.sort((a, b) =>
                String(a?.name || "")
                    .localeCompare(
                        String(b?.name || ""),
                        undefined,
                        { sensitivity: "base" }
                    )
            );
            break;

        case "latest":
        default:
            sorted.sort(
                (a, b) =>
                    getProductDate(b) -
                    getProductDate(a)
            );
            break;
    }

    return sorted;
}


// ==========================================
// APPLY FILTERS
// ==========================================

function applyFilters() {
    let products = [...categoryProducts];

    const searchText = String(
        categorySearch?.value || ""
    )
        .toLowerCase()
        .trim();

    products = products.filter(product =>
        matchesSearch(product, searchText)
    );

    const maxPrice = Number(
        priceRange?.value || 10000
    );

    products = products.filter(product =>
        getProductPrice(product) <= maxPrice
    );

    if (inStockOnly?.checked) {
        products = products.filter(
            product => !isOutOfStock(product)
        );
    }

    products = sortProductList(products);

    visibleProducts = products.slice(
        0,
        visibleProductCount
    );

    renderProducts();
    updateProductCount(products.length);
    updateLoadMoreButton(products.length);
}


// ==========================================
// RENDER PRODUCTS
// ==========================================

function renderProducts() {
    if (!productGrid) return;

    productGrid.innerHTML = "";

    if (!visibleProducts.length) {
        if (noProducts) {
            noProducts.style.display = "block";
        }
        return;
    }

    if (noProducts) {
        noProducts.style.display = "none";
    }

    visibleProducts.forEach(product => {
        productGrid.appendChild(
            createProductCard(product)
        );
    });
}


// ==========================================
// PRODUCT CARD
// ==========================================

function createProductCard(product) {
    const card = document.createElement("article");

    card.className = "product-card";
    card.dataset.productId = product.id;

    const price = getProductPrice(product);
    const originalPrice = getOriginalPrice(product);
    const image = getProductImage(product);
    const stock = getStockHTML(product);

    const inWishlist = wishlist.some(
        item => item.id === product.id
    );

    let discountHTML = "";
    let originalPriceHTML = "";

    if (
        originalPrice > price &&
        originalPrice > 0
    ) {
        const discount = Math.round(
            ((originalPrice - price) /
                originalPrice) *
            100
        );

        discountHTML = `
            <span class="discount-badge">
                ${discount}% OFF
            </span>
        `;

        originalPriceHTML = `
            <span class="original-price">
                ₹${formatPrice(originalPrice)}
            </span>
        `;
    }

    card.innerHTML = `
        <div class="product-image-wrapper">
            ${discountHTML}

            <button
                type="button"
                class="wishlist-btn ${inWishlist ? "active" : ""}"
                data-action="wishlist"
                aria-label="Wishlist"
            >
                ${inWishlist ? "♥" : "♡"}
            </button>

            <img
                class="product-image"
                src="${escapeHTML(image)}"
                alt="${escapeHTML(product?.name || "Product")}"
                loading="lazy"
                onerror="this.onerror=null;this.src='images/placeholder.jpg';"
            >
        </div>

        <div class="product-info">
            <div class="product-category">
                ${escapeHTML(product?.category || "")}
            </div>

            <h3 class="product-name">
                ${escapeHTML(product?.name || "Unnamed Product")}
            </h3>

            <div class="product-price">
                <span class="current-price">
                    ₹${formatPrice(price)}
                </span>
                ${originalPriceHTML}
            </div>

            <div class="stock-status ${stock.className}">
                ${stock.text}
            </div>

            <button
                type="button"
                class="add-cart-btn"
                data-action="cart"
                ${isOutOfStock(product) ? "disabled" : ""}
            >
                ${isOutOfStock(product) ? "Out of Stock" : "Add to Cart"}
            </button>
        </div>
    `;

    return card;
}


// ==========================================
// PRODUCT GRID EVENTS
// ==========================================

if (productGrid) {
    productGrid.addEventListener("click", event => {
        const card = event.target.closest(".product-card");

        if (!card) return;

        const productId = card.dataset.productId;

        const actionButton = event.target.closest(
            "[data-action]"
        );

        if (actionButton) {
            event.stopPropagation();

            const action = actionButton.dataset.action;

            if (action === "cart") {
                addToCart(productId);
            }

            if (action === "wishlist") {
                toggleWishlist(productId);
            }

            return;
        }

        openProductDetails(productId);
    });
}


// ==========================================
// PRODUCT DETAIL
// ==========================================

function openProductDetails(productId) {
    if (!productId) return;

    window.location.href =
        `product.html?id=${encodeURIComponent(productId)}`;
}


// ==========================================
// CART
// ==========================================

function addToCart(productId) {
    const product = allProducts.find(
        item => item.id === productId
    );

    if (!product) return;

    if (isOutOfStock(product)) {
        showToast(
            "Unavailable",
            "This product is currently out of stock."
        );
        return;
    }

    const existing = cart.find(
        item => item.id === productId
    );

    if (existing) {
        existing.quantity =
            Number(existing.quantity || 1) + 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name || "Product",
            price: getProductPrice(product),
            image: getProductImage(product),
            category: product.category || "",
            quantity: 1
        });
    }

    saveCart();
    updateCartCount();

    showToast(
        "Added to Cart",
        `${product.name || "Product"} added successfully.`
    );
}

function updateCartCount() {
    if (!cartCount) return;

    const count = cart.reduce(
        (total, item) =>
            total + Number(item.quantity || 1),
        0
    );

    cartCount.textContent = count;
}


// ==========================================
// WISHLIST
// ==========================================

function toggleWishlist(productId) {
    const product = allProducts.find(
        item => item.id === productId
    );

    if (!product) return;

    const index = wishlist.findIndex(
        item => item.id === productId
    );

    if (index >= 0) {
        wishlist.splice(index, 1);

        showToast(
            "Wishlist",
            "Product removed from wishlist."
        );
    } else {
        wishlist.push({
            id: product.id,
            name: product.name || "Product",
            price: getProductPrice(product),
            image: getProductImage(product),
            category: product.category || ""
        });

        showToast(
            "Wishlist",
            "Product added to wishlist."
        );
    }

    saveWishlist();
    updateWishlistCount();
    renderProducts();
}

function updateWishlistCount() {
    if (wishlistCount) {
        wishlistCount.textContent = wishlist.length;
    }
}


// ==========================================
// SEARCH EVENT
// ==========================================

if (categorySearch) {
    categorySearch.addEventListener(
        "input",
        () => {
            resetPagination();
            applyFilters();
        }
    );
}


// ==========================================
// SORT EVENT
// ==========================================

if (sortProducts) {
    sortProducts.addEventListener(
        "change",
        () => {
            currentSort =
                sortProducts.value || "latest";

            resetPagination();
            applyFilters();
        }
    );
}


// ==========================================
// STOCK EVENT
// ==========================================

if (inStockOnly) {
    inStockOnly.addEventListener(
        "change",
        () => {
            resetPagination();
            applyFilters();
        }
    );
}


// ==========================================
// PRICE EVENT
// ==========================================

if (priceRange) {
    priceRange.addEventListener(
        "input",
        () => {
            updatePriceValue();

            resetPagination();
            applyFilters();
        }
    );
}

function updatePriceValue() {
    if (!priceValue || !priceRange) return;

    priceValue.textContent =
        formatPrice(priceRange.value);
}


// ==========================================
// PRODUCT COUNT
// ==========================================

function updateProductCount(count) {
    if (productCount) {
        productCount.textContent =
            `${count} Products`;
    }
}


// ==========================================
// LOAD MORE
// ==========================================

function resetPagination() {
    visibleProductCount =
        PRODUCTS_PER_PAGE;
}

function createLoadMoreButton() {
    if (!productGrid) return null;

    let button =
        document.getElementById("loadMoreBtn");

    if (button) return button;

    button =
        document.createElement("button");

    button.id = "loadMoreBtn";
    button.type = "button";
    button.className = "load-more-btn";
    button.textContent = "Load More Products";

    const parent =
        productGrid.parentElement;

    if (parent) {
        parent.appendChild(button);
    }

    button.addEventListener(
        "click",
        () => {
            visibleProductCount +=
                PRODUCTS_PER_PAGE;

            applyFilters();
        }
    );

    return button;
}

function updateLoadMoreButton(totalCount) {
    const button =
        createLoadMoreButton();

    if (!button) return;

    if (
        totalCount > visibleProductCount
    ) {
        button.style.display = "block";
    } else {
        button.style.display = "none";
    }
}


// ==========================================
// RELATED CATEGORY LINKS
// ==========================================

document
    .querySelectorAll(".related-card")
    .forEach(link => {
        link.addEventListener(
            "click",
            event => {
                const href =
                    link.getAttribute("href");

                if (!href) return;

                // Keep the normal anchor navigation.
                // This also supports direct URL opening.
            }
        );
    });


// ==========================================
// SCROLL TO TOP
// ==========================================

if (scrollTopButton) {
    scrollTopButton.addEventListener(
        "click",
        () => {
            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        }
    );

    window.addEventListener(
        "scroll",
        () => {
            if (window.scrollY > 400) {
                scrollTopButton.classList.add("show");
            } else {
                scrollTopButton.classList.remove("show");
            }
        }
    );
}


// ==========================================
// TOAST
// ==========================================

let toastTimer;

function showToast(title, message) {
    if (!toast) return;

    if (toastTitle) {
        toastTitle.textContent =
            title || "Success";
    }

    if (toastMessage) {
        toastMessage.textContent =
            message || "Done";
    }

    toast.classList.add("show");

    clearTimeout(toastTimer);

    toastTimer = setTimeout(() => {
        toast.classList.remove("show");
    }, 2200);
}


// ==========================================
// INITIALIZE
// ==========================================

function initializeCategoryPage() {
    updateCategoryHeader();
    updatePriceValue();

    if (sortProducts) {
        currentSort =
            sortProducts.value || "latest";
    }

    updateCartCount();
    updateWishlistCount();
    createLoadMoreButton();

    loadProducts();
}

if (
    document.readyState === "loading"
) {
    document.addEventListener(
        "DOMContentLoaded",
        initializeCategoryPage
    );
} else {
    initializeCategoryPage();
}
