// ==========================================
// Garima's House Hold - Cart
// Fixed: Empty cart must always show ₹0 delivery and ₹0 total
// ==========================================

let cart = JSON.parse(localStorage.getItem("cart")) || [];

const cartContainer = document.getElementById("cartContainer");
const subtotalElement = document.getElementById("subtotal");
const deliveryElement = document.getElementById("delivery");
const discountElement = document.getElementById("discount");
const grandTotalElement = document.getElementById("grandTotal");
const checkoutBtn = document.getElementById("checkoutBtn");

const DELIVERY_CHARGE = 50;
const FREE_DELIVERY_LIMIT = 999;

function saveCart() {
    localStorage.setItem("cart", JSON.stringify(cart));
}

function getSubtotal() {
    return cart.reduce((total, item) => {
        return total + (Number(item.price) || 0) * (Number(item.qty) || 1);
    }, 0);
}

function updateSummary() {
    const subtotal = getSubtotal();

    // IMPORTANT: Empty cart = no delivery charge.
    let delivery = 0;

    if (subtotal > 0) {
        delivery = subtotal >= FREE_DELIVERY_LIMIT ? 0 : DELIVERY_CHARGE;
    }

    // Keep discount at zero for now; coupon system can update this later.
    const discount = 0;
    const grandTotal = Math.max(0, subtotal + delivery - discount);

    if (subtotalElement) {
        subtotalElement.innerText = "₹" + subtotal.toLocaleString("en-IN");
    }

    if (deliveryElement) {
        deliveryElement.innerText = "₹" + delivery.toLocaleString("en-IN");
    }

    if (discountElement) {
        discountElement.innerText = "₹" + discount.toLocaleString("en-IN");
    }

    if (grandTotalElement) {
        grandTotalElement.innerText = "₹" + grandTotal.toLocaleString("en-IN");
    }
}

function loadCart() {
    if (!cartContainer) return;

    cartContainer.innerHTML = "";

    if (!Array.isArray(cart) || cart.length === 0) {
        cart = [];
        saveCart();

        cartContainer.innerHTML = `
            <div class="empty-cart">
                <h2>Your Cart is Empty 🛒</h2>
            </div>
        `;

        // Reset ALL summary values when cart is empty.
        if (subtotalElement) subtotalElement.innerText = "₹0";
        if (deliveryElement) deliveryElement.innerText = "₹0";
        if (discountElement) discountElement.innerText = "₹0";
        if (grandTotalElement) grandTotalElement.innerText = "₹0";

        if (checkoutBtn) {
            checkoutBtn.disabled = true;
            checkoutBtn.style.opacity = "0.5";
            checkoutBtn.style.cursor = "not-allowed";
        }

        return;
    }

    cart.forEach((item) => {
        const qty = Number(item.qty) || 1;
        const price = Number(item.price) || 0;
        const itemTotal = price * qty;

        const card = document.createElement("div");
        card.className = "cart-card";

        card.innerHTML = `
            <img
                src="${item.image || "image/no-image.png"}"
                alt="${item.name || "Product"}"
                onerror="this.src='image/no-image.png'"
            >

            <div class="cart-details">
                <h3>${item.name || "Product"}</h3>

                <p>
                    Price : ₹${price.toLocaleString("en-IN")}
                </p>

                <div class="qty-box">
                    <button type="button" onclick="decreaseQty('${item.id}')">−</button>
                    <span>${qty}</span>
                    <button type="button" onclick="increaseQty('${item.id}')">+</button>
                </div>

                <p>
                    Subtotal : ₹${itemTotal.toLocaleString("en-IN")}
                </p>

                <button
                    type="button"
                    class="remove-btn"
                    onclick="removeFromCart('${item.id}')">
                    Remove
                </button>
            </div>
        `;

        cartContainer.appendChild(card);
    });

    updateSummary();

    if (checkoutBtn) {
        checkoutBtn.disabled = false;
        checkoutBtn.style.opacity = "1";
        checkoutBtn.style.cursor = "pointer";
    }
}

function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    saveCart();
    loadCart();
}

function increaseQty(id) {
    const item = cart.find(item => item.id === id);
    if (!item) return;

    item.qty = (Number(item.qty) || 1) + 1;
    saveCart();
    loadCart();
}

function decreaseQty(id) {
    const item = cart.find(item => item.id === id);
    if (!item) return;

    if ((Number(item.qty) || 1) > 1) {
        item.qty--;
    } else {
        cart = cart.filter(cartItem => cartItem.id !== id);
    }

    saveCart();
    loadCart();
}

function checkout() {
    if (cart.length === 0) {
        alert("Your cart is empty.");
        return;
    }

    window.location.href = "checkout.html";
}

if (checkoutBtn) {
    checkoutBtn.addEventListener("click", checkout);
}

// Keep cart page in sync if cart changes in another browser tab.
window.addEventListener("storage", (event) => {
    if (event.key === "cart") {
        cart = JSON.parse(localStorage.getItem("cart")) || [];
        loadCart();
    }
});

window.addEventListener("pageshow", () => {
    cart = JSON.parse(localStorage.getItem("cart")) || [];
    loadCart();
});

loadCart();
