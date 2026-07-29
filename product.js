// ==========================================
// Garima's House Hold
// product.js - Part 1
// ==========================================

import { db } from "./firebase.js";

import {
    doc,
    getDoc,
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

// ==========================================
// Get Product ID
// ==========================================

const params = new URLSearchParams(window.location.search);
const productId = params.get("id");

// ==========================================
// HTML Elements
// ==========================================

const productImage = document.getElementById("product-image");
const productName = document.getElementById("product-name");
const productPrice = document.getElementById("product-price");
const productCategory = document.getElementById("product-category");
const productStock = document.getElementById("product-stock");
const productDescription = document.getElementById("product-description");

const relatedProducts = document.getElementById("related-products");
const imageGallery = document.getElementById("image-gallery");
let currentProduct = null;
// ==========================================
// Quantity
// ==========================================

const qtyInput = document.getElementById("qty");
const plusBtn = document.getElementById("plus-btn");
const minusBtn = document.getElementById("minus-btn");

let quantity = 1;

if (qtyInput) {

    qtyInput.value = quantity;

}

if (plusBtn) {

    plusBtn.addEventListener("click", () => {

        quantity++;

        qtyInput.value = quantity;

    });

}

if (minusBtn) {

    minusBtn.addEventListener("click", () => {

        if (quantity > 1) {

            quantity--;

            qtyInput.value = quantity;

        }

    });

}

// ==========================================
// Load Product
// ==========================================

async function loadProduct() {

    if (!productId) {

        console.log("No Product ID Found");

        productName.innerText = "Product Not Found";

        return;

    }

    try {

        console.log("Product ID =", productId);

        const productRef = doc(db, "products", productId);

        const snapshot = await getDoc(productRef);

        console.log("Snapshot Exists =", snapshot.exists());

        if (snapshot.exists()) {

            console.log("Product Data =", snapshot.data());

        }

        if (!snapshot.exists()) {

            productName.innerText = "Product Not Found";

            return;

        }

        currentProduct = {

            id: snapshot.id,
            ...snapshot.data()

        };

        renderProduct();

        loadRelatedProducts();

    }

    catch (error) {

        console.error("Load Product Error :", error);

        productName.innerText = "Unable To Load Product";

    }

}
// ==========================================
// Render Product
// ==========================================

function renderProduct() {

    const image =
        currentProduct.image &&
        currentProduct.image.trim() !== ""
            ? currentProduct.image
            : "image/no-image.png";

    productImage.src = image;

    productImage.onerror = function () {

        this.src = "image/no-image.png";

    };

    productName.innerText =
        currentProduct.name || "-";

    productPrice.innerText =
        "₹" +
        Number(currentProduct.price || 0)
        .toLocaleString("en-IN");

    productCategory.innerText =
        currentProduct.category || "-";

    productStock.innerText =
        currentProduct.stock || "Available";

    productDescription.innerText =
        currentProduct.description ||
        "No description available.";

        // ===============================
// Image Gallery
// ===============================

if (imageGallery) {

    imageGallery.innerHTML = "";

    const thumb = document.createElement("img");

    thumb.src = image;

    thumb.alt = currentProduct.name;

    thumb.addEventListener("click", () => {

        productImage.src = thumb.src;

    });

    imageGallery.appendChild(thumb);

}

}

// ==========================================
// Load Related Products
// ==========================================

async function loadRelatedProducts() {

    if (!relatedProducts) return;

    relatedProducts.innerHTML = "";

    try {

        const snapshot = await getDocs(collection(db, "products"));

        snapshot.forEach(docSnap => {

            const product = {

                id: docSnap.id,
                ...docSnap.data()

            };

            // Current Product Skip
            if (currentProduct && product.id === currentProduct.id) {

                return;

            }

            const card = document.createElement("div");

            card.className = "product-card";

            const image =
                product.image &&
                product.image.trim() !== ""
                    ? product.image
                    : "image/no-image.png";

            card.innerHTML = `

                <img
                    src="${image}"
                    alt="${product.name}"
                    onerror="this.src='image/no-image.png'">

                <h3>${product.name}</h3>

                <p>
                    ₹${Number(product.price || 0).toLocaleString("en-IN")}
                </p>

            `;

            card.style.cursor = "pointer";

            card.addEventListener("click", () => {

                window.location.href =
                    `product.html?id=${product.id}`;

            });

            relatedProducts.appendChild(card);

        });

    }

    catch (error) {

        console.error("Related Products Error :", error);

    }

}
// ==========================================
// Add To Cart
// ==========================================

const addCartBtn = document.getElementById("add-cart-btn");

if (addCartBtn) {

    addCartBtn.addEventListener("click", () => {

        if (!currentProduct) return;

        let cart =
            JSON.parse(localStorage.getItem("cart")) || [];

        const existing =
            cart.find(item => item.id === currentProduct.id);

        if (existing) {

    existing.qty += quantity;

} else {

            cart.push({

                id: currentProduct.id,
                name: currentProduct.name,
                price: Number(currentProduct.price || 0),
                image: currentProduct.image || "image/no-image.png",
                qty: quantity

            });

        }

        localStorage.setItem("cart", JSON.stringify(cart));

        alert(currentProduct.name + " added to cart.");

    });

}

// ==========================================
// Buy Now
// ==========================================

const buyNowBtn = document.getElementById("buy-now-btn");

if (buyNowBtn) {

    buyNowBtn.addEventListener("click", () => {

        if (addCartBtn) {

            addCartBtn.click();

        }

        window.location.href = "cart.html";

    });

}

// ==========================================
// Initialize Page
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

    loadProduct();

});

// ==========================================
// Console
// ==========================================

console.log("================================");
console.log("Garima's House Hold");
console.log("Product Page Ready");
console.log("Product ID :", productId);
console.log("================================");
