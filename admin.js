// ==========================================
// Firebase Imports
// ==========================================

import { db } from "./firebase.js";

import {
    collection,
    addDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    doc
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

// ==========================================
// Firestore Collection
// ==========================================

const productsRef = collection(db, "products");

// ==========================================
// Global Variables
// ==========================================

let products = [];
let editId = null;

// ==========================================
// Elements
// ==========================================

const productForm = document.getElementById("product-form");

const productName = document.getElementById("product-name");

const productCategory = document.getElementById("product-category");

const productPrice = document.getElementById("product-price");

const productImage = document.getElementById("product-image");

const productDescription = document.getElementById("product-description");

const productList = document.getElementById("product-list");

const searchProduct = document.getElementById("search-product");

const totalProducts = document.getElementById("total-products");

const firebaseStatus = document.getElementById("firebase-status");

// ==========================================
// Console
// ==========================================

console.log("================================");

console.log("Garima's House Hold Admin");

console.log("Firebase Connected");

console.log("================================");

// ==========================================
// Load Products
// ==========================================

async function loadProducts() {

    try {

        firebaseStatus.innerText = "Loading Products...";

        const snapshot = await getDocs(productsRef);

        products = [];

        snapshot.forEach((docSnap) => {

            products.push({

                id: docSnap.id,

                ...docSnap.data()

            });

        });

        console.log("Products Loaded:", products);
console.log("Total:", products.length);
        renderProducts(products);

        totalProducts.innerText = products.length;

        firebaseStatus.innerText = "Connected ✅";

    }

    catch (error) {

    console.error(error);

    alert(error.message);

    firebaseStatus.innerText = "Connection Failed ❌";

}

}

// ==========================================
// Render Products
// ==========================================

function renderProducts(productArray) {

    productList.innerHTML = "";

    if (productArray.length === 0) {

        productList.innerHTML = `

        <tr>

            <td colspan="6">

                No Products Found

            </td>

        </tr>

        `;

        return;

    }

    productArray.forEach(product => {

        productList.innerHTML += `

        <tr>

            <td>

                <img src="${product.image}" alt="${product.name}">

            </td>

            <td>${product.name}</td>

            <td>${product.category}</td>

            <td>Rs. ${product.price}</td>

            <td>${product.stock}</td>

            <td>

                <button
                    class="edit-btn"
                    onclick="editProduct('${product.id}')">

                    Edit

                </button>

                <button
                    class="delete-btn"
                    onclick="deleteProduct('${product.id}')">

                    Delete

                </button>

            </td>

        </tr>

        `;

    });

}
// ==========================================
// Save Product
// ==========================================

productForm.addEventListener("submit", async (e) => {

    e.preventDefault();

    try {

        const productData = {

    name: productName.value.trim(),

    category: productCategory.value.trim(),

    price: Number(productPrice.value),

    stock: Number(productStock.value),

    image: productImage.value.trim(),

    description: productDescription.value.trim(),

    createdAt: new Date()

};

        // Add Product

        if (editId === null) {

            await addDoc(productsRef, productData);

            alert("✅ Product Added Successfully");

        }

        // Update Product

        else {

            await updateDoc(

                doc(db, "products", editId),

                productData

            );

            alert("✅ Product Updated Successfully");

            editId = null;

        }

        productForm.reset();

        await loadProducts();

    }

    catch (error) {

        console.error(error);

        alert("❌ Failed to Save Product");

    }

});
// ==========================================
// Edit Product
// ==========================================

function editProduct(id) {

    const product = products.find(item => item.id === id);

    if (!product) return;

    editId = id;

    productName.value = product.name;
    productCategory.value = product.category;
    productPrice.value = product.price;
    productImage.value = product.image;
    productDescription.value = product.description;

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}

// ==========================================
// Delete Product
// ==========================================

async function deleteProduct(id) {

    const confirmDelete = confirm("Delete this product?");

    if (!confirmDelete) return;

    try {

        await deleteDoc(doc(db, "products", id));

        alert("✅ Product Deleted");

        await loadProducts();

    }

    catch (error) {

        console.error(error);

        alert("❌ Unable to delete product");

    }

}

// ==========================================
// Search Products
// ==========================================

searchProduct.addEventListener("input", () => {

    const keyword = searchProduct.value
        .toLowerCase()
        .trim();

    if (keyword === "") {

        renderProducts(products);

        return;

    }

    const filteredProducts = products.filter(product =>

        product.name.toLowerCase().includes(keyword) ||

        product.category.toLowerCase().includes(keyword)

    );

    renderProducts(filteredProducts);

});

// ==========================================
// Global Functions
// ==========================================

window.editProduct = editProduct;

window.deleteProduct = deleteProduct;
// ==========================================
// Initialize Admin Panel
// ==========================================

async function initializeAdmin() {

    try {

        firebaseStatus.innerText = "Connecting...";

        await loadProducts();

        firebaseStatus.innerText = "Connected ✅";

    }

    catch (error) {

        console.error(error);

        firebaseStatus.innerText = "Connection Failed ❌";

    }

}

// ==========================================
// Loading Screen
// ==========================================

function showLoading() {

    const loader = document.getElementById("loading-screen");

    if (loader) {

        loader.style.display = "flex";

    }

}

function hideLoading() {

    const loader = document.getElementById("loading-screen");

    if (loader) {

        loader.style.display = "none";

    }

}

// ==========================================
// Page Load
// ==========================================

window.addEventListener("DOMContentLoaded", async () => {

    showLoading();

    await initializeAdmin();

    hideLoading();

});

// ==========================================
// Console
// ==========================================

console.log("==================================");

console.log("Garima's House Hold");

console.log("Admin Panel Ready");

console.log("Version : 3.0");

console.log("==================================");
