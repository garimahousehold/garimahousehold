// ==========================================
// Garima's House Hold
// cart.js
// ==========================================

const cartItems = document.getElementById("cartContainer");
const totalElement = document.getElementById("grandTotal");
const subtotalElement = document.getElementById("subtotal");
const deliveryElement = document.getElementById("delivery");
const discountElement = document.getElementById("discount");

let cart = JSON.parse(localStorage.getItem("cart")) || [];

function loadCart() {

    cartItems.innerHTML = "";

    let grandTotal = 0;

    if (cart.length === 0) {

        cartItems.innerHTML = `
            <h2 style="text-align:center;">
                Your Cart is Empty 🛒
            </h2>
        `;

        totalElement.innerText = "₹0";

        return;
    }

    cart.forEach((item, index) => {

        const total = item.price * item.qty;

        grandTotal += total;

        const div = document.createElement("div");

        div.className = "cart-item";

        div.innerHTML = `

            <img src="${item.image}"
                 alt="${item.name}"
                 

            <div class="cart-info">

                <h3>${item.name}</h3>

                <p>Price : ₹${item.price}</p>

                <div class="qty-box">

    <button onclick="decreaseQty(${index})">−</button>

    <span>${item.qty}</span>

    <button onclick="increaseQty(${index})">+</button>

</div>

                <h4>Total : ₹${total}</h4>

                <button onclick="removeItem(${index})">
                    Remove
                </button>

            </div>

        `;

        cartItems.appendChild(div);

    });

    let delivery = grandTotal > 0 ? 50 : 0;
let discount = 0;

subtotalElement.innerText = "₹" + grandTotal.toLocaleString("en-IN");
deliveryElement.innerText = "₹" + delivery;
discountElement.innerText = "₹" + discount;

totalElement.innerText =
"₹" + (grandTotal + delivery - discount).toLocaleString("en-IN");

}
function removeItem(index) {

    cart.splice(index, 1);

    localStorage.setItem("cart", JSON.stringify(cart));

    loadCart();

}

window.removeItem = removeItem;

loadCart();
function increaseQty(index){

    cart[index].qty++;

    localStorage.setItem("cart", JSON.stringify(cart));

    loadCart();

}

function decreaseQty(index){

    if(cart[index].qty > 1){

        cart[index].qty--;

    }else{

        cart.splice(index,1);

    }

    localStorage.setItem("cart", JSON.stringify(cart));

    loadCart();

}

window.increaseQty = increaseQty;
window.decreaseQty = decreaseQty;
window.addEventListener("load", () => {
    const loader = document.getElementById("loader");
    if (loader) {
        loader.style.display = "none";
    }
});
// =========================
// Proceed To Checkout
// =========================

const checkoutBtn = document.getElementById("checkoutBtn");

if (checkoutBtn) {
    checkoutBtn.addEventListener("click", () => {

        if (cart.length === 0) {
            alert("Your cart is empty.");
            return;
        }

        window.location.href = "checkout.html";
    });
}