// ==========================================
// Garima's House Hold
// product.js
// ==========================================

// ===============================
// FIREBASE
// ===============================

import { db } from "./firebase.js";

import {

    doc,

    getDoc,

    collection,

    getDocs

} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

// ===============================
// URL PARAMETERS
// ===============================

const params =

new URLSearchParams(

window.location.search

);

const productId =

params.get("id");

// ===============================
// GLOBAL VARIABLES
// ===============================

let product = null;

let allProducts = [];

let quantity = 1;

let cart = JSON.parse(

localStorage.getItem("cart")

) || [];

let wishlist = JSON.parse(

localStorage.getItem("wishlist")

) || [];

// ===============================
// HTML ELEMENTS
// ===============================

const productTitle =

document.getElementById("productTitle");

const productPrice =

document.getElementById("productPrice");

const productMrp =

document.getElementById("productMrp");

const productDiscount =

document.getElementById("productDiscount");

const productSku =

document.getElementById("productSku");

const productCategory =

document.getElementById("productCategory");

const productName =

document.getElementById("productName");

const productDescription =

document.getElementById("productDescription");

const shortDescription =

document.getElementById("shortDescription");

const stockStatus =

document.getElementById("stockStatus");

const mainImage =

document.getElementById("mainProductImage");

const thumbnailGallery =

document.getElementById("thumbnailGallery");

const relatedProducts =

document.getElementById("relatedProducts");
// ==========================================
// LOAD PRODUCT
// ==========================================

async function loadProduct(){

    if(!productId){

        alert("Product Not Found");

        window.location.href="index.html";

        return;

    }

    try{

        const productRef = doc(

            db,

            "products",

            productId

        );

        const snapshot = await getDoc(productRef);

        if(!snapshot.exists()){

            alert("Product Not Found");

            window.location.href="index.html";

            return;

        }

        product = {

            id:snapshot.id,

            ...snapshot.data()

        };

        displayProduct();

        loadRelatedProducts();

    }

    catch(error){

        console.error(

            "Error Loading Product :",

            error

        );

    }

}

// ==========================================
// DISPLAY PRODUCT
// ==========================================

function displayProduct(){

    productTitle.textContent =
    product.name || "";

    productName.textContent =
    product.name || "";

    productCategory.textContent =
    product.category || "";

    productSku.textContent =
    "SKU : " + (product.sku || "-");

    productPrice.textContent =
    "₹" + (product.price || 0);

    productMrp.textContent =
    "₹" + (product.mrp || 0);

    const discount =

    product.mrp > product.price

    ?

    Math.round(

        ((product.mrp-product.price)

        /product.mrp)

        *100

    )

    :

    0;

    productDiscount.textContent =

    discount + "% OFF";

    productDescription.textContent =

    product.description ||

    "No Description Available";

    shortDescription.textContent =

    product.shortDescription ||

    product.description ||

    "";

    stockStatus.textContent =

    product.stock > 0

    ?

    "✔ In Stock"

    :

    "❌ Out Of Stock";

    mainImage.src =

    product.image ||

    "images/no-image.png";

    loadGallery();

}
// ==========================================
// IMAGE GALLERY
// ==========================================

function loadGallery(){

    if(!product) return;

    thumbnailGallery.innerHTML = "";

    let images = [];

    if(product.images && Array.isArray(product.images)){

        images = product.images;

    }else{

        images = [

            product.image ||

            "images/no-image.png"

        ];

    }

    mainImage.src = images[0];

    images.forEach((image,index)=>{

        const thumb =

        document.createElement("img");

        thumb.src = image;

        thumb.alt = product.name;

        thumb.className =

        "thumbnail";

        if(index===0){

            thumb.classList.add("active");

        }

        thumb.onclick = ()=>{

            mainImage.src = image;

            document
            .querySelectorAll(".thumbnail")
            .forEach(img=>{

                img.classList.remove("active");

            });

            thumb.classList.add("active");

        };

        thumbnailGallery.appendChild(

            thumb

        );

    });

}

// ==========================================
// RELATED PRODUCTS
// ==========================================

async function loadRelatedProducts(){

    const snapshot = await getDocs(

        collection(db,"products")

    );

    allProducts = [];

    snapshot.forEach(doc=>{

        if(doc.id!==productId){

            allProducts.push({

                id:doc.id,

                ...doc.data()

            });

        }

    });

    renderRelatedProducts();

}

// ==========================================
// RENDER RELATED PRODUCTS
// ==========================================

function renderRelatedProducts(){

    if(!relatedProducts) return;

    relatedProducts.innerHTML = "";

    const filtered = allProducts.filter(item=>

        item.category===product.category

    );

    filtered.slice(0,4).forEach(item=>{

        const card =

        document.createElement("div");

        card.className="product-card";

        card.innerHTML=`

            <div class="product-card-image">

                <img

                src="${item.image}"

                alt="${item.name}">

            </div>

            <div class="product-content">

                <h3>

                    ${item.name}

                </h3>

                <p>

                    ₹${item.price}

                </p>

            </div>

        `;

        card.onclick=()=>{

            window.location.href=

            "product.html?id="+item.id;

        };

        relatedProducts.appendChild(

            card

        );

    });

}
// ==========================================
// QUANTITY
// ==========================================

const qtyInput =
document.getElementById("quantity");

const minusBtn =
document.getElementById("minusQty");

const plusBtn =
document.getElementById("plusQty");

if(minusBtn){

    minusBtn.onclick=()=>{

        if(quantity>1){

            quantity--;

            qtyInput.value=quantity;

        }

    };

}

if(plusBtn){

    plusBtn.onclick=()=>{

        quantity++;

        qtyInput.value=quantity;

    };

}

// ==========================================
// ADD TO CART
// ==========================================

const addBtn =
document.getElementById("addToCartBtn");

if(addBtn){

addBtn.onclick=()=>{

    const existing=

    cart.find(item=>item.id===product.id);

    if(existing){

        existing.qty += quantity;

    }

    else{

        cart.push({

            id:product.id,

            name:product.name,

            image:product.image,

            sku:product.sku,

            price:product.price,

            qty:quantity

        });

    }

    localStorage.setItem(

        "cart",

        JSON.stringify(cart)

    );

    showToast(

        "Added To Cart",

        product.name+" added successfully."

    );

};

}

// ==========================================
// BUY NOW
// ==========================================

const buyBtn =
document.getElementById("buyNowBtn");

if(buyBtn){

buyBtn.onclick=()=>{

    addBtn.click();

    window.location.href="cart.html";

};

}

// ==========================================
// WISHLIST
// ==========================================

const wishlistBtn =
document.getElementById("wishlistBtn");

if(wishlistBtn){

wishlistBtn.onclick=()=>{

    const index=

    wishlist.indexOf(product.id);

    if(index>-1){

        wishlist.splice(index,1);

        wishlistBtn.innerHTML=

        '<i class="fa-regular fa-heart"></i> Add To Wishlist';

        showToast(

            "Wishlist",

            "Removed from wishlist."

        );

    }

    else{

        wishlist.push(product.id);

        wishlistBtn.innerHTML=

        '<i class="fa-solid fa-heart"></i> Added To Wishlist';

        showToast(

            "Wishlist",

            "Added to wishlist."

        );

    }

    localStorage.setItem(

        "wishlist",

        JSON.stringify(wishlist)

    );

};

}
// ==========================================
// UPDATE COUNTS
// ==========================================

function updateCartCount(){

    const count =
    document.getElementById("cartCount");

    if(!count) return;

    let total = 0;

    cart.forEach(item=>{

        total += item.qty;

    });

    count.textContent = total;

}

function updateWishlistCount(){

    const count =
    document.getElementById("wishlistCount");

    if(!count) return;

    count.textContent = wishlist.length;

}

// ==========================================
// TOAST
// ==========================================

function showToast(title,message){

    const toast =
    document.getElementById("toast");

    if(!toast) return;

    document.getElementById("toastTitle").textContent =
    title;

    document.getElementById("toastMessage").textContent =
    message;

    toast.classList.add("show");

    setTimeout(()=>{

        toast.classList.remove("show");

    },3000);

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

    scrollBtn.onclick=()=>{

        window.scrollTo({

            top:0,

            behavior:"smooth"

        });

    };

}

// ==========================================
// LOADER
// ==========================================

window.addEventListener("load",()=>{

    const loader =
    document.getElementById("loader");

    if(loader){

        loader.style.display="none";

    }

});

// ==========================================
// INITIALIZE
// ==========================================

updateCartCount();

updateWishlistCount();

loadProduct();

console.log("✅ Product Page Ready");