import { db } from "./firebase.js";

import {
    collection,
    addDoc,
    getDocs,
    getDoc,
    updateDoc,
    deleteDoc,
    doc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

const productRef = collection(db, "products");

// ==========================
// Elements
// ==========================

const modal = document.getElementById("productModal");
const addBtn = document.getElementById("addProductBtn");
const closeBtn = document.querySelector(".close");

const form = document.getElementById("productForm");

const productId = document.getElementById("productId");
const productName = document.getElementById("productName");
const category = document.getElementById("category");
const mrp = document.getElementById("mrp");
const price = document.getElementById("price");
const stock = document.getElementById("stock");
const description = document.getElementById("description");
const image = document.getElementById("image");

const preview = document.getElementById("preview");

const table = document.getElementById("productTable");

const totalProducts = document.getElementById("totalProducts");
const activeProducts = document.getElementById("activeProducts");
const outStock = document.getElementById("outStock");
const categoryCount = document.getElementById("categoryCount");

const search = document.getElementById("search");
const filterCategory = document.getElementById("filterCategory");

const modalTitle = document.getElementById("modalTitle");
const saveBtn = document.getElementById("saveBtn");

let products = [];
let editId = null;
// ==========================
// Modal Open / Close
// ==========================

addBtn.addEventListener("click", () => {

    modal.style.display = "block";

    form.reset();

    preview.style.display = "none";

    preview.src = "";

    editId = null;

    productId.value = "";

    modalTitle.textContent = "Add Product";

    saveBtn.textContent = "Save Product";

});

closeBtn.addEventListener("click", () => {

    modal.style.display = "none";

});

window.addEventListener("click", (e) => {

    if (e.target === modal) {

        modal.style.display = "none";

    }

});

// ==========================
// Image URL Preview
// ==========================

image.addEventListener("input", () => {

    const url = image.value.trim();

    if (url !== "") {

        preview.src = url;

        preview.style.display = "block";

    } else {

        preview.style.display = "none";

        preview.src = "";

    }

});
// ==========================
// Add / Update Product
// ==========================

form.addEventListener("submit", async (e) => {

    e.preventDefault();

    try {

        const product = {
            name: productName.value.trim(),
            category: category.value,
            mrp: Number(mrp.value),
            price: Number(price.value),
            stock: Number(stock.value),
            description: description.value.trim(),
            image: image.value.trim(),
            active: Number(stock.value) > 0,
            createdAt: serverTimestamp()
        };

        if (editId) {

            await updateDoc(doc(db, "products", editId), {
                name: product.name,
                category: product.category,
                mrp: product.mrp,
                price: product.price,
                stock: product.stock,
                description: product.description,
                image: product.image,
                active: product.active
            });

            alert("✅ Product Updated Successfully");

        } else {

            await addDoc(productRef, product);

            alert("✅ Product Added Successfully");

        }

        modal.style.display = "none";

        form.reset();

        preview.style.display = "none";

        preview.src = "";

        editId = null;

        loadProducts();

    } catch (err) {

        console.error(err);

        alert(err.message);

    }

});
// ==========================
// Load Products
// ==========================

async function loadProducts() {

    table.innerHTML = "";

    products = [];

    const snap = await getDocs(productRef);

    let total = 0;
    let active = 0;
    let out = 0;

    const categories = new Set();

    filterCategory.innerHTML =
        `<option value="">All Categories</option>`;

    snap.forEach((documentData) => {

        const p = documentData.data();

        p.id = documentData.id;

        products.push(p);

        total++;

        if (p.active) active++;

        if (p.stock <= 0) out++;

        categories.add(p.category);

    });

    categories.forEach(cat => {

        filterCategory.innerHTML +=
        `<option value="${cat}">${cat}</option>`;

    });

    totalProducts.textContent = total;

    activeProducts.textContent = active;

    outStock.textContent = out;

    categoryCount.textContent = categories.size;

    renderProducts(products);

}
// ==========================
// Render Product Table
// ==========================

function renderProducts(list) {

    table.innerHTML = "";

    list.forEach((p) => {

        table.innerHTML += `

<tr>

<td>

<img src="${p.image}"
style="width:60px;height:60px;object-fit:cover;border-radius:8px;">

</td>

<td>${p.name}</td>

<td>${p.category}</td>

<td>₹${p.mrp}</td>

<td>₹${p.price}</td>

<td>${p.stock}</td>

<td>

<span class="${p.active ? "activeStatus" : "inactiveStatus"}">

${p.active ? "Active" : "Inactive"}

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

}
// ==========================
// Edit Product
// ==========================

window.editProduct = async function (id) {

    try {

        const snap = await getDoc(doc(db, "products", id));

        if (!snap.exists()) return;

        const p = snap.data();

        editId = id;

        productId.value = id;

        productName.value = p.name || "";
        category.value = p.category || "";
        mrp.value = p.mrp || "";
        price.value = p.price || "";
        stock.value = p.stock || "";
        description.value = p.description || "";
        image.value = p.image || "";

        if (p.image) {

            preview.src = p.image;

            preview.style.display = "block";

        } else {

            preview.style.display = "none";

        }

        modalTitle.textContent = "Edit Product";

        saveBtn.textContent = "Update Product";

        modal.style.display = "block";

    } catch (err) {

        console.error(err);

        alert(err.message);

    }

};

// ==========================
// Delete Product
// ==========================

window.deleteProduct = async function (id) {

    if (!confirm("Delete this product?")) return;

    try {

        await deleteDoc(doc(db, "products", id));

        alert("Product Deleted Successfully");

        loadProducts();

    } catch (err) {

        console.error(err);

        alert(err.message);

    }

};

// ==========================
// Search
// ==========================

search.addEventListener("input", () => {

    const keyword = search.value.toLowerCase().trim();

    const filtered = products.filter(p =>

        (p.name || "").toLowerCase().includes(keyword) ||

        (p.category || "").toLowerCase().includes(keyword)

    );

    renderProducts(filtered);

});

// ==========================
// Category Filter
// ==========================

filterCategory.addEventListener("change", () => {

    const value = filterCategory.value;

    if (value === "") {

        renderProducts(products);

        return;

    }

    renderProducts(products.filter(p => p.category === value));

});

// ==========================
// Initial Load
// ==========================

loadProducts();
