// ==========================================
// Garima's House Hold
// wishlist.js (Part 1)
// ==========================================

import { db } from "./firebase.js";

const wishlistGrid = document.getElementById("wishlist-grid");
const cartCount = document.getElementById("cart-count");

// -----------------------------
// Load Wishlist
// -----------------------------
let wishlist =
    JSON.parse(localStorage.getItem("wishlist")) || [];

let cart =
    JSON.parse(localStorage.getItem("cart")) || [];

// -----------------------------
// Update Cart Count
// -----------------------------
function updateCartCount() {

    if (!cartCount) return;

    let total = 0;

    cart.forEach(item => {
        total += Number(item.qty || 1);
    });

    cartCount.textContent = total;
}

// -----------------------------
// Save Wishlist
// -----------------------------
function saveWishlist() {

    localStorage.setItem(
        "wishlist",
        JSON.stringify(wishlist)
    );
}

// -----------------------------
// Render Wishlist
// -----------------------------
function renderWishlist() {

    wishlistGrid.innerHTML = "";

    if (wishlist.length === 0) {

        wishlistGrid.innerHTML = `
        <div class="empty-cart">
            <h2>Your Wishlist is Empty ❤️</h2>
            <a href="index.html" class="cart-btn">
                Continue Shopping
            </a>
        </div>
        `;

        return;
    }

    wishlist.forEach(product => {

        const card = document.createElement("div");

        card.className = "product-card";

        card.innerHTML = `

<img
src="${product.image}"
alt="${product.name}"
loading="lazy"
>

<div class="product-info">

<h3>${product.name}</h3>

<p class="price">
&#8377;${Number(product.price).toLocaleString("en-IN")}
</p>

<button class="add-cart-btn">
🛒 Add To Cart
</button>

<button class="remove-btn">
❌ Remove
</button>

</div>

        `;

        const addBtn =
            card.querySelector(".add-cart-btn");

        const removeBtn =
            card.querySelector(".remove-btn");
                    addBtn.addEventListener("click", () => {

            let cart =
                JSON.parse(localStorage.getItem("cart")) || [];

            const existing =
                cart.find(item => item.id === product.id);

            if (existing) {

                existing.qty += 1;

            } else {

                cart.push({
                    id: product.id,
                    name: product.name,
                    image: product.image,
                    price: Number(product.price),
                    qty: 1
                });

            }

            localStorage.setItem(
                "cart",
                JSON.stringify(cart)
            );

            updateCartCount();

            alert(product.name + " added to cart.");

        });

        removeBtn.addEventListener("click", () => {

            wishlist = wishlist.filter(
                item => item.id !== product.id
            );

            saveWishlist();

            renderWishlist();

        });

        wishlistGrid.appendChild(card);

    });

}

updateCartCount();

renderWishlist();

window.addEventListener("storage", () => {

    wishlist =
        JSON.parse(localStorage.getItem("wishlist")) || [];

    cart =
        JSON.parse(localStorage.getItem("cart")) || [];

    updateCartCount();

    renderWishlist();

});