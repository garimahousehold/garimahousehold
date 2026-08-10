import { db } from "./firebase.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

let products = [];
let currentCategory = "All";
let cart = JSON.parse(localStorage.getItem("cart") || "[]");

const productGrid = document.getElementById("product-grid");
const searchInput = document.getElementById("search");
const cartCount = document.getElementById("cart-count");
const wishlistCount = document.getElementById("wishlist-count");

function getWishlist() {
  return JSON.parse(localStorage.getItem("wishlist") || "[]");
}
function saveWishlist(list) {
  localStorage.setItem("wishlist", JSON.stringify(list));
}
function updateBadges() {
  if (cartCount) {
    const total = cart.reduce((sum, item) => sum + Number(item.qty ?? item.quantity ?? 1), 0);
    cartCount.textContent = total;
  }
  if (wishlistCount) wishlistCount.textContent = getWishlist().length;
}
function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
  updateBadges();
}

function money(value) {
  return Number(value || 0).toLocaleString("en-IN");
}

function renderProducts(list) {
  if (!productGrid) return;
  productGrid.innerHTML = "";

  if (!list.length) {
    productGrid.innerHTML = `<div class="no-products"><h3>No Products Found</h3><p>Try another category or search.</p></div>`;
    return;
  }

  list.forEach(product => {
    const card = document.createElement("article");
    card.className = "product-card";

    const price = Number(product.price || 0);
    const mrp = Number(product.mrp || price);
    const discount = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;
    const image = product.image?.trim() || "image/no-image.png";

    card.innerHTML = `
      <div class="wishlist-icon" title="Wishlist">${getWishlist().includes(product.id) ? "♥" : "♡"}</div>
      <img class="product-img" src="${image}" alt="${product.name || "Product"}" loading="lazy"
           onerror="this.onerror=null;this.src='image/no-image.png'">
      <div class="product-info">
        <h3>${product.name || "Product"}</h3>
        <div class="price">
          ₹${money(price)}
          ${mrp > price ? `<span class="mrp">MRP ₹${money(mrp)}</span><span class="discount">${discount}% OFF</span>` : ""}
        </div>
        ${Number(product.stock ?? 1) > 0
          ? `<button class="add-cart" data-id="${product.id}" type="button">Add To Cart</button>`
          : `<button class="out-stock-btn" disabled>Out Of Stock</button>`}
      </div>
    `;

    card.addEventListener("click", e => {
      if (e.target.closest("button,.wishlist-icon")) return;
      window.location.href = `product.html?id=${encodeURIComponent(product.id)}`;
    });

    card.querySelector(".wishlist-icon").addEventListener("click", e => {
      e.stopPropagation();
      let list = getWishlist();
      if (list.includes(product.id)) list = list.filter(id => id !== product.id);
      else list.push(product.id);
      saveWishlist(list);
      updateBadges();
      e.currentTarget.textContent = list.includes(product.id) ? "♥" : "♡";
    });

    card.querySelector(".add-cart")?.addEventListener("click", e => {
      e.stopPropagation();
      const existing = cart.find(item => item.id === product.id);
      if (existing) existing.qty = Number(existing.qty || 1) + 1;
      else cart.push({
        id: product.id,
        name: product.name,
        price,
        mrp,
        image,
        qty: 1,
        weight: Number(product.weight || 1)
      });
      saveCart();
      const btn = e.currentTarget;
      btn.textContent = "✓ Added";
      setTimeout(() => btn.textContent = "Add To Cart", 900);
    });

    productGrid.appendChild(card);
  });
}

async function loadProducts() {
  try {
    const snapshot = await getDocs(collection(db, "products"));
    products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    renderProducts(products);
  } catch (error) {
    console.error("Products Error:", error);
    if (productGrid) productGrid.innerHTML = `<div class="no-products"><h3>Unable to load products</h3><p>Please check Firebase connection.</p></div>`;
  }
}

function filterProducts() {
  const keyword = (searchInput?.value || "").toLowerCase().trim();
  let list = currentCategory === "All" ? [...products] : products.filter(p => String(p.category || "") === currentCategory);
  if (keyword) {
    list = list.filter(p =>
      String(p.name || "").toLowerCase().includes(keyword) ||
      String(p.category || "").toLowerCase().includes(keyword)
    );
  }
  renderProducts(list);
}

document.querySelectorAll(".filter-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentCategory = btn.dataset.category || "All";
    filterProducts();
  });
});

searchInput?.addEventListener("input", filterProducts);
document.getElementById("searchBtn")?.addEventListener("click", filterProducts);

document.getElementById("newsletterForm")?.addEventListener("submit", e => {
  e.preventDefault();
  alert("Thank you for subscribing!");
  e.target.reset();
});


// Banner image fallback: keep the exact user-provided paths first, then try common file extensions.
function setupBannerFallbacks() {
  document.querySelectorAll('.slide img[data-image-base]').forEach((img) => {
    const base = img.dataset.imageBase;
    const extensions = ['.png', '.jpg', '.jpeg', '.webp'];
    let i = 0;
    img.addEventListener('error', function handleError() {
      if (i >= extensions.length) {
        img.removeEventListener('error', handleError);
        return;
      }
      img.src = base + extensions[i++];
    });
  });
}
setupBannerFallbacks();

let slideIndex = 0;
const slides = document.querySelector(".slides");
const dots = document.getElementById("sliderDots");

function setupSlider() {
  if (!slides || !dots) return;
  const count = slides.children.length;
  dots.innerHTML = "";
  for (let i = 0; i < count; i++) {
    const dot = document.createElement("button");
    dot.className = i === 0 ? "active" : "";
    dot.addEventListener("click", () => goToSlide(i));
    dots.appendChild(dot);
  }
}
function goToSlide(index) {
  if (!slides) return;
  slideIndex = (index + slides.children.length) % slides.children.length;
  slides.style.transform = `translateX(-${slideIndex * 100}%)`;
  dots?.querySelectorAll("button").forEach((d, i) => d.classList.toggle("active", i === slideIndex));
}
document.getElementById("prevSlide")?.addEventListener("click", () => goToSlide(slideIndex - 1));
document.getElementById("nextSlide")?.addEventListener("click", () => goToSlide(slideIndex + 1));
setInterval(() => goToSlide(slideIndex + 1), 5000);

window.addEventListener("storage", () => {
  cart = JSON.parse(localStorage.getItem("cart") || "[]");
  updateBadges();
});
window.addEventListener("pageshow", updateBadges);

setupSlider();
updateBadges();
loadProducts();
