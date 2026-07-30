// ==========================================
// Garima's House Hold
// script.js
// Version 2 (Final)
// ==========================================

import { db } from "./firebase.js";


import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

function getWishlist() {
    return JSON.parse(localStorage.getItem("wishlist")) || [];
}

function saveWishlist(wishlist) {
    localStorage.setItem("wishlist", JSON.stringify(wishlist));
}

function updateWishlistCount() {
    const count = document.getElementById("wishlist-count");
    if (count) {
        count.innerText = getWishlist().length;
    }
}

// ==========================================
// Global Variables
// ==========================================

let products = [];

let currentCategory = "All";

let cart = JSON.parse(localStorage.getItem("cart")) || [];

const productGrid = document.getElementById("product-grid");

const searchInput = document.getElementById("search");

const cartCount = document.getElementById("cart-count");

// ==========================================
// Cart Functions
// ==========================================

function saveCart() {

    localStorage.setItem("cart", JSON.stringify(cart));

    updateCartCount();

}

function updateCartCount() {

    if (!cartCount) return;

    let total = 0;

    cart.forEach(item => {

        total += item.qty;

    });

    cartCount.innerText = total;

}

// ==========================================
// Slider
// ==========================================

let currentSlide = 0;

function showSlides() {

    const slides = document.querySelector(".slides");

    if (!slides) return;

    const totalSlides = slides.children.length;

    currentSlide++;

    if (currentSlide >= totalSlides) {

        currentSlide = 0;

    }

    slides.style.transform =
        `translateX(-${currentSlide * 100}%)`;

}

setInterval(showSlides, 3000);

// ==========================================
// Firestore Products
// ==========================================

async function loadProducts() {

    try {

        const snapshot =
            await getDocs(collection(db, "products"));

        products = [];

        snapshot.forEach(doc => {

            products.push({

                id: doc.id,

                ...doc.data(),
                category: (doc.data().category || "").trim()
            });

        });
        
console.log("Homepage Products:", products);
        renderProducts(products);

    }

    catch (error) {

        console.error(error);

        if (productGrid) {

            productGrid.innerHTML =

                `<h3>Unable to load products.</h3>`;

        }

    }

}
// ==========================================
// Render Products
// ==========================================

function renderProducts(productList) {

    if (!productGrid) return;

    productGrid.innerHTML = "";

    if (productList.length === 0) {

        productGrid.innerHTML = `
            <div class="no-products">
                <h3>No Products Found</h3>
            </div>
        `;

        return;

    }

    productList.forEach(product => {

        const card = document.createElement("div");

        card.className = "product-card";

        const image =
            product.image && product.image.trim() !== ""
                ? product.image
                : "image/no-image.png";

        const price = Number(product.price || 0);

        const mrp = Number(product.mrp || price);
        const discount = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;

        card.innerHTML = `

            <img
    class="product-img"
    src="${image}"
    alt="${product.name}"
    loading="lazy"
    onerror="this.src='image/no-image.png'"
>

            <div class="product-info">

            <div class="wishlist-icon" data-id="${product.id}">
    🤍
</div>

                <h3>${product.name}</h3>

                <p class="price">

    ₹${price.toLocaleString("en-IN")}

    ${mrp > price ? `
        <br>
        <span class="mrp">₹${mrp.toLocaleString("en-IN")}</span>
        <span class="discount">${discount}% OFF</span>
    ` : ""}

</p>
                ${product.stock > 0
? `
    ${product.stock <= 5 ? `<p class="low-stock">Only ${product.stock} Left</p>` : ""}

    <button onclick="addToCart('${product.id}')">
        Add To Cart
    </button>
`
: `
    <button class="out-stock-btn" disabled>
        Out Of Stock
    </button>
`}

            </div>

        `;
        // Product Details Page
card.style.cursor = "pointer";

card.addEventListener("click", (e) => {

    if (e.target.tagName === "BUTTON") return;

    window.location.href = `product.html?id=${product.id}`;

});
const heart = card.querySelector(".wishlist-icon");

let wishlist = getWishlist();

if (wishlist.includes(product.id)) {
    heart.innerHTML = "❤️";
    heart.classList.add("active");
}

heart.addEventListener("click", () => {

    let wishlist = getWishlist();

    if (wishlist.includes(product.id)) {

        wishlist = wishlist.filter(id => id !== product.id);

        heart.innerHTML = "🤍";
        heart.classList.remove("active");

    } else {

        wishlist.push(product.id);

        heart.innerHTML = "❤️";
        heart.classList.add("active");

    }

    saveWishlist(wishlist);
    updateWishlistCount();

});
        productGrid.appendChild(card);

    });

}
// ==========================================
// Category Filter
// ==========================================

function filterByCategory(category) {

    currentCategory = category;

    if (category === "All") {
        renderProducts(products);
        return;
    }

    const filteredProducts = products.filter(product => {
        const p = (product.category || "")
            .toLowerCase()
            .trim()
            .replace(/s$/, "");

        const c = (category || "")
            .toLowerCase()
            .trim()
            .replace(/s$/, "");

        return p === c;
    });

    renderProducts(filteredProducts);
}

// ==========================================
// Search Products
// ==========================================

if (searchInput) {

    searchInput.addEventListener("input", function () {

        const keyword =
            this.value.toLowerCase().trim();

        if (keyword === "") {

            renderProducts(products);

            return;

        }

        const filteredProducts = products.filter(product => {

            return (
                product.name &&
                product.name.toLowerCase().includes(keyword)
            );

        });

        renderProducts(filteredProducts);

    });

}

// ==========================================
// Find Product
// ==========================================

function findProduct(id) {

    return products.find(product => product.id === id);

}
// ==========================================
// Add To Cart
// ==========================================

function addToCart(id) {

    const product = findProduct(id);

    if (!product) {

        alert("Product not found.");

        return;

    }

    const existingItem = cart.find(item => item.id === id);

    if (existingItem) {

        existingItem.qty++;

    }

    else {

        cart.push({

            id: product.id,

            name: product.name,

            price: Number(product.price || 0),

            image: product.image || "image/no-image.png",

            qty: 1

        });

    }

    saveCart();

    alert(product.name + " added to cart.");

}

// ==========================================
// Remove Cart Item
// ==========================================

function removeFromCart(id) {

    cart = cart.filter(item => item.id !== id);

    saveCart();

    loadCart();

}

// ==========================================
// Increase Quantity
// ==========================================

function increaseQty(id) {

    const item = cart.find(item => item.id === id);

    if (!item) return;

    item.qty++;

    saveCart();

    loadCart();

}

// ==========================================
// Decrease Quantity
// ==========================================

function decreaseQty(id) {

    const item = cart.find(item => item.id === id);

    if (!item) return;

    if (item.qty > 1) {

        item.qty--;

    }

    else {

        removeFromCart(id);

        return;

    }

    saveCart();

    loadCart();

}

// ==========================================
// Cart Total
// ==========================================

function getCartTotal() {

    let total = 0;

    cart.forEach(item => {

        total += Number(item.price) * Number(item.qty);

    });

    return total;

}

// ==========================================
// Clear Cart
// ==========================================

function clearCart() {

    if (!confirm("Clear complete cart?")) return;

    cart = [];

    saveCart();

    loadCart();

}
// ==========================================
// Load Cart
// ==========================================

function loadCart() {

    const cartContainer = document.getElementById("cart-items");
    const totalElement = document.getElementById("cart-total");

    if (!cartContainer) return;

    cartContainer.innerHTML = "";

    if (cart.length === 0) {

        cartContainer.innerHTML = `
            <div class="empty-cart">
                <h2>Your cart is empty.</h2>
            </div>
        `;

        if (totalElement) {

            totalElement.innerText = "₹0";

        }

        return;

    }

    cart.forEach(item => {

        const card = document.createElement("div");

        card.className = "cart-card";

        const subtotal =
            Number(item.price) * Number(item.qty);

        card.innerHTML = `

            <img
                src="${item.image}"
                alt="${item.name}"
                onerror="this.src='image/no-image.png'"
            >

            <div class="cart-details">

                <h3>${item.name}</h3>

                <p>

                    Price :
                    ₹${Number(item.price).toLocaleString("en-IN")}

                </p>

                <div class="qty-box">

                    <button
                        onclick="decreaseQty('${item.id}')">

                        -

                    </button>

                    <span>${item.qty}</span>

                    <button
                        onclick="increaseQty('${item.id}')">

                        +

                    </button>

                </div>

                <p>

                    Subtotal :
                    ₹${subtotal.toLocaleString("en-IN")}

                </p>

                <button
                    class="remove-btn"
                    onclick="removeFromCart('${item.id}')">

                    Remove

                </button>

            </div>

        `;

        cartContainer.appendChild(card);

    });

    if (totalElement) {

        totalElement.innerText =
            "₹" + getCartTotal().toLocaleString("en-IN");

    }

}

// ==========================================
// Checkout
// ==========================================

function checkout() {

    if (cart.length === 0) {

        alert("Your cart is empty.");

        return;

    }

    window.location.href = "checkout.html";

}

// ==========================================
// Continue Shopping
// ==========================================

function continueShopping() {

    window.location.href = "index.html";

}
// ==========================================
// WhatsApp Order
// ==========================================

function whatsappOrder() {

    if (cart.length === 0) {

        alert("Your cart is empty.");

        return;

    }

    let message = "🛍 *Garima's House Hold Order*%0A%0A";

    let grandTotal = 0;

    cart.forEach((item, index) => {

        const subtotal = Number(item.price) * Number(item.qty);

        grandTotal += subtotal;

        message +=
`${index + 1}. ${item.name}%0AQty : ${item.qty}%0APrice : ₹${Number(item.price).toLocaleString("en-IN")}%0ASubtotal : ₹${subtotal.toLocaleString("en-IN")}%0A%0A`;

    });

    message += `*Grand Total : ₹${grandTotal.toLocaleString("en-IN")}*`;

    // Apna WhatsApp Number yaha change karna
    const phone = "919374445544";

    window.open(
        `https://wa.me/${phone}?text=${message}`,
        "_blank"
    );

}

// ==========================================
// Global Functions
// ==========================================

window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.increaseQty = increaseQty;
window.decreaseQty = decreaseQty;
window.clearCart = clearCart;
window.checkout = checkout;
window.continueShopping = continueShopping;
window.whatsappOrder = whatsappOrder;

// ==========================================
// Initialize Website
// ==========================================

function initializeWebsite() {

    updateCartCount();

    updateWishlistCount();

    loadProducts();

    loadCart();

    document.querySelectorAll(".category-item").forEach(item => {

    item.addEventListener("click", () => {

        const category = item.dataset.category;

        filterByCategory(category);

    });

});

}

// ==========================================
// DOM Ready
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

    initializeWebsite();

});

// ==========================================
// Storage Sync
// ==========================================

window.addEventListener("storage", () => {

    cart = JSON.parse(localStorage.getItem("cart")) || [];

    updateCartCount();

    loadCart();

});

// ==========================================
// Console
// ==========================================

console.log("Garima's House Hold Loaded Successfully");
// ==========================================
// Refresh Products
// ==========================================

async function refreshProducts() {

    try {

        await loadProducts();

    }

    catch (error) {

        console.error("Refresh Error:", error);

    }

}

// ==========================================
// Image Fallback
// ==========================================

document.addEventListener(
    "error",
    function (event) {

        if (event.target.tagName === "IMG") {

            event.target.src = "image/no-image.png";

        }

    },
    true
);

// ==========================================
// Loading State
// ==========================================

function showLoading() {

    if (!productGrid) return;

    productGrid.innerHTML = `
        <div class="loading">
            <h3>Loading Products...</h3>
        </div>
    `;

}

function hideLoading() {

    // Reserved for future use

}

// ==========================================
// Reload Products
// ==========================================

async function reloadProducts() {

    showLoading();

    await loadProducts();

    hideLoading();

}

// ==========================================
// Safe Start
// ==========================================

window.addEventListener("pageshow", () => {

    updateCartCount();

});

// ==========================================
// Footer Console
// ==========================================

console.log("================================");

console.log("Garima's House Hold");

console.log("Version : 2.0");

console.log("Products :", products.length);

console.log("Cart :", cart.length);

console.log("Website Ready");

console.log("================================");
