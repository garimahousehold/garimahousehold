/*==========================================================
        GARIMA'S HOUSE HOLD
        script.js (FINAL)
        PART - 1
==========================================================*/

"use strict";

/*==========================================================
        IMPORTS
==========================================================*/

import { db, auth } from "./firebase.js";

import {

    collection,
    getDocs,
    query,
    where,
    orderBy

} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";


/*==========================================================
        GLOBAL SELECTORS
==========================================================*/

const $ = (selector) => document.querySelector(selector);

const $$ = (selector) => document.querySelectorAll(selector);


/*==========================================================
        MAIN ELEMENTS
==========================================================*/

// Loader
const loader = $("#loader");

// Hero
const heroSection = $(".hero-section");
const slides = $$(".slide");
const dots = $$(".dot");
const prevBtn = $(".prev");
const nextBtn = $(".next");

// Search
const searchInput = $(".search-box input");

// Products
const productGrid =
    $("#productGrid") ||
    $("#featuredProducts .products-grid") ||
    $(".products-grid");

// Category
const categoryCards = $$("[data-category]");

// Header
const header = $(".header");

// Mobile Menu
const menuBtn = $("#menuBtn");
const mobileMenu = $("#mobileMenu");

// Back To Top
const backToTop = $("#backToTop");

// Cart
const cartCount =
    $("#cartCount") ||
    $("#cart-count");

// Wishlist
const wishlistCount =
    $("#wishlistCount") ||
    $("#wishlist-count");


/*==========================================================
        GLOBAL VARIABLES
==========================================================*/

let allProducts = [];

let filteredProducts = [];

let currentSlide = 0;

let sliderTimer = null;

let cart =
JSON.parse(localStorage.getItem("cart")) || [];

let wishlist =
JSON.parse(localStorage.getItem("wishlist")) || [];


/*==========================================================
        PAGE LOADER
==========================================================*/

window.addEventListener("load", () => {

    document.body.classList.add("loaded");

    if(loader){

        setTimeout(()=>{

            loader.style.display="none";

        },300);

    }

});


/*==========================================================
        UPDATE BADGES
==========================================================*/

function updateBadges(){

    if(cartCount){

        const totalItems = cart.reduce((total, item) => {

            return total + Number(
                item.qty ??
                item.quantity ??
                1
            );

        }, 0);

        cartCount.textContent = totalItems;

    }

    if(wishlistCount){

        wishlistCount.textContent = wishlist.length;

    }

}


/*==========================================================
        LOCAL STORAGE
==========================================================*/

function saveCart(){

    localStorage.setItem(

        "cart",

        JSON.stringify(cart)

    );

    updateBadges();

}


function saveWishlist(){

    localStorage.setItem(

        "wishlist",

        JSON.stringify(wishlist)

    );

    updateBadges();

}


/*==========================================================
        INITIAL SETUP
==========================================================*/

document.addEventListener(

    "DOMContentLoaded",

    ()=>{

        updateBadges();

    }

);
/*==========================================================
        HERO SLIDER (FINAL)
==========================================================*/

function showSlide(index){

    if(!slides.length) return;

    if(index >= slides.length){

        currentSlide = 0;

    }else if(index < 0){

        currentSlide = slides.length - 1;

    }else{

        currentSlide = index;

    }

    slides.forEach(slide=>{

        slide.classList.remove("active");

    });

    dots.forEach(dot=>{

        dot.classList.remove("active");

    });

    slides[currentSlide].classList.add("active");

    if(dots[currentSlide]){

        dots[currentSlide].classList.add("active");

    }

}


/*==========================================================
        NEXT / PREVIOUS
==========================================================*/

function nextSlide(){

    showSlide(currentSlide + 1);

}

function prevSlide(){

    showSlide(currentSlide - 1);

}


/*==========================================================
        AUTO SLIDER
==========================================================*/

function startSlider(){

    if(!slides.length) return;

    stopSlider();

    sliderTimer = setInterval(()=>{

        nextSlide();

    },5000);

}

function stopSlider(){

    if(sliderTimer){

        clearInterval(sliderTimer);

        sliderTimer = null;

    }

}


/*==========================================================
        BUTTON EVENTS
==========================================================*/

if(nextBtn){

    nextBtn.addEventListener("click",()=>{

        nextSlide();

        startSlider();

    });

}

if(prevBtn){

    prevBtn.addEventListener("click",()=>{

        prevSlide();

        startSlider();

    });

}


/*==========================================================
        DOT EVENTS
==========================================================*/

dots.forEach((dot,index)=>{

    dot.addEventListener("click",()=>{

        showSlide(index);

        startSlider();

    });

});


/*==========================================================
        HOVER PAUSE
==========================================================*/

if(heroSection){

    heroSection.addEventListener("mouseenter",()=>{

        stopSlider();

    });

    heroSection.addEventListener("mouseleave",()=>{

        startSlider();

    });

}


/*==========================================================
        TOUCH SWIPE
==========================================================*/

let touchStartX = 0;

let touchEndX = 0;

if(heroSection){

    heroSection.addEventListener("touchstart",(e)=>{

        touchStartX = e.changedTouches[0].screenX;

    });

    heroSection.addEventListener("touchend",(e)=>{

        touchEndX = e.changedTouches[0].screenX;

        const distance = touchStartX - touchEndX;

        if(Math.abs(distance) < 50) return;

        if(distance > 0){

            nextSlide();

        }else{

            prevSlide();

        }

        startSlider();

    });

}


/*==========================================================
        KEYBOARD CONTROL
==========================================================*/

document.addEventListener("keydown",(e)=>{

    if(!slides.length) return;

    if(e.key==="ArrowRight"){

        nextSlide();

        startSlider();

    }

    if(e.key==="ArrowLeft"){

        prevSlide();

        startSlider();

    }

});


/*==========================================================
        PAGE VISIBILITY
==========================================================*/

document.addEventListener("visibilitychange",()=>{

    if(document.hidden){

        stopSlider();

    }else{

        startSlider();

    }

});


/*==========================================================
        HERO INIT
==========================================================*/

function initHeroSlider(){

    if(!slides.length) return;

    showSlide(0);

    startSlider();

}

document.addEventListener("DOMContentLoaded",()=>{

    initHeroSlider();

});

/*==========================================================
        LOAD PRODUCTS
==========================================================*/

async function loadProducts(){

    if(!productGrid) return;

    try{

        productGrid.innerHTML=`

            <div class="loading-products">

                Loading Products...

            </div>

        `;

        const snapshot = await getDocs(
    collection(db, "products")
);

        allProducts=[];

        snapshot.forEach(doc=>{

            allProducts.push({

                id:doc.id,

                ...doc.data()

            });

        });

        allProducts = allProducts.filter(product => product.active === true);


        allProducts.sort((a, b) => {

    if (!a.createdAt || !b.createdAt) return 0;

    return (b.createdAt.seconds || 0) - (a.createdAt.seconds || 0);

});

        filteredProducts=[...allProducts];

        renderProducts(filteredProducts);

    }

    catch(error){

        console.error(error);

        productGrid.innerHTML=`

            <div class="no-products">

                Products Not Found

            </div>

        `;

    }

}

/*==========================================================
        RENDER PRODUCTS
==========================================================*/

function renderProducts(products){

    if(!productGrid) return;

    if(products.length===0){

        productGrid.innerHTML=`

            <div class="no-products">

                No Products Available

            </div>

        `;

        return;

    }

    productGrid.innerHTML=

        products

        .map(createProductCard)

        .join("");

}

/*==========================================================
        SEARCH PRODUCTS
==========================================================*/

function searchProducts(keyword){

    keyword = keyword.trim().toLowerCase();

    if(keyword===""){

        filteredProducts=[...allProducts];

        renderProducts(filteredProducts);

        return;

    }

    filteredProducts = allProducts.filter(product=>{

        return(

            (product.name || "")
            .toLowerCase()
            .includes(keyword)

            ||

            (product.category || "")
            .toLowerCase()
            .includes(keyword)

            ||

            (product.SKUID || "")
            .toLowerCase()
            .includes(keyword)

        );

    });

    renderProducts(filteredProducts);

}


/*==========================================================
        SEARCH EVENT
==========================================================*/

if(searchInput){

    searchInput.addEventListener("input",(e)=>{

        searchProducts(e.target.value);

    });

}


/*==========================================================
        CATEGORY FILTER
==========================================================*/

categoryCards.forEach(card=>{

    card.addEventListener("click",()=>{

        categoryCards.forEach(item=>{

            item.classList.remove("active");

        });

        card.classList.add("active");

        const category=

            card.dataset.category;

        if(

            !category ||

            category==="all"

        ){

            filteredProducts=[

                ...allProducts

            ];

        }

        else{

            filteredProducts=

            allProducts.filter(product=>{

                return(

                    product.category===category

                );

            });

        }

        renderProducts(filteredProducts);

    });

});
/*==========================================================
        PRODUCT ACTIONS
==========================================================*/

document.addEventListener("click",(e)=>{

    /*====================================
            ADD TO CART
    ====================================*/

    const cartBtn=e.target.closest(".cart-btn");

    if(cartBtn){

        const id=cartBtn.dataset.id;

        addToCart(id);

    }


    /*====================================
            BUY NOW
    ====================================*/

    const buyBtn=e.target.closest(".buy-btn");

    if(buyBtn){

        const id=buyBtn.dataset.id;

        buyNow(id);

    }


    /*====================================
            WISHLIST
    ====================================*/

    const wishBtn=e.target.closest(".wishlist-btn");

    if(wishBtn){

        const id=wishBtn.dataset.id;

        toggleWishlist(id,wishBtn);

    }

});


/*==========================================================
        ADD TO CART
==========================================================*/

function addToCart(id){

    const product=

    allProducts.find(item=>item.id===id);

    if(!product) return;

    if(product.stock<=0){

        showToast("Product is Out Of Stock","error");

        return;

    }

    const existing=

    cart.find(item=>item.id===id);

    if(existing){

        existing.qty++;

    }

    else{

        cart.push({

            id:product.id,

            SKUID:product.SKUID,

            name:product.name,

            image:product.image,

            price:product.price,

            mrp:product.mrp,

            qty:1

        });

    }

    saveCart();

    showToast(
        `${product.name} added to cart`,
        "success"
    );

}


/*==========================================================
        BUY NOW
==========================================================*/

function buyNow(id){

    localStorage.setItem(

        "buyNowProduct",

        id

    );

    window.location.href="checkout.html";

}


/*==========================================================
        WISHLIST
==========================================================*/

function toggleWishlist(id,button){

    const exists=

    wishlist.find(item=>item.id===id);

    if(exists){

        wishlist=

        wishlist.filter(item=>item.id!==id);

        button.innerHTML=

        '<i class="fa-regular fa-heart"></i>';

    }

    else{

        const product=

        allProducts.find(item=>item.id===id);

        if(!product) return;

        wishlist.push(product);

        button.innerHTML=

        '<i class="fa-solid fa-heart"></i>';

    }

    saveWishlist();

}
/*==========================================================
        PRODUCT CARD LINK
==========================================================*/

function getProductURL(id){

    return `product.html?id=${id}`;

}


/*==========================================================
        PRODUCT CLICK
==========================================================*/

document.addEventListener("click",(e)=>{

    const card=e.target.closest(".product-card");

    if(!card) return;

    if(

        e.target.closest(".cart-btn") ||

        e.target.closest(".buy-btn") ||

        e.target.closest(".wishlist-btn")

    ){

        return;

    }

    const id=card.dataset.id;

    if(!id) return;

    window.location.href=getProductURL(id);

});


/*==========================================================
        UPDATE PRODUCT CARD
==========================================================*/

function createProductCard(product){

    const discount=

    product.mrp>product.price

    ?

    Math.round(

        ((product.mrp-product.price)

        /product.mrp)*100

    )

    :0;

    return`

<div class="product-card"

data-id="${product.id}">

<div class="product-image">

<a href="${getProductURL(product.id)}">

<img

src="${product.image}"

alt="${product.name}"

loading="lazy">

</a>

</div>

<div class="product-info">

<div class="product-category">

${product.category}

</div>

<h3>

<a href="${getProductURL(product.id)}">

${product.name}

</a>

</h3>

<div class="product-sku">

SKU : ${product.SKUID}

</div>

<div class="price-box">

<span class="sale-price">

₹${product.price}

</span>

${discount>0?`

<span class="mrp">

₹${product.mrp}

</span>

<span class="discount">

${discount}% OFF

</span>

`:""}

</div>

<div class="stock-status">

${

product.stock>0

?

"In Stock"

:

"Out Of Stock"

}

</div>

<div class="product-actions">

<button

class="wishlist-btn"

data-id="${product.id}">

<i class="fa-regular fa-heart"></i>

</button>

<button

class="cart-btn"

data-id="${product.id}">

Add To Cart

</button>

<button

class="buy-btn"

data-id="${product.id}">

Buy Now

</button>

</div>

</div>

</div>

`;

}
/*==========================================================
        TOAST NOTIFICATION
==========================================================*/

function showToast(message,type="success"){

    let toast=document.querySelector(".toast");

    if(!toast){

        toast=document.createElement("div");

        toast.className="toast";

        document.body.appendChild(toast);

    }

    toast.className=`toast ${type}`;

    toast.textContent=message;

    toast.classList.add("show");

    clearTimeout(toast.timer);

    toast.timer=setTimeout(()=>{

        toast.classList.remove("show");

    },3000);

}

/*==========================================================
        SCROLL TO TOP
==========================================================*/

function initScrollTop(){

    if(!backToTop) return;

    window.addEventListener("scroll",()=>{

        if(window.scrollY>300){

            backToTop.classList.add("show");

        }

        else{

            backToTop.classList.remove("show");

        }

    });

    backToTop.addEventListener("click",()=>{

        window.scrollTo({

            top:0,

            behavior:"smooth"

        });

    });

}


/*==========================================================
        HEADER EFFECT
==========================================================*/

function initHeader(){

    if(!header) return;

    window.addEventListener("scroll",()=>{

        if(window.scrollY>50){

            header.classList.add("scrolled");

        }

        else{

            header.classList.remove("scrolled");

        }

    });

}


/*==========================================================
        MOBILE MENU
==========================================================*/

function initMobileMenu(){

    if(!menuBtn || !mobileMenu) return;

    menuBtn.addEventListener("click",()=>{

        mobileMenu.classList.toggle("active");

    });

}
/*==========================================================
        IMAGE LOADING EFFECT
==========================================================*/

function initImageAnimation(){

    const images=document.querySelectorAll("img");

    images.forEach(img=>{

        img.addEventListener("load",()=>{

            img.classList.add("loaded");

        });

    });

}


/*==========================================================
        WISHLIST ACTIVE ICON
==========================================================*/

function updateWishlistIcons(){

    document

    .querySelectorAll(".wishlist-btn")

    .forEach(btn=>{

        const id=btn.dataset.id;

        const found=

        wishlist.find(item=>item.id===id);

        if(found){

            btn.innerHTML=

            '<i class="fa-solid fa-heart"></i>';

        }

        else{

            btn.innerHTML=

            '<i class="fa-regular fa-heart"></i>';

        }

    });

}


/*==========================================================
        GLOBAL ERROR HANDLER
==========================================================*/

window.addEventListener("error",(e)=>{

    console.error(

        "Script Error :",

        e.message

    );

});


/*==========================================================
        WEBSITE INITIALIZATION
==========================================================*/

async function initializeWebsite(){

    updateBadges();

    initHeroSlider();

    initHeader();

    initScrollTop();

    initMobileMenu();

    initImageAnimation();

    await loadProducts();

    updateWishlistIcons();

}


/*==========================================================
        START WEBSITE
==========================================================*/

document.addEventListener(

    "DOMContentLoaded",

    ()=>{

        initializeWebsite();

    }

);