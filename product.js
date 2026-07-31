// ==============================
// FIREBASE IMPORT
// ==============================

import { db } from "./firebase.js";

import {
    doc,
    getDoc,
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

// ==============================
// GET PRODUCT ID
// ==============================

const params = new URLSearchParams(window.location.search);

const productId = params.get("id");

// ==============================
// LOAD PRODUCT
// ==============================

async function loadProduct(){

    if(!productId){

        alert("Product Not Found");

        window.location.href="index.html";

        return;

    }

    try{

        const ref = doc(db,"products",productId);

        const snap = await getDoc(ref);

        if(!snap.exists()){

            alert("Product Not Found");

            window.location.href="index.html";

            return;

        }

        const product = snap.data();

        displayProduct(product);

        loadRelated(product.category);

    }

    catch(error){

        console.error(error);

    }

}

loadProduct();

// ==============================
// DISPLAY PRODUCT
// ==============================

function displayProduct(product){

    document.getElementById("productName").textContent =
    product.name;

    document.getElementById("breadcrumbName").textContent =
    product.name;

    document.getElementById("productCategory").textContent =
    product.category;

    document.getElementById("productPrice").textContent =
    "₹"+product.price;

    document.getElementById("productMRP").textContent =
    "₹"+product.mrp;

    document.getElementById("productDescription").textContent =
    product.description || "";

    document.getElementById("specCategory").textContent =
    product.category;

    const discount =
    Math.round(
        ((product.mrp-product.price)/product.mrp)*100
    );

    document.getElementById("productDiscount").textContent =
    discount+"% OFF";

    document.getElementById("mainProductImage").src =
    product.image;

    document.getElementById("thumb1").src =
    product.image;

    document.getElementById("thumb2").src =
    product.image;

    document.getElementById("thumb3").src =
    product.image;

    document.getElementById("thumb4").src =
    product.image;

}
// ======================================
// QUANTITY
// ======================================

const qtyInput = document.getElementById("qty");

document.getElementById("plusQty").addEventListener("click",()=>{

    qtyInput.value = Number(qtyInput.value)+1;

});

document.getElementById("minusQty").addEventListener("click",()=>{

    if(Number(qtyInput.value)>1){

        qtyInput.value = Number(qtyInput.value)-1;

    }

});

// ======================================
// THUMBNAIL CLICK
// ======================================

document.querySelectorAll(".thumb").forEach(img=>{

    img.addEventListener("click",function(){

        document
        .querySelectorAll(".thumb")
        .forEach(i=>i.classList.remove("active"));

        this.classList.add("active");

        document.getElementById("mainProductImage").src =
        this.src;

    });

});

// ======================================
// ADD TO CART
// ======================================

document.getElementById("addToCart").addEventListener("click",()=>{

    let cart =
    JSON.parse(localStorage.getItem("cart")) || [];

    const qty =
    Number(document.getElementById("qty").value);

    const existing =
    cart.find(item=>item.id===productId);

    if(existing){

        existing.qty += qty;

    }

    else{

        cart.push({

            id:productId,

            qty:qty

        });

    }

    localStorage.setItem(

        "cart",

        JSON.stringify(cart)

    );

    alert("Product Added To Cart");

});

// ======================================
// BUY NOW
// ======================================

document.getElementById("buyNow").addEventListener("click",()=>{

    document
    .getElementById("addToCart")
    .click();

    window.location.href="cart.html";

});

// ======================================
// WISHLIST
// ======================================

document.getElementById("wishlistBtn").addEventListener("click",()=>{

    let wishlist =
    JSON.parse(localStorage.getItem("wishlist")) || [];

    if(!wishlist.includes(productId)){

        wishlist.push(productId);

        localStorage.setItem(

            "wishlist",

            JSON.stringify(wishlist)

        );

        alert("Added To Wishlist");

    }

    else{

        alert("Already In Wishlist");

    }

});

// ======================================
// RELATED PRODUCTS
// ======================================

async function loadRelated(category){

    const container =
    document.getElementById("relatedProducts");

    container.innerHTML="";

    const snapshot =
    await getDocs(collection(db,"products"));

    snapshot.forEach(docSnap=>{

        if(docSnap.id===productId) return;

        const p = docSnap.data();

        if(p.category!==category) return;

        container.innerHTML += `

        <div class="product-card"
             onclick="location.href='product.html?id=${docSnap.id}'">

            <div class="product-card-image">

                <img src="${p.image}">

            </div>

            <div class="product-content">

                <span class="product-category">

                    ${p.category}

                </span>

                <h3>

                    ${p.name}

                </h3>

                <div class="price-row">

                    <span class="price">

                        ₹${p.price}

                    </span>

                    <span class="mrp">

                        ₹${p.mrp}

                    </span>

                </div>

            </div>

        </div>

        `;

    });

}

// ======================================
// PRODUCT TABS
// ======================================

function openTab(evt, tabName){

    document.querySelectorAll(".tab-content")

    .forEach(tab=>{

        tab.classList.remove("active");

    });

    document.querySelectorAll(".tab-btn")

    .forEach(btn=>{

        btn.classList.remove("active");

    });

    document
    .getElementById(tabName)
    .classList.add("active");

    evt.currentTarget.classList.add("active");

}

window.openTab = openTab;
