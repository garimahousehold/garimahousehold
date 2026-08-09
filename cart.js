// ==========================================
// Garima's House Hold - Cart
// ==========================================

let cart = JSON.parse(localStorage.getItem("cart")) || [];

const cartContainer = document.getElementById("cartContainer");
const subtotalElement = document.getElementById("subtotal");
const deliveryElement = document.getElementById("delivery");
const discountElement = document.getElementById("discount");
const grandTotalElement = document.getElementById("grandTotal");
const checkoutBtn = document.getElementById("checkoutBtn");

const DELIVERY_CHARGE = 50;

function saveCart(){
  localStorage.setItem("cart", JSON.stringify(cart));
}

function money(value){
  return "₹" +  Number(value || 0).toLocaleString("en-IN");
}

function getSubtotal(){
  return cart.reduce((sum,item) =>
    sum + (Number(item.price) || 0) * (Number(item.qty) || 0), 0);
}

function updateSummary(){
  const subtotal = getSubtotal();
  const delivery = cart.length ? DELIVERY_CHARGE : 0;
  const discount = 0;
  const total = subtotal + delivery - discount;

  if(subtotalElement) subtotalElement.textContent = money(subtotal);
  if(deliveryElement) deliveryElement.textContent = money(delivery);
  if(discountElement) discountElement.textContent = money(discount);
  if(grandTotalElement) grandTotalElement.textContent = money(total);
}

function loadCart(){
  if(!cartContainer) return;

  cartContainer.innerHTML = "";

  if(cart.length === 0){
    cartContainer.innerHTML = `
      <div class="empty-cart">
        <h2>Your Cart is Empty 🛒</h2>
        <p style="margin-top:10px;color:#666;">Add products to your cart to continue.</p>
      </div>`;
    updateSummary();
    return;
  }

  cart.forEach((item,index)=>{
    const price = Number(item.price) || 0;
    const qty = Number(item.qty) || 1;
    const total = price * qty;

    const card = document.createElement("div");
    card.className = "cart-item";

    card.innerHTML = `
      <img
        src="${item.image || 'images/no-image.png'}"
        alt="${item.name || 'Product'}"
        onerror="this.src='images/no-image.png'"
      >
      <div class="cart-info">
        <h3>${item.name || 'Product'}</h3>
        <p>Price : ${money(price)}</p>

        <div class="qty-box">
          <button type="button" onclick="decreaseQty(${index})">−</button>
          <span>${qty}</span>
          <button type="button" onclick="increaseQty(${index})">+</button>
        </div>

        <h4>Total : ${money(total)}</h4>

        <button type="button" class="remove-btn" onclick="removeItem(${index})">
          Remove
        </button>
      </div>
    `;

    cartContainer.appendChild(card);
  });

  updateSummary();
}

function removeItem(index){
  cart.splice(index,1);
  saveCart();
  loadCart();
}

function increaseQty(index){
  if(!cart[index]) return;
  cart[index].qty = (Number(cart[index].qty) || 1) + 1;
  saveCart();
  loadCart();
}

function decreaseQty(index){
  if(!cart[index]) return;

  const qty = Number(cart[index].qty) || 1;

  if(qty > 1){
    cart[index].qty = qty - 1;
  }else{
    cart.splice(index,1);
  }

  saveCart();
  loadCart();
}

window.removeItem = removeItem;
window.increaseQty = increaseQty;
window.decreaseQty = decreaseQty;

if(checkoutBtn){
  checkoutBtn.addEventListener("click",()=>{
    if(cart.length === 0){
      alert("Your cart is empty.");
      return;
    }
    window.location.href = "checkout.html";
  });
}

document.addEventListener("DOMContentLoaded", loadCart);
loadCart();
