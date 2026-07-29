// ==========================================
// Garima's House Hold
// cart.js
// ==========================================

const cartItems = document.getElementById("cart-items");
const totalElement = document.getElementById("total");

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

        totalElement.innerText = "0";

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
                 onerror="this.src='image/no-image.png'">

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

    totalElement.innerText = grandTotal.toLocaleString("en-IN");

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
