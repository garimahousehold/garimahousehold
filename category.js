/*==========================================================
        GARIMA'S HOUSE HOLD
        category.js
        PART - 1
==========================================================*/

"use strict";

/*==========================================================
        IMPORTS
==========================================================*/

import { db } from "./firebase.js";

import {

    collection,
    getDocs

} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";


/*==========================================================
        HELPERS
==========================================================*/

const $ = (selector)=>document.querySelector(selector);

const $$ = (selector)=>document.querySelectorAll(selector);


/*==========================================================
        URL PARAMETER
==========================================================*/

const params=new URLSearchParams(window.location.search);

const category=params.get("cat") || "All";


/*==========================================================
        ELEMENTS
==========================================================*/

const pageTitle=$("#categoryTitle");

const productGrid=$("#categoryProducts");

const searchInput=$("#categorySearch");

const sortSelect=$("#sortProducts");

const loader=$("#loader");


/*==========================================================
        VARIABLES
==========================================================*/

let allProducts=[];

let filteredProducts=[];


/*==========================================================
        LOADER
==========================================================*/

function showLoader(){

    if(loader){

        loader.style.display="flex";

    }

}

function hideLoader(){

    if(loader){

        loader.style.display="none";

    }

}


/*==========================================================
        PAGE TITLE
==========================================================*/

if(pageTitle){

    pageTitle.textContent=category;

}


/*==========================================================
        LOAD PRODUCTS
==========================================================*/

async function loadProducts(){

    showLoader();

    try{

        const snapshot=await getDocs(

            collection(db,"products")

        );

        allProducts=[];

        snapshot.forEach(doc=>{

            allProducts.push({

                id:doc.id,

                ...doc.data()

            });

        });

        filteredProducts=

        allProducts.filter(product=>{

            if(category==="All"){

                return true;

            }

            return product.category===category;

        });

        renderProducts(filteredProducts);

    }

    catch(error){

        console.error(error);

    }

    hideLoader();

}
