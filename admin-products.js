import { db } from "./firebase.js";

import {
collection,
addDoc,
getDocs,
deleteDoc,
updateDoc,
doc,
serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

const productRef = collection(db,"products");

// ===============================
// Elements
// ===============================

const modal=document.getElementById("productModal");
const addBtn=document.getElementById("addProductBtn");
const closeBtn=document.querySelector(".close");
const form=document.getElementById("productForm");

const preview=document.getElementById("preview");
const image=document.getElementById("image");

const table=document.getElementById("productTable");

const totalProducts=document.getElementById("totalProducts");
const activeProducts=document.getElementById("activeProducts");
const outStock=document.getElementById("outStock");
const categoryCount=document.getElementById("categoryCount");

const search=document.getElementById("search");
const filter=document.getElementById("filterCategory");

let products=[];
let editId=null;
// ===============================
// Modal
// ===============================

addBtn.onclick=()=>{

modal.style.display="block";

form.reset();

preview.style.display="none";

editId=null;

};

closeBtn.onclick=()=>{

modal.style.display="none";

};

window.onclick=(e)=>{

if(e.target==modal){

modal.style.display="none";

}

};
image.addEventListener("change",(e)=>{

const file=e.target.files[0];

if(!file) return;

preview.src=URL.createObjectURL(file);

preview.style.display="block";

});
form.addEventListener("submit",async(e)=>{

e.preventDefault();

const product={

name:document.getElementById("productName").value,

category:document.getElementById("category").value,

mrp:Number(document.getElementById("mrp").value),

price:Number(document.getElementById("price").value),

stock:Number(document.getElementById("stock").value),

description:document.getElementById("description").value,

image:"",

active:true,

createdAt:serverTimestamp()

};

try{

await addDoc(productRef,product);

alert("Product Added Successfully");

modal.style.display="none";

form.reset();

loadProducts();

}catch(err){

alert(err.message);

}

});
async function loadProducts(){

table.innerHTML="";

products=[];

let total=0;
let active=0;
let stock=0;

const categorySet=new Set();

const snap=await getDocs(productRef);

snap.forEach((d)=>{

const p=d.data();

p.id=d.id;

products.push(p);

total++;

if(p.active) active++;

if(p.stock<=0) stock++;

categorySet.add(p.category);

table.innerHTML+=`

<tr>

<td>

<img src="${p.image||'https://via.placeholder.com/60'}">

</td>

<td>${p.name}</td>

<td>${p.category}</td>

<td>₹${p.mrp}</td>

<td>₹${p.price}</td>

<td>${p.stock}</td>

<td>

<span class="${p.active?'activeStatus':'inactiveStatus'}">

${p.active?'Active':'Inactive'}

</span>

</td>

<td>

<button class="editBtn"

onclick="editProduct('${p.id}')">

Edit

</button>

<button class="deleteBtn"

onclick="deleteProduct('${p.id}')">

Delete

</button>

</td>

</tr>

`;

});

totalProducts.innerHTML=total;

activeProducts.innerHTML=active;

outStock.innerHTML=stock;

categoryCount.innerHTML=categorySet.size;

}

loadProducts();
