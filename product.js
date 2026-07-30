// ===========================================
// Garima's House Hold
// product.js
// ===========================================

import { db } from "./firebase.js";

import {
    doc,
    getDoc,
    collection,
    getDocs,
    addDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


// ===========================================
// GET PRODUCT ID
// ===========================================

const params = new URLSearchParams(window.location.search);

const productId = params.get("id");


// ===========================================
// HTML ELEMENTS
// ===========================================

const productName = document.getElementById("product-name");
const productPrice = document.querySelector(".sale-price");
const productMRP = document.querySelector(".mrp");
const discount = document.querySelector(".discount");

const badge = document.querySelector(".badge");

const stock = document.querySelector(".stock");

const description = document.getElementById("product-description");

const shortDescription = document.getElementById("short-description");

const category = document.getElementById("category");

const brand = document.getElementById("brand");

const sku = document.getElementById("sku");

const mainImage = document.getElementById("main-product-image");

const thumbnails = document.querySelector(".thumbnail-gallery");


// ===========================================
// LOAD PRODUCT
// ===========================================

async function loadProduct() {

    if (!productId) {

        alert("Product not found.");

        return;

    }

    try {

        const productRef = doc(db, "products", productId);

        const snapshot = await getDoc(productRef);

        if (!snapshot.exists()) {

            alert("Product not available.");

            return;

        }

        const product = snapshot.data();

        showProduct(product);

        loadRelatedProducts(product.category);

    }

    catch (error) {

        console.error(error);

    }

}


// ===========================================
// SHOW PRODUCT
// ===========================================

function showProduct(product) {

    document.title =
        product.name + " | Garima's House Hold";

    productName.textContent = product.name;

    productPrice.textContent =
        "₹" + product.price;

    productMRP.textContent =
        "₹" + (product.mrp || product.price);

    badge.textContent =
        product.badge || "Best Seller";

    description.textContent =
        product.description || "";

    shortDescription.textContent =
        product.shortDescription || "";

    brand.textContent =
        product.brand || "Garima's House Hold";

    category.textContent =
        product.category || "";

    sku.textContent =
        product.sku || "-";

    if (product.stock > 0) {

        stock.innerHTML =
            "✔ In Stock";

    } else {

        stock.innerHTML =
            "❌ Out of Stock";

    }

    if (product.images && product.images.length > 0) {

        mainImage.src =
            product.images[0];

        createThumbnails(product.images);

    }

}


// ===========================================
// CREATE THUMBNAILS
// ===========================================

function createThumbnails(images) {

    thumbnails.innerHTML = "";

    images.forEach((img, index) => {

        const image = document.createElement("img");

        image.src = img;

        image.className = "thumb";

        if (index === 0) {

            image.classList.add("active");

        }

        image.onclick = () => {

            mainImage.src = img;

            document
                .querySelectorAll(".thumb")
                .forEach(t => t.classList.remove("active"));

            image.classList.add("active");

        };

        thumbnails.appendChild(image);

    });

}


// ===========================================
// START
// ===========================================

loadProduct();
// ===========================================
// QUANTITY
// ===========================================

const qtyInput = document.getElementById("qty");
const plusBtn = document.getElementById("plus");
const minusBtn = document.getElementById("minus");

plusBtn?.addEventListener("click", () => {

    qtyInput.value = Number(qtyInput.value) + 1;

});

minusBtn?.addEventListener("click", () => {

    if (Number(qtyInput.value) > 1) {

        qtyInput.value = Number(qtyInput.value) - 1;

    }

});


// ===========================================
// ADD TO CART
// ===========================================

const addCartBtn = document.getElementById("add-cart");

addCartBtn?.addEventListener("click", async () => {

    const cart = JSON.parse(localStorage.getItem("cart")) || [];

    const item = {

        id: productId,

        name: productName.textContent,

        price: Number(productPrice.textContent.replace("₹","")),

        image: mainImage.src,

        qty: Number(qtyInput.value)

    };

    const existing = cart.find(p => p.id === item.id);

    if(existing){

        existing.qty += item.qty;

    }else{

        cart.push(item);

    }

    localStorage.setItem("cart", JSON.stringify(cart));

    alert("Product Added To Cart");

});


// ===========================================
// BUY NOW
// ===========================================

const buyNow = document.getElementById("buy-now");

buyNow?.addEventListener("click", () => {

    addCartBtn.click();

    window.location.href = "cart.html";

});


// ===========================================
// WISHLIST
// ===========================================

const wishlistBtn = document.getElementById("wishlist-btn");

wishlistBtn?.addEventListener("click",()=>{

    let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];

    const product = {

        id:productId,

        name:productName.textContent,

        image:mainImage.src,

        price:Number(productPrice.textContent.replace("₹",""))

    };

    if(!wishlist.find(p=>p.id===product.id)){

        wishlist.push(product);

    }

    localStorage.setItem("wishlist",JSON.stringify(wishlist));

    alert("Added To Wishlist");

});


// ===========================================
// SHARE
// ===========================================

const shareBtn = document.getElementById("share-btn");

shareBtn?.addEventListener("click",async()=>{

    if(navigator.share){

        await navigator.share({

            title:productName.textContent,

            text:"Check this product",

            url:window.location.href

        });

    }

});


// ===========================================
// COPY LINK
// ===========================================

document.getElementById("copy-link")?.addEventListener("click",()=>{

    navigator.clipboard.writeText(window.location.href);

    alert("Product Link Copied");

});


// ===========================================
// WHATSAPP ORDER
// ===========================================

const whatsappBtn=document.getElementById("whatsapp-order");

whatsappBtn?.addEventListener("click",(e)=>{

    e.preventDefault();

    const message=

`Hello,

I want to order

${productName.textContent}

Price : ${productPrice.textContent}

Quantity : ${qtyInput.value}

Product Link :
${window.location.href}`;

    window.open(

`https://wa.me/919374445544?text=${encodeURIComponent(message)}`,

"_blank"

);

});


// ===========================================
// PIN CODE CHECK
// ===========================================

document.getElementById("check-pin")?.addEventListener("click",()=>{

    const pin=document.getElementById("pincode").value;

    const result=document.getElementById("delivery-result");

    if(pin.length!==6){

        result.innerHTML="❌ Invalid PIN Code";

        result.style.color="red";

        return;

    }

    result.innerHTML="✅ Delivery Available";

    result.style.color="green";

});
// ===========================================
// PRODUCT TABS
// ===========================================

const tabButtons = document.querySelectorAll(".tab-btn");
const tabContents = document.querySelectorAll(".tab-content");

tabButtons.forEach(button => {

    button.addEventListener("click", () => {

        tabButtons.forEach(btn => btn.classList.remove("active"));
        tabContents.forEach(tab => tab.classList.remove("active"));

        button.classList.add("active");

        const tabId = button.dataset.tab;

        document.getElementById(tabId)?.classList.add("active");

    });

});



// ===========================================
// IMAGE PREVIEW
// ===========================================

const previewBox = document.getElementById("image-preview");
const previewImage = document.getElementById("preview-image");
const closePreview = document.getElementById("close-preview");

mainImage?.addEventListener("click", () => {

    previewImage.src = mainImage.src;

    previewBox.style.display = "flex";

});

closePreview?.addEventListener("click", () => {

    previewBox.style.display = "none";

});

previewBox?.addEventListener("click", (e) => {

    if (e.target === previewBox) {

        previewBox.style.display = "none";

    }

});



// ===========================================
// BACK TO TOP
// ===========================================

const backToTop = document.getElementById("backToTop");

window.addEventListener("scroll", () => {

    if (window.scrollY > 300) {

        backToTop.style.display = "block";

    } else {

        backToTop.style.display = "none";

    }

});

backToTop?.addEventListener("click", () => {

    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });

});



// ===========================================
// LOADER
// ===========================================

window.addEventListener("load", () => {

    const loader = document.getElementById("loader");

    if (loader) {

        loader.style.display = "none";

    }

});



// ===========================================
// RECENTLY VIEWED
// ===========================================

function saveRecentlyViewed() {

    let recent = JSON.parse(localStorage.getItem("recentProducts")) || [];

    recent = recent.filter(item => item.id !== productId);

    recent.unshift({

        id: productId,

        name: productName.textContent,

        price: Number(productPrice.textContent.replace("₹", "")),

        image: mainImage.src

    });

    recent = recent.slice(0, 10);

    localStorage.setItem("recentProducts", JSON.stringify(recent));

}

saveRecentlyViewed();



// ===========================================
// PHOTO PREVIEW
// ===========================================

const photoInput = document.getElementById("custom-photo");

photoInput?.addEventListener("change", function () {

    const file = this.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = function (e) {

        previewImage.src = e.target.result;

        previewBox.style.display = "flex";

    };

    reader.readAsDataURL(file);

});



// ===========================================
// LOAD RELATED PRODUCTS
// ===========================================

async function loadRelatedProducts(productCategory) {

    const container = document.getElementById("related-products");

    if (!container) return;

    container.innerHTML = "";

    try {

        const snapshot = await getDocs(collection(db, "products"));

        snapshot.forEach(docItem => {

            const data = docItem.data();

            if (
                data.category === productCategory &&
                docItem.id !== productId
            ) {

                container.innerHTML += `

<div class="product-card">

<img src="${data.images?.[0] || ''}" alt="${data.name}">

<div class="product-card-content">

<h3>${data.name}</h3>

<p>₹${data.price}</p>

<button onclick="location.href='product.html?id=${docItem.id}'">

View Product

</button>

</div>

</div>

`;

            }

        });

    }

    catch (error) {

        console.error("Related Products Error:", error);

    }

}
// ===========================================
// FIREBASE REVIEWS
// ===========================================

async function loadReviews() {

    const reviewContainer = document.getElementById("review-list");

    if (!reviewContainer) return;

    reviewContainer.innerHTML = "";

    try {

        const snapshot = await getDocs(collection(db, "reviews"));

        snapshot.forEach((reviewDoc) => {

            const review = reviewDoc.data();

            if (review.productId !== productId) return;

            reviewContainer.innerHTML += `

<div class="review-card">

<h4>${review.name}</h4>

<p>⭐⭐⭐⭐⭐</p>

<p>${review.message}</p>

<small>${new Date(review.createdAt?.seconds * 1000 || Date.now()).toLocaleDateString()}</small>

</div>

`;

        });

    } catch (error) {

        console.error("Review Load Error:", error);

    }

}



// ===========================================
// SUBMIT REVIEW
// ===========================================

document.getElementById("submit-review")?.addEventListener("click", async () => {

    const name = document.getElementById("review-name").value.trim();

    const message = document.getElementById("review-message").value.trim();

    if (!name || !message) {

        alert("Please fill all fields.");

        return;

    }

    try {

        await addDoc(collection(db, "reviews"), {

            productId,

            name,

            message,

            createdAt: serverTimestamp()

        });

        alert("Review Submitted Successfully");

        document.getElementById("review-name").value = "";

        document.getElementById("review-message").value = "";

        loadReviews();

    } catch (error) {

        console.error(error);

        alert("Unable to submit review.");

    }

});



// ===========================================
// SEARCH
// ===========================================

const searchBox = document.querySelector(".search input");

searchBox?.addEventListener("keypress", (e) => {

    if (e.key === "Enter") {

        const keyword = searchBox.value.trim();

        if (keyword) {

            window.location.href = `index.html?search=${encodeURIComponent(keyword)}`;

        }

    }

});



// ===========================================
// CART COUNT
// ===========================================

function updateCartCount() {

    const cart = JSON.parse(localStorage.getItem("cart")) || [];

    const total = cart.reduce((sum, item) => sum + item.qty, 0);

    const cartCount = document.getElementById("cart-count");

    if (cartCount) {

        cartCount.textContent = total;

    }

}



// ===========================================
// WISHLIST COUNT
// ===========================================

function updateWishlistCount() {

    const wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];

    const wishlistCount = document.getElementById("wishlist-count");

    if (wishlistCount) {

        wishlistCount.textContent = wishlist.length;

    }

}



// ===========================================
// FREQUENTLY BOUGHT TOGETHER
// ===========================================

async function loadComboProducts() {

    const comboContainer = document.getElementById("combo-products");

    if (!comboContainer) return;

    comboContainer.innerHTML = "";

    try {

        const snapshot = await getDocs(collection(db, "products"));

        let count = 0;

        snapshot.forEach((docItem) => {

            if (count >= 4) return;

            const product = docItem.data();

            if (docItem.id === productId) return;

            comboContainer.innerHTML += `

<div class="product-card">

<img src="${product.images?.[0] || ''}" alt="${product.name}">

<div class="product-card-content">

<h3>${product.name}</h3>

<p>₹${product.price}</p>

<button onclick="location.href='product.html?id=${docItem.id}'">

View Product

</button>

</div>

</div>

`;

            count++;

        });

    } catch (error) {

        console.error("Combo Products Error:", error);

    }

}



// ===========================================
// INITIALIZE
// ===========================================

window.addEventListener("DOMContentLoaded", () => {

    loadReviews();

    loadComboProducts();

    updateCartCount();

    updateWishlistCount();

});



// ===========================================
// EXPORT (Optional)
// ===========================================

export {

    loadProduct,

    loadRelatedProducts,

    loadReviews

};
