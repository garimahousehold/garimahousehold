import { db } from "./firebase.js";

import {
    collection,
    getDocs,
    query,
    orderBy,
    limit
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

// Collections

const productRef = collection(db, "products");
const orderRef = collection(db, "orders");
const couponRef = collection(db, "coupons");

// Dashboard Elements

const totalProducts = document.getElementById("total-products");
const totalOrders = document.getElementById("total-orders");
const totalCustomers = document.getElementById("total-customers");
const totalRevenue = document.getElementById("total-revenue");
const activeCoupons = document.getElementById("active-coupons");
const pendingOrders = document.getElementById("pending-orders");

const recentOrders = document.getElementById("recent-orders");

// Load Dashboard

loadDashboard();

async function loadDashboard() {

    let revenue = 0;
    let pending = 0;

    // Products

    const productSnap = await getDocs(productRef);
    totalProducts.innerText = productSnap.size;

    // Coupons

    const couponSnap = await getDocs(couponRef);

    let active = 0;

    couponSnap.forEach(doc => {

        if (doc.data().active) {

            active++;

        }

    });

    activeCoupons.innerText = active;

    // Orders

    const orderSnap = await getDocs(orderRef);

    const customers = new Set();

    totalOrders.innerText = orderSnap.size;

    recentOrders.innerHTML = "";

    orderSnap.forEach(doc => {

        const data = doc.data();

        revenue += Number(data.total || 0);

        customers.add(data.phone);

        if (data.status == "Pending") {

            pending++;

        }

    });

    pendingOrders.innerText = pending;

    totalCustomers.innerText = customers.size;

    totalRevenue.innerText = "₹" + revenue;

    // Recent Orders

    const latestQuery = query(

        orderRef,

        orderBy("createdAt", "desc"),

        limit(10)

    );

    const latestSnap = await getDocs(latestQuery);

    latestSnap.forEach(doc => {

        const order = doc.data();

        recentOrders.innerHTML += `

<tr>

<td>${doc.id}</td>

<td>${order.customerName}</td>

<td>₹${order.total}</td>

<td>

<span class="${order.status.toLowerCase()}">

${order.status}

</span>

</td>

<td>${order.createdAt}</td>

</tr>

`;

    });

}
