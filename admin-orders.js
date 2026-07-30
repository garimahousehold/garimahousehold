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

window.viewOrder=(id)=>{

alert("Next Part me Order Details Popup banayenge.");

}
