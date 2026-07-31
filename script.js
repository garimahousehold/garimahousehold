// ======================================================
// GARIMA'S HOUSE HOLD
// script.js - PART 1
// ======================================================

// ================= IMPORTS =================

import { db } from "./firebase.js";

import {
    collection,
    getDocs,
    doc,
    getDoc,
    query,
    where,
    orderBy,
    limit
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

import {
    getStorage,
    ref,
    getDownloadURL
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-storage.js";

// ================= FIREBASE =================

const storage = getStorage();

// ================= GLOBAL VARIABLES =================

let products = [];
let filteredProducts = [];

let cart = JSON.parse(localStorage.getItem("cart")) || [];

let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];

const DEFAULT_IMAGE =
"https://placehold.co/600x600?text=No+Image";

// ================= DOM =================

const productGrid =
document.getElementById("product-grid");

const cartContainer =
document.getElementById("cart-items");

const wishlistContainer =
document.getElementById("wishlist-items");

const searchInput =
document.getElementById("search");

const cartCount =
document.getElementById("cart-count");

const wishlistCount =
document.getElementById("wishlist-count");

const loader =
document.getElementById("loader");

// ================= LOADER =================

function showLoader() {

    if (loader) {

        loader.style.display = "flex";

    }

}

function hideLoader() {

    if (loader) {

        loader.style.display = "none";

    }

}

// ================= TOAST =================

function showToast(message) {

    const toast = document.createElement("div");

    toast.className = "toast";

    toast.innerText = message;

    document.body.appendChild(toast);

    setTimeout(() => {

        toast.classList.add("show");

    }, 100);

    setTimeout(() => {

        toast.classList.remove("show");

        setTimeout(() => {

            toast.remove();

        }, 300);

    }, 2500);

}

// ================= PRICE FORMAT =================

function formatPrice(price) {

    return Number(price || 0).toLocaleString("en-IN", {

        style: "currency",

        currency: "INR",

        maximumFractionDigits: 0

    });

}

// ================= STORAGE IMAGE =================

async function getImage(imagePath) {

    try {

        if (!imagePath) {

            return DEFAULT_IMAGE;

        }

        if (imagePath.startsWith("http")) {

            return imagePath;

        }

        const imageRef = ref(storage, imagePath);

        return await getDownloadURL(imageRef);

    }

    catch {

        return DEFAULT_IMAGE;

    }

}

// ================= CART COUNT =================

function updateCartCount() {

    if (!cartCount) return;

    let total = 0;

    cart.forEach(item => {

        total += item.qty;

    });

    cartCount.innerText = total;

}

// ================= WISHLIST COUNT =================

function updateWishlistCount() {

    if (!wishlistCount) return;

    wishlistCount.innerText = wishlist.length;

}

// ================= SAVE =================

function saveCart() {

    localStorage.setItem(

        "cart",

        JSON.stringify(cart)

    );

    updateCartCount();

}

function saveWishlist() {

    localStorage.setItem(

        "wishlist",

        JSON.stringify(wishlist)

    );

    updateWishlistCount();

}

// ================= CONSOLE =================

console.log("Garima's House Hold");

console.log("Script Loaded");
// ======================================================
// PART 2
// LOAD PRODUCTS & RENDER
// ======================================================

// ================= LOAD PRODUCTS =================

async function loadProducts() {

    try {

        showLoader();

        const snapshot = await getDocs(collection(db, "products"));

        products = [];

        for (const item of snapshot.docs) {

            const product = {

                id: item.id,

                ...item.data()

            };

            product.image = await getImage(product.image);

            products.push(product);

        }

        filteredProducts = [...products];

        renderProducts(filteredProducts);

    }

    catch (error) {

        console.error("Load Products Error:", error);

        showToast("Unable to load products.");

    }

    finally {

        hideLoader();

    }

}

// ================= RENDER PRODUCTS =================

function renderProducts(list) {

    if (!productGrid) return;

    productGrid.innerHTML = "";

    if (list.length === 0) {

        productGrid.innerHTML = `

            <div class="no-products">

                No Products Found

            </div>

        `;

        return;

    }

    list.forEach(product => {

        productGrid.appendChild(

            createProductCard(product)

        );

    });

}

// ================= PRODUCT CARD =================

function createProductCard(product) {

    const card = document.createElement("div");

    card.className = "product-card";

    card.innerHTML = `

        <div class="product-image">

            <img
                src="${product.image}"
                alt="${product.name}"
                loading="lazy"
            >
        </div>

        <div class="product-content">

            <h3>${product.name}</h3>

            <p class="price">

                ${formatPrice(product.price)}

            </p>

            <p class="category">

                ${product.category || ""}

            </p>

            <div class="product-buttons">

                <button
                    class="btn-cart"
                    onclick="addToCart('${product.id}')">

                    Add to Cart

                </button>

                <button
                    class="btn-wishlist"
                    onclick="toggleWishlist('${product.id}')">

                    ❤

                </button>

            </div>

        </div>

    `;

    card.addEventListener("click", (e) => {

        if (
            e.target.tagName === "BUTTON"
        ) return;

        window.location.href =
            `product.html?id=${product.id}`;

    });

    return card;

}

// ================= FIND PRODUCT =================

function getProduct(id) {

    return products.find(

        item => item.id === id

    );

}

// ================= REFRESH PRODUCTS =================

async function refreshProducts() {

    await loadProducts();

}

console.log("Part 2 Loaded");
// ======================================================
// PART 3
// SEARCH + CATEGORY + WISHLIST
// ======================================================

// ================= SEARCH =================

function searchProducts(keyword) {

    keyword = keyword.toLowerCase().trim();

    if (keyword === "") {

        filteredProducts = [...products];

        renderProducts(filteredProducts);

        return;

    }

    filteredProducts = products.filter(product => {

        return (

            (product.name || "")
                .toLowerCase()
                .includes(keyword)

            ||

            (product.category || "")
                .toLowerCase()
                .includes(keyword)

            ||

            (product.description || "")
                .toLowerCase()
                .includes(keyword)

        );

    });

    renderProducts(filteredProducts);

}

// ================= SEARCH EVENT =================

if (searchInput) {

    searchInput.addEventListener("input", e => {

        searchProducts(e.target.value);

    });

}

// ================= CATEGORY FILTER =================

function filterCategory(category) {

    if (

        !category ||

        category === "All"

    ) {

        filteredProducts = [...products];

    }

    else {

        filteredProducts = products.filter(product =>

            product.category === category

        );

    }

    renderProducts(filteredProducts);

}

// ================= CATEGORY BUTTONS =================

document

.querySelectorAll("[data-category]")

.forEach(button => {

    button.addEventListener("click", () => {

        filterCategory(

            button.dataset.category

        );

    });

});

// ================= WISHLIST =================

function toggleWishlist(id) {

    const index = wishlist.findIndex(

        item => item.id === id

    );

    if (index >= 0) {

        wishlist.splice(index, 1);

        showToast("Removed from Wishlist");

    }

    else {

        const product = getProduct(id);

        if (!product) return;

        wishlist.push(product);

        showToast("Added to Wishlist");

    }

    saveWishlist();

}

// ================= LOAD WISHLIST =================

function loadWishlist() {

    if (!wishlistContainer) return;

    wishlistContainer.innerHTML = "";

    if (wishlist.length === 0) {

        wishlistContainer.innerHTML =

        `

        <div class="empty">

            Wishlist is Empty

        </div>

        `;

        return;

    }

    wishlist.forEach(product => {

        wishlistContainer.appendChild(

            createWishlistCard(product)

        );

    });

}

// ================= WISHLIST CARD =================

function createWishlistCard(product) {

    const card = document.createElement("div");

    card.className = "wishlist-card";

    card.innerHTML = `

        <img

            src="${product.image}"

            alt="${product.name}"

        >

        <div>

            <h4>${product.name}</h4>

            <p>

                ${formatPrice(product.price)}

            </p>

        </div>

        <button

            onclick="removeWishlist('${product.id}')">

            Remove

        </button>

    `;

    return card;

}

// ================= REMOVE =================

function removeWishlist(id) {

    wishlist = wishlist.filter(

        item => item.id !== id

    );

    saveWishlist();

    loadWishlist();

    showToast("Wishlist Updated");

}

// ================= GLOBAL =================

window.toggleWishlist = toggleWishlist;

window.removeWishlist = removeWishlist;

window.filterCategory = filterCategory;

console.log("Part 3 Loaded");
// ======================================================
// PART 4
// CART SYSTEM
// ======================================================

// ================= ADD TO CART =================

function addToCart(id) {

    const product = getProduct(id);

    if (!product) return;

    const item = cart.find(p => p.id === id);

    if (item) {

        item.qty++;

    } else {

        cart.push({
            id: product.id,
            name: product.name,
            price: Number(product.price),
            image: product.image,
            qty: 1
        });

    }

    saveCart();

    showToast("Added to Cart");

}

window.addToCart = addToCart;

// ================= LOAD CART =================

function loadCart() {

    if (!cartContainer) return;

    cartContainer.innerHTML = "";

    if (cart.length === 0) {

        cartContainer.innerHTML = `

        <div class="empty-cart">

            Your Cart is Empty

        </div>

        `;

        updateCartTotal();

        return;

    }

    cart.forEach(item => {

        cartContainer.appendChild(

            createCartCard(item)

        );

    });

    updateCartTotal();

}

// ================= CART CARD =================

function createCartCard(item) {

    const div = document.createElement("div");

    div.className = "cart-card";

    div.innerHTML = `

        <img
            src="${item.image}"
            alt="${item.name}"
        >

        <div class="cart-info">

            <h3>${item.name}</h3>

            <p>

                ${formatPrice(item.price)}

            </p>

            <div class="qty-box">

                <button
                onclick="decreaseQty('${item.id}')">

                -

                </button>

                <span>

                ${item.qty}

                </span>

                <button
                onclick="increaseQty('${item.id}')">

                +

                </button>

            </div>

        </div>

        <button
        class="remove-btn"
        onclick="removeCart('${item.id}')">

        ✖

        </button>

    `;

    return div;

}

// ================= REMOVE =================

function removeCart(id) {

    cart = cart.filter(

        item => item.id !== id

    );

    saveCart();

    loadCart();

    showToast("Removed");

}

// ================= INCREASE =================

function increaseQty(id) {

    const item = cart.find(

        p => p.id === id

    );

    if (!item) return;

    item.qty++;

    saveCart();

    loadCart();

}

// ================= DECREASE =================

function decreaseQty(id) {

    const item = cart.find(

        p => p.id === id

    );

    if (!item) return;

    item.qty--;

    if (item.qty <= 0) {

        removeCart(id);

        return;

    }

    saveCart();

    loadCart();

}

// ================= CLEAR =================

function clearCart() {

    cart = [];

    saveCart();

    loadCart();

}

// ================= TOTAL =================

function getCartTotal() {

    let total = 0;

    cart.forEach(item => {

        total +=

        item.price *

        item.qty;

    });

    return total;

}

function updateCartTotal() {

    const totalBox =

    document.getElementById(

        "cart-total"

    );

    if (!totalBox) return;

    totalBox.innerHTML =

    formatPrice(

        getCartTotal()

    );

}

// ================= GLOBAL =================

window.removeCart = removeCart;

window.increaseQty = increaseQty;

window.decreaseQty = decreaseQty;

window.clearCart = clearCart;

window.loadCart = loadCart;

console.log("Part 4 Loaded");
// ======================================================
// PART 5
// PRODUCT DETAILS
// BUY NOW
// WHATSAPP ORDER
// ======================================================

// ================= PRODUCT DETAILS =================

async function loadProductDetails() {

    const container = document.getElementById("product-details");

    if (!container) return;

    const params = new URLSearchParams(window.location.search);

    const id = params.get("id");

    if (!id) return;

    let product = getProduct(id);

    if (!product) {

        try {

            const snap = await getDoc(doc(db, "products", id));

            if (!snap.exists()) {

                container.innerHTML = "<h2>Product Not Found</h2>";

                return;

            }

            product = {

                id: snap.id,

                ...snap.data()

            };

            product.image = await getImage(product.image);

        }

        catch (error) {

            console.error(error);

            return;

        }

    }

    renderProductDetails(product);

    loadRelatedProducts(product.category, product.id);

}

// ================= RENDER DETAILS =================

function renderProductDetails(product) {

    const container = document.getElementById("product-details");

    if (!container) return;

    container.innerHTML = `

    <div class="details-wrapper">

        <div class="details-image">

            <img
                src="${product.image}"
                alt="${product.name}">
        </div>

        <div class="details-info">

            <h1>${product.name}</h1>

            <h2>${formatPrice(product.price)}</h2>

            <p>

                ${product.description || "No description available."}

            </p>

            <div class="details-buttons">

                <button
                    onclick="addToCart('${product.id}')">

                    Add To Cart

                </button>

                <button
                    onclick="buyNow('${product.id}')">

                    Buy Now

                </button>

                <button
                    onclick="shareProduct()">

                    Share

                </button>

            </div>

        </div>

    </div>

    `;

}

// ================= BUY NOW =================

function buyNow(id) {

    addToCart(id);

    window.location.href = "cart.html";

}

// ================= SHARE PRODUCT =================

function shareProduct() {

    if (navigator.share) {

        navigator.share({

            title: document.title,

            text: "Check this Product",

            url: window.location.href

        });

    }

    else {

        navigator.clipboard.writeText(

            window.location.href

        );

        showToast("Product Link Copied");

    }

}

// ================= RELATED PRODUCTS =================

function loadRelatedProducts(category, currentId) {

    const section =

    document.getElementById(

        "related-products"

    );

    if (!section) return;

    section.innerHTML = "";

    const related = products.filter(product =>

        product.category === category &&

        product.id !== currentId

    ).slice(0, 4);

    related.forEach(product => {

        section.appendChild(

            createProductCard(product)

        );

    });

}

// ================= WHATSAPP ORDER =================

function whatsappOrder() {

    if (cart.length === 0) {

        showToast("Cart is Empty");

        return;

    }

    let message =

`🛒 *Garima's House Hold Order*

`;

    cart.forEach(item => {

        message +=

`• ${item.name}
Qty : ${item.qty}
Price : ${formatPrice(item.price)}

`;

    });

    message +=

`Total : ${formatPrice(getCartTotal())}`;

    const phone = "91XXXXXXXXXX";

    const url =

`https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

    window.open(url, "_blank");

}

// ================= GLOBAL =================

window.buyNow = buyNow;

window.shareProduct = shareProduct;

window.whatsappOrder = whatsappOrder;

console.log("Part 5 Loaded");
// ======================================================
// PART 6
// INITIALIZATION
// STORAGE SYNC
// AUTO REFRESH
// ======================================================

// ================= STORAGE SYNC =================

window.addEventListener("storage", () => {

    cart = JSON.parse(localStorage.getItem("cart")) || [];

    wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];

    updateCartCount();

    updateWishlistCount();

    loadCart();

    loadWishlist();

});

// ================= IMAGE FALLBACK =================

document.addEventListener(
    "error",
    function (e) {

        if (e.target.tagName !== "IMG") return;

        e.target.onerror = null;

        e.target.src = DEFAULT_IMAGE;

    },
    true
);

// ================= PAGE SHOW =================

window.addEventListener("pageshow", () => {

    updateCartCount();

    updateWishlistCount();

});

// ================= REFRESH =================

async function refreshProducts() {

    await loadProducts();

}

// ================= AUTO REFRESH =================

setInterval(() => {

    if (!document.hidden) {

        refreshProducts();

    }

}, 300000);

// ================= CATEGORY INIT =================

function initializeCategories() {

    const buttons =

    document.querySelectorAll(

        "[data-category]"

    );

    buttons.forEach(button => {

        button.addEventListener("click", () => {

            filterCategory(

                button.dataset.category

            );

        });

    });

}

// ================= WEBSITE INIT =================

async function initializeWebsite() {

    try {

        showLoader();

        updateCartCount();

        updateWishlistCount();

        await loadProducts();

        loadCart();

        loadWishlist();

        await loadProductDetails();

        initializeCategories();

    }

    catch (error) {

        console.error(

            "Initialization Error",

            error

        );

        showToast(

            "Website Failed To Load"

        );

    }

    finally {

        hideLoader();

    }

}

// ================= DOM READY =================

document.addEventListener(

    "DOMContentLoaded",

    () => {

        initializeWebsite();

    }

);

// ================= ONLINE / OFFLINE =================

window.addEventListener("online", () => {

    showToast("Internet Connected");

});

window.addEventListener("offline", () => {

    showToast("No Internet Connection");

});

// ================= VISIBILITY =================

document.addEventListener(

    "visibilitychange",

    () => {

        if (!document.hidden) {

            refreshProducts();

        }

    }

);

// ================= GLOBAL =================

window.refreshProducts = refreshProducts;

console.log("Part 6 Loaded");
// ======================================================
// PART 7
// PERFORMANCE + UTILITIES
// ======================================================

// ================= DEBOUNCE =================

function debounce(callback, delay = 300) {

    let timer;

    return (...args) => {

        clearTimeout(timer);

        timer = setTimeout(() => {

            callback(...args);

        }, delay);

    };

}

// ================= LIVE SEARCH =================

if (searchInput) {

    const searchHandler = debounce((value) => {

        searchProducts(value);

    });

    searchInput.addEventListener("input", e => {

        searchHandler(e.target.value);

    });

}

// ================= SORT PRODUCTS =================

function sortProducts(type = "latest") {

    let list = [...filteredProducts];

    switch (type) {

        case "low":

            list.sort((a, b) => Number(a.price) - Number(b.price));

            break;

        case "high":

            list.sort((a, b) => Number(b.price) - Number(a.price));

            break;

        case "name":

            list.sort((a, b) =>

                (a.name || "").localeCompare(b.name || "")

            );

            break;

        default:

            list = [...filteredProducts];

    }

    renderProducts(list);

}

// ================= SCROLL TO TOP =================

function scrollTopButton() {

    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });

}

// ================= IMAGE LAZY =================

function lazyLoadImages() {

    const images =

    document.querySelectorAll("img[loading='lazy']");

    images.forEach(img => {

        img.decoding = "async";

    });

}

// ================= PAGE TITLE =================

function updatePageTitle(title) {

    if (title) {

        document.title = title;

    }

}

// ================= SAFE REFRESH =================

async function safeRefresh() {

    try {

        await refreshProducts();

    }

    catch (error) {

        console.error(error);

    }

}

// ================= GLOBAL FUNCTIONS =================

window.sortProducts = sortProducts;

window.scrollTopButton = scrollTopButton;

window.safeRefresh = safeRefresh;

// ================= STARTUP =================

(async function () {

    console.log("====================================");

    console.log("Garima's House Hold");

    console.log("Production Build v1.0");

    console.log("====================================");

    updateCartCount();

    updateWishlistCount();

    lazyLoadImages();

})();

// ================= END =================

console.log("script.js Loaded Successfully");
