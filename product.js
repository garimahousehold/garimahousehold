/*==========================================================
        GARIMA'S HOUSE HOLD
        product.js
        PART - 1
==========================================================*/

"use strict";

/*==========================================================
        IMPORTS
==========================================================*/

import { db } from "./firebase.js";

import {

    doc,
    getDoc,
    collection,
    getDocs,
    query,
    where,
    limit

} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";


/*==========================================================
        HELPERS
==========================================================*/

const $ = (selector)=>document.querySelector(selector);

const $$ = (selector)=>document.querySelectorAll(selector);


/*==========================================================
        URL PARAMETER
==========================================================*/

const params = new URLSearchParams(window.location.search);

const productId = params.get("id");


/*==========================================================
        PAGE ELEMENTS
==========================================================*/

// Gallery

const mainImage=$("#mainProductImage");

const thumbnails=$("#thumbnailGallery");

// Product

const productName = $("#productTitle");

const productCategory = $("#productCategory");

const productSKU = $("#productSku");

const productPrice = $("#productPrice");

const productMRP = $("#productMrp");

const productDiscount = $("#productDiscount");

const productStock = $("#stockStatus");

const productDescription = $("#productDescription");

// Quantity

const qtyInput=$("#quantity");

const minusBtn=$("#minusQty");

const plusBtn=$("#plusQty");

// Buttons

const addCartBtn=$("#addToCartBtn");

const buyNowBtn=$("#buyNowBtn");

const wishlistBtn=$("#wishlistBtn");

// Related

const relatedGrid=$("#relatedProducts");

// Loader

const pageLoader=$("#loader");


/*==========================================================
        VARIABLES
==========================================================*/

let product=null;

let relatedProducts=[];

let quantity=1;


/*==========================================================
        LOADER
==========================================================*/

function showLoader(){

    if(pageLoader){

        pageLoader.style.display="flex";

    }

}

function hideLoader(){

    if(pageLoader){

        pageLoader.style.display="none";

    }

}


/*==========================================================
        PRODUCT CHECK
==========================================================*/

if(!productId){

    window.location.href="index.html";

}


/*==========================================================
        LOAD PRODUCT
==========================================================*/

async function loadProduct(){

    showLoader();

    try{

        const ref=doc(db,"products",productId);

        const snap=await getDoc(ref);

        if(!snap.exists()){

            alert("Product Not Found");

            window.location.href="index.html";

            return;

        }

        product={

            id:snap.id,

            ...snap.data()

        };

        console.log(product);

    }

    catch(error){

        console.error(error);

    }

    hideLoader();

}
/*==========================================================
        RENDER PRODUCT
==========================================================*/

function renderProduct(){

    if(!product) return;

    productName.textContent = product.name || "Product";

    productCategory.textContent = product.category || "-";

    productSKU.textContent =

    "SKU : " + (product.SKUID || "-");

    productPrice.textContent =

    "₹" + (product.price || 0);

    productMRP.textContent =

    "₹" + (product.mrp || 0);

    productDescription.textContent =

    product.description ||

    "No description available.";


    /*-------------------------
            Discount
    --------------------------*/

    if(product.mrp > product.price){

        const discount = Math.round(

            ((product.mrp-product.price)

            /product.mrp)*100

        );

        productDiscount.textContent =

        discount + "% OFF";

    }

    else{

        productDiscount.style.display="none";

    }


    /*-------------------------
            Stock
    --------------------------*/

    if(product.stock>0){

        productStock.innerHTML=

        "✅ In Stock";

        productStock.style.color="#16a34a";

    }

    else{

        productStock.innerHTML=

        "❌ Out Of Stock";

        productStock.style.color="#dc2626";

    }


    /*-------------------------
            Main Image
    --------------------------*/

    mainImage.src=

    product.image ||

    "images/no-image.png";


    /*-------------------------
            Gallery
    --------------------------*/

    loadGallery();

}


/*==========================================================
        IMAGE GALLERY
==========================================================*/

function loadGallery(){

    thumbnails.innerHTML="";

    let images=[];


    if(product.images

    &&

    Array.isArray(product.images)

    &&

    product.images.length){

        images=[...product.images];

    }

    else{

        images=[product.image];

    }


    // Show a second image only when the product actually has multiple images.



    if(images.length <= 1){



        thumbnails.innerHTML="";



        return;



    }




    images.forEach((img,index)=>{




        const image=document.createElement("img");




        image.src=img;




        image.alt=product.name;




        image.className="thumbnail";

        if(index===0){

            image.classList.add("active");

        }

        image.onclick=()=>{

            mainImage.src=img;

            document

            .querySelectorAll(".thumbnail")

            .forEach(item=>{

                item.classList.remove("active");

            });

            image.classList.add("active");

        };

        thumbnails.appendChild(image);

    });

}


/*==========================================================
        LOAD PAGE
==========================================================*/

async function initProduct(){

    await loadProduct();

    renderProduct();

}
/*==========================================================
        QUANTITY
==========================================================*/

function updateQuantity(value){

    if(value<1){

        value=1;

    }

    if(product && product.stock){

        if(value>product.stock){

            value=product.stock;

        }

    }

    quantity=value;

    qtyInput.value=quantity;

}

if(minusBtn){

    minusBtn.addEventListener("click",()=>{

        updateQuantity(quantity-1);

    });

}

if(plusBtn){

    plusBtn.addEventListener("click",()=>{

        updateQuantity(quantity+1);

    });

}

if(qtyInput){

    qtyInput.addEventListener("change",()=>{

        updateQuantity(

            Number(qtyInput.value)

        );

    });

}


/*==========================================================
        ADD TO CART
==========================================================*/

function addToCart(){

    if(!product) return;

    let cart=

    JSON.parse(

        localStorage.getItem("cart")

    ) || [];

    const existing=

    cart.find(item=>item.id===product.id);

    if(existing){

        existing.qty+=quantity;

    }

    else{

        cart.push({

            id:product.id,

            SKUID:product.SKUID,

            name:product.name,

            image:product.image,

            price:product.price,

            mrp:product.mrp,

            qty:quantity

        });

    }

    localStorage.setItem(

        "cart",

        JSON.stringify(cart)

    );

    showToast(

        "Added To Cart"

    );

}


/*==========================================================
        BUY NOW
==========================================================*/

function buyNow(){

    localStorage.setItem(

        "buyNow",

        JSON.stringify({

            id:product.id,

            qty:quantity

        })

    );

    window.location.href=

    "checkout.html";

}


/*==========================================================
        WISHLIST
==========================================================*/

function toggleWishlist(){

    let wishlist=

    JSON.parse(

        localStorage.getItem("wishlist")

    ) || [];

    const found=

    wishlist.find(

        item=>item.id===product.id

    );

    if(found){

        wishlist=

        wishlist.filter(

            item=>item.id!==product.id

        );

        wishlistBtn.innerHTML=

        '<i class="fa-regular fa-heart"></i> Add To Wishlist';

    }

    else{

        wishlist.push(product);

        wishlistBtn.innerHTML=

        '<i class="fa-solid fa-heart"></i> Added';

    }

    localStorage.setItem(

        "wishlist",

        JSON.stringify(wishlist)

    );

}


/*==========================================================
        BUTTON EVENTS
==========================================================*/

if(addCartBtn){

    addCartBtn.addEventListener(

        "click",

        addToCart

    );

}

if(buyNowBtn){

    buyNowBtn.addEventListener(

        "click",

        buyNow

    );

}

if(wishlistBtn){

    wishlistBtn.addEventListener(

        "click",

        toggleWishlist

    );

}
/*==========================================================
        RELATED PRODUCTS
==========================================================*/

async function loadRelatedProducts(){

    if(!relatedGrid || !product) return;

    try{

        const q=query(

            collection(db,"products"),

            where("category","==",product.category),

            limit(8)

        );

        const snapshot=await getDocs(q);

        relatedGrid.innerHTML="";

        snapshot.forEach(doc=>{

            if(doc.id===product.id) return;

            const item=doc.data();

            relatedGrid.innerHTML+=`

            <div class="product-card">

                <a href="product.html?id=${doc.id}">

                    <img src="${item.image}"

                    alt="${item.name}">

                </a>

                <h4>${item.name}</h4>

                <div class="price">

                    ₹${item.price}

                </div>

            </div>

            `;

        });

    }

    catch(error){

        console.error(error);

    }

}


/*==========================================================
        RECENTLY VIEWED
==========================================================*/

function saveRecentlyViewed(){

    if(!product) return;

    let recent=

    JSON.parse(

        localStorage.getItem(

            "recentProducts"

        )

    ) || [];

    recent=

    recent.filter(

        item=>item.id!==product.id

    );

    recent.unshift({

        id:product.id,

        name:product.name,

        image:product.image,

        price:product.price

    });

    if(recent.length>8){

        recent=recent.slice(0,8);

    }

    localStorage.setItem(

        "recentProducts",

        JSON.stringify(recent)

    );

}


/*==========================================================
        TOAST
==========================================================*/

function showToast(message){

    const toast=document.getElementById("toast");

    const toastMessage=

    document.getElementById(

        "toastMessage"

    );

    if(!toast) return;

    toastMessage.textContent=message;

    toast.classList.add("show");

    setTimeout(()=>{

        toast.classList.remove("show");

    },2500);

}


/*==========================================================
        INITIALIZE
==========================================================*/

async function initialize(){

    await loadProduct();

    renderProduct();

    await loadRelatedProducts();

    saveRecentlyViewed();

    updateQuantity(1);

}


/*==========================================================
        START
==========================================================*/

document.addEventListener(

    "DOMContentLoaded",

    ()=>{

        initialize();

    }

);
