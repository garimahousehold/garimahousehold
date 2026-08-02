// ==========================================
// Garima's House Hold
// script.js
// ==========================================

// ===============================
// FIREBASE
// ===============================

import { db } from "./firebase.js";

import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

// ===============================
// GLOBAL VARIABLES
// ===============================

let products = [];

let cart = JSON.parse(
    localStorage.getItem("cart")
) || [];

let wishlist = JSON.parse(
    localStorage.getItem("wishlist")
) || [];

// ===============================
// HTML ELEMENTS
// ===============================

const productGrid =
document.getElementById("products-grid");

const bestSellerGrid =
document.getElementById("bestSellerProducts");

const newArrivalGrid =
document.getElementById("newArrivalProducts");

const trendingGrid =
document.getElementById("trendingProducts");

const cartCount =
document.getElementById("cartCount");

const wishlistCount =
document.getElementById("wishlistCount");

// ===============================
// UPDATE COUNTS
// ===============================

function updateCartCount(){

    if(!cartCount) return;

    let total = 0;

    cart.forEach(item=>{

        total += item.qty || 1;

    });

    cartCount.textContent = total;

}

function updateWishlistCount(){

    if(!wishlistCount) return;

    wishlistCount.textContent =
    wishlist.length;

}

updateCartCount();

updateWishlistCount();

// ===============================
// LOADER
// ===============================

window.addEventListener("load",()=>{

    const loader =
    document.getElementById("loader");

    if(loader){

        loader.style.display="none";

    }

});
// ==========================================
// HERO SLIDER
// ==========================================

const slides =
document.querySelectorAll(".slide");

const dots =
document.querySelectorAll(".dot");

let currentSlide = 0;

function showSlide(index){

    slides.forEach(slide=>{

        slide.classList.remove("active");

    });

    dots.forEach(dot=>{

        dot.classList.remove("active");

    });

    if(slides[index]){

        slides[index].classList.add("active");

    }

    if(dots[index]){

        dots[index].classList.add("active");

    }

}

function autoSlide(){

    currentSlide++;

    if(currentSlide >= slides.length){

        currentSlide = 0;

    }

    showSlide(currentSlide);

}

if(slides.length){

    showSlide(0);

    setInterval(autoSlide,4000);

}

// ==========================================
// LOAD PRODUCTS
// ==========================================

async function loadProducts(){

    try{

        const snapshot = await getDocs(
            collection(db,"products")
        );

        products = [];

        snapshot.forEach(doc=>{

            products.push({

                id:doc.id,

                ...doc.data()

            });

        });

        console.log(
            "Products Loaded :",
            products.length
        );

        renderFeaturedProducts();
        
        renderHomeSections();

    }

    catch(error){

        console.error(
            "Error Loading Products",
            error
        );

    }

}

loadProducts();

// ==========================================
// FEATURED PRODUCTS
// ==========================================

function renderFeaturedProducts() {

    if(!productGrid) return;

    productGrid.innerHTML = "";

    const featured = products.filter(product => product.active === true);

    featured.forEach(product=>{

        productGrid.appendChild(

            createProductCard(product)

        );

    });

}

// ==========================================
// PRODUCT CARD
// ==========================================

function createProductCard(product){

    const card =

    document.createElement("div");

    card.className="product-card";

    card.innerHTML=`

        <div class="product-card-image">

            <img
            src="${product.image}"
            alt="${product.name}">

        </div>

        <div class="product-content">

            <div class="product-top">

                <span class="product-category">

                    ${product.category}

                </span>

                <button

class="wishlist-icon ${wishlist.includes(product.id) ? 'active' : ''}"

onclick="event.stopPropagation();toggleWishlist('${product.id}')">

${wishlist.includes(product.id) ? '❤' : '🤍'}

</button>

            </div>

            <h3 class="product-title">

                ${product.name}

            </h3>

            <p class="product-sku">

                SKU : ${product.sku}

            </p>

            <div class="price-box">

                <span class="price">

                    ₹${product.price}

                </span>

                <span class="mrp">

                    ₹${product.mrp}

                </span>

            </div>

            <div class="product-buttons">

               <button

class="btn-cart"

id="cartBtn-${product.id}"

onclick="event.stopPropagation();addToCart('${product.id}')">

Add To Cart

</button>
               <button

class="btn-buy"

onclick="event.stopPropagation();buyNow('${product.id}')">

Buy Now

</button>

            </div>

        </div>

    `;

    return card;

}
// ==========================================
// HOME PAGE SECTIONS
// ==========================================

function renderHomeSections(){

    renderSection(

        bestSellerGrid,

        "bestSeller"

    );

    renderSection(

        newArrivalGrid,

        "newArrival"

    );

    renderSection(

        trendingGrid,

        "trending"

    );

}

// ==========================================
// COMMON SECTION FUNCTION
// ==========================================

function renderSection(

    container,

    field

){

    if(!container) return;

    container.innerHTML = "";

    const filteredProducts =

    products.filter(product=>{

        return product[field] === true;

    });

    filteredProducts.forEach(product=>{

        container.appendChild(

            createProductCard(product)

        );

    });

}
// ==========================================
// ADD TO CART
// ==========================================

window.addToCart = function(productId){

    const product = products.find(p=>p.id===productId);

    if(!product) return;

    const existing = cart.find(item=>item.id===productId);

    if(existing){

        existing.qty++;

    }else{

        cart.push({

            id:product.id,

            sku:product.sku,

            name:product.name,

            image:product.image,

            price:product.price,

            qty:1

        });

    }

    localStorage.setItem(

        "cart",

        JSON.stringify(cart)

    );

    updateCartCount();

    showToast(

"Added To Cart",

product.name+" added successfully."

);
const btn = document.getElementById(`cartBtn-${productId}`);

if(btn){

    btn.innerHTML = "✓ Added";

    btn.style.background = "#1BA94C";

    setTimeout(()=>{

        btn.innerHTML = "Add To Cart";

        btn.style.background = "";

    },1500);

}
};

// ==========================================
// WISHLIST
// ==========================================

window.toggleWishlist = function(productId){

    const index = wishlist.indexOf(productId);

    if(index>-1){

        wishlist.splice(index,1);

        showToast(
            "Wishlist",
            "Removed from wishlist"
        );

    }else{

        wishlist.push(productId);

        showToast(
            "Wishlist",
            "Added to wishlist"
        );

    }

    localStorage.setItem(
        "wishlist",
        JSON.stringify(wishlist)
    );

    updateWishlistCount();

    renderFeaturedProducts();

    renderHomeSections();

}

// ==========================================
// BUY NOW
// ==========================================

window.buyNow = function(productId){

    addToCart(productId);

    window.location.href = "cart.html";

};
// ==========================================
// LIVE SEARCH
// ==========================================

const searchInput =
document.getElementById("searchInput");

if(searchInput){

    searchInput.addEventListener("input",()=>{

        const keyword =

        searchInput.value
        .trim()
        .toLowerCase();

        if(keyword===""){

            renderFeaturedProducts();

            renderHomeSections();

            return;

        }

        const filtered = products.filter(product=>{

            return(

                product.name?.toLowerCase().includes(keyword)

                ||

                product.sku?.toLowerCase().includes(keyword)

                ||

                product.category?.toLowerCase().includes(keyword)

            );

        });

        if(productGrid){

            productGrid.innerHTML="";

            filtered.forEach(product=>{

                productGrid.appendChild(

                    createProductCard(product)

                );

            });

        }

    });

}

// ==========================================
// MOBILE MENU
// ==========================================

const menuBtn =
document.getElementById("menuBtn");

const navbar =
document.querySelector(".navbar");

if(menuBtn && navbar){

    menuBtn.addEventListener("click",()=>{

        navbar.classList.toggle("active");

    });

}

// ==========================================
// SCROLL TO TOP
// ==========================================

const scrollBtn =
document.getElementById("scrollTop");

window.addEventListener("scroll",()=>{

    if(!scrollBtn) return;

    if(window.scrollY>300){

        scrollBtn.style.display="flex";

    }

    else{

        scrollBtn.style.display="none";

    }

});

if(scrollBtn){

    scrollBtn.addEventListener("click",()=>{

        window.scrollTo({

            top:0,

            behavior:"smooth"

        });

    });

}

// ==========================================
// SLIDER DOTS
// ==========================================

dots.forEach((dot,index)=>{

    dot.addEventListener("click",()=>{

        currentSlide=index;

        showSlide(index);

    });

});

// ==========================================
// FINAL INITIALIZE
// ==========================================

document.addEventListener("DOMContentLoaded",()=>{

    updateCartCount();

    updateWishlistCount();

    console.log("✅ Garima's House Hold Ready");

});
//==========================
// TOAST
//==========================

function showToast(

title,

message

){

const toast=

document.getElementById("toast");

document.getElementById("toastTitle").innerHTML=title;

document.getElementById("toastMessage").innerHTML=message;

toast.classList.add("show");

setTimeout(()=>{

toast.classList.remove("show");

},3000);

}