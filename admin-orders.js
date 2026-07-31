import { db } from "./firebase.js";

import {

collection,

getDocs,

deleteDoc,

doc

} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

const table=document.getElementById("orders-table");

const orderCollection=collection(db,"orders");

loadOrders();

async function loadOrders(){

table.innerHTML="";

let total=0;

let pending=0;

let revenue=0;

const snapshot=await getDocs(orderCollection);

snapshot.forEach(order=>{

const data=order.data();

total++;

revenue+=Number(data.total);

if(data.status=="Pending"){

pending++;

}

table.innerHTML+=`

<tr>

<td>${order.id}</td>

<td>${data.customerName}</td>

<td>${data.phone}</td>

<td>₹${data.total}</td>

<td>${data.status}</td>

<td>

<button class="view"

onclick="viewOrder('${order.id}')">

View

</button>

<button class="delete"

onclick="deleteOrder('${order.id}')">

Delete

</button>

</td>

</tr>

`;

});

document.getElementById("total-orders").innerText=total;

document.getElementById("pending-orders").innerText=pending;

document.getElementById("revenue").innerText="₹"+revenue;

}

window.deleteOrder=async(id)=>{

if(confirm("Delete Order?")){

await deleteDoc(doc(db,"orders",id));

loadOrders();

}

}

import { updateDoc } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

const popup=document.getElementById("order-popup");
const details=document.getElementById("order-details");
const statusSelect=document.getElementById("status-select");
let currentOrderId="";
let currentPhone="";

window.viewOrder=async(id)=>{
currentOrderId=id;
const snapshot=await getDocs(orderCollection);
snapshot.forEach(order=>{
if(order.id===id){
const data=order.data();
currentPhone=data.phone||"";
statusSelect.value=data.status||"Pending";
details.innerHTML=`<b>Name:</b> ${data.customerName}<br><b>Phone:</b> ${data.phone}<br><b>Address:</b> ${data.address||"-"}<br><b>Payment:</b> ${data.paymentMethod||"-"}<br><b>Total:</b> ₹${data.total}`;
popup.style.display="flex";
}
});
};

document.getElementById("close-popup").onclick=()=>popup.style.display="none";

document.getElementById("update-status").onclick=async()=>{
if(!currentOrderId)return;
await updateDoc(doc(db,"orders",currentOrderId),{status:statusSelect.value});
popup.style.display="none";
loadOrders();
alert("Status Updated");
};

document.getElementById("whatsapp-btn").onclick=()=>{
if(!currentPhone)return;
const msg=`Your order status is ${statusSelect.value}. Thank you for shopping with Garima's House Hold.`;
window.open(`https://wa.me/91${currentPhone}?text=${encodeURIComponent(msg)}`,"_blank");
};
