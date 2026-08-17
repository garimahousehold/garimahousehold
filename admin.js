/* =========================================================
   GARIMA'S HOUSE HOLD
   ADMIN PANEL — PART 1
   FIREBASE + ADMIN LOGIN
========================================================= */


/* =========================================================
   FIREBASE
========================================================= */

import {
    db,
    auth
} from "./firebase.js";


import {
    collection,
    addDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    doc
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";


/* =========================================================
   FIREBASE AUTH
========================================================= */

import {
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";
/* =========================================================
   GLOBAL VARIABLES
========================================================= */

let products = [];

let editId = null;


/* =========================================================
   FIRESTORE COLLECTION
========================================================= */

const productsRef =
    collection(
        db,
        "products"
    );


/* =========================================================
   DOM ELEMENTS
========================================================= */

const adminLogin =
    document.getElementById(
        "adminLogin"
    );


const adminPanel =
    document.getElementById(
        "adminPanel"
    );


const loginForm =
    document.getElementById(
        "adminLoginForm"
    );


const adminEmail =
    document.getElementById(
        "adminEmail"
    );


const adminPassword =
    document.getElementById(
        "adminPassword"
    );


const loginError =
    document.getElementById(
        "loginError"
    );


/* =========================================================
   SHOW ADMIN PANEL
========================================================= */

function showAdminPanel() {

    if (adminLogin) {

        adminLogin.style.display =
            "none";

    }


    if (adminPanel) {

        adminPanel.style.display =
            "block";

    }

}


/* =========================================================
   SHOW LOGIN
========================================================= */

function showLogin() {

    if (adminLogin) {

        adminLogin.style.display =
            "flex";

    }


    if (adminPanel) {

        adminPanel.style.display =
            "none";

    }

}


/* =========================================================
   LOGIN ERROR
========================================================= */

function showLoginError(
    message
) {

    if (!loginError) {
        return;
    }


    loginError.textContent =
        message;


    loginError.style.display =
        "block";

}


/* =========================================================
   HIDE LOGIN ERROR
========================================================= */

function hideLoginError() {

    if (!loginError) {
        return;
    }


    loginError.style.display =
        "none";

}


/* =========================================================
   ADMIN LOGIN
========================================================= */

if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            hideLoginError();


            const email =
                adminEmail
                    ?.value
                    .trim();


            const password =
                adminPassword
                    ?.value;


            if (
                !email ||
                !password
            ) {

                showLoginError(
                    "Please enter email and password."
                );

                return;

            }


            const loginButton =
                loginForm.querySelector(
                    ".admin-login-btn"
                );


            if (loginButton) {

                loginButton.disabled =
                    true;

                loginButton.innerHTML = `
                    <i class="fa-solid fa-spinner fa-spin"></i>
                    Logging in...
                `;

            }


            try {

                await signInWithEmailAndPassword(
                    auth,
                    email,
                    password
                );


                showAdminPanel();


            }

            catch (error) {

                console.error(
                    "Admin login error:",
                    error
                );


                showLoginError(
                    "Invalid email or password."
                );

            }

            finally {

                if (loginButton) {

                    loginButton.disabled =
                        false;

                    loginButton.innerHTML = `
                        <i class="fa-solid fa-right-to-bracket"></i>
                        Login
                    `;

                }

            }

        }
    );

}

/* =========================================================
   PASSWORD VISIBILITY
========================================================= */

const passwordToggle =
    document.getElementById(
        "togglePassword"
    );


if (passwordToggle) {

    passwordToggle.addEventListener(
        "click",
        function () {

            if (
                !adminPassword
            ) {
                return;
            }


            const isPassword =
                adminPassword.type ===
                "password";


            adminPassword.type =
                isPassword
                    ? "text"
                    : "password";


            this.innerHTML =
                isPassword

                ? `<i class="fa-regular fa-eye-slash"></i>`

                : `<i class="fa-regular fa-eye"></i>`;

        }
    );

}


/* =========================================================
   CONSOLE
========================================================= */

console.log(
    "================================"
);

console.log(
    "Garima's House Hold Admin"
);

console.log(
    "Firebase Authentication Ready"
);

console.log(
    "================================"
);
/* =========================================================
   ADMIN PANEL — PART 2
   PRODUCT ELEMENTS + LOAD PRODUCTS
========================================================= */


/* =========================================================
   PRODUCT FORM ELEMENTS
========================================================= */

const productForm =
    document.getElementById(
        "product-form"
    );


const productName =
    document.getElementById(
        "product-name"
    );


const productSKU =
    document.getElementById(
        "product-sku"
    );

const productNewArrival =
    document.getElementById(
        "product-new-arrival"
    );

const productBestSeller =
    document.getElementById(
        "product-best-seller"
    );

const productCategory =
    document.getElementById(
        "product-category"
    );


const productMrp =
    document.getElementById(
        "product-mrp"
    );


const productPrice =
    document.getElementById(
        "product-price"
    );


const productStock =
    document.getElementById(
        "product-stock"
    );


const productWeight =
    document.getElementById(
        "product-weight"
    );


const productImage =
    document.getElementById(
        "product-image"
    );


const productDescription =
    document.getElementById(
        "product-description"
    );


const productList =
    document.getElementById(
        "product-list"
    );


const searchProduct =
    document.getElementById(
        "search-product"
    );


const totalProducts =
    document.getElementById(
        "total-products"
    );


const firebaseStatus =
    document.getElementById(
        "firebase-status"
    );


/* =========================================================
   LOAD PRODUCTS
========================================================= */

async function loadProducts() {

    try {

        if (firebaseStatus) {

            firebaseStatus.innerText =
                "Loading Products...";

        }


        const snapshot =
            await getDocs(
                productsRef
            );


        products = [];


        snapshot.forEach(
            docSnap => {

                products.push({

                    id:
                        docSnap.id,

                    ...docSnap.data()

                });

            }
        );


        console.log(
            "Products Loaded:",
            products
        );


        console.log(
            "Total Products:",
            products.length
        );


        renderProducts(
            products
        );


        if (totalProducts) {

            totalProducts.innerText =
                products.length;

        }


        if (firebaseStatus) {

            firebaseStatus.innerText =
                "Connected ✅";

        }

    }

    catch (error) {

        console.error(
            "Load Products Error:",
            error
        );


        if (firebaseStatus) {

            firebaseStatus.innerText =
                "Connection Failed ❌";

        }


        alert(
            "Unable to load products."
        );

    }

}


/* =========================================================
   RENDER PRODUCT LIST
========================================================= */

function renderProducts(
    productArray
) {

    if (!productList) {
        return;
    }


    productList.innerHTML =
        "";


    /* ---------------------------------------------
       NO PRODUCTS
    --------------------------------------------- */

    if (
        !productArray ||
        productArray.length === 0
    ) {

        productList.innerHTML = `

            <tr>

                <td
                    colspan="6"
                    style="text-align:center;"
                >

                    <i
                        class="fa-solid fa-box-open"
                    ></i>

                    <br><br>

                    No Products Found

                </td>

            </tr>

        `;

        return;

    }


    /* ---------------------------------------------
       PRODUCT ROWS
    --------------------------------------------- */

    productArray.forEach(
        product => {

            const image =
                product.image ||
                "images/no-image.png";


            const name =
                product.name ||
                "Unnamed Product";


            const category =
                product.category ||
                "-";


            const price =
                Number(
                    product.price || 0
                );


            const stock =
                Number(
                    product.stock || 0
                );


            const row =
                document.createElement(
                    "tr"
                );


            row.innerHTML = `

                <td>

                    <img
                        src="${image}"
                        alt="${escapeHtml(name)}"
                        onerror="this.src='images/no-image.png'"
                    >

                </td>


                <td>
    ${escapeHtml(product.sku || "-")}
</td>

<td>
    ${escapeHtml(name)}
</td>

<td>
    ${escapeHtml(category)}
</td>


                <td>
                    ₹${price.toLocaleString("en-IN")}
                </td>


                <td>

                    ${
                        stock > 0

                        ? `<span
                            style="
                                color:#2e7d32;
                                font-weight:700;
                            "
                           >
                            ${stock}
                           </span>`

                        : `<span
                            style="
                                color:#c62828;
                                font-weight:700;
                            "
                           >
                            Out of Stock
                           </span>`
                    }

                </td>

                <td>

    ${
        product.newArrival
            ? '<span class="section-badge new-arrival-badge">🆕 New Arrival</span>'
            : ''
    }

    ${
        product.bestSeller
            ? '<span class="section-badge best-seller-badge">⭐ Best Seller</span>'
            : ''
    }

    ${
        !product.newArrival && !product.bestSeller
            ? '<span class="section-badge none-badge">—</span>'
            : ''
    }

</td>

                <td>

                    <button
                        type="button"
                        class="edit-btn"
                        data-id="${product.id}"
                    >

                        <i
                            class="fa-solid fa-pen"
                        ></i>

                        Edit

                    </button>


                    <button
                        type="button"
                        class="delete-btn"
                        data-id="${product.id}"
                    >

                        <i
                            class="fa-solid fa-trash"
                        ></i>

                        Delete

                    </button>

                </td>

            `;


            productList.appendChild(
                row
            );

        }
    );


    /* ---------------------------------------------
       ACTION BUTTONS
    --------------------------------------------- */

    productList
        .querySelectorAll(
            ".edit-btn"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        editProduct(
                            button.dataset.id
                        );

                    }
                );

            }
        );


    productList
        .querySelectorAll(
            ".delete-btn"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        deleteProduct(
                            button.dataset.id
                        );

                    }
                );

            }
        );

}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHtml(
    value
) {

    return String(
        value ?? ""
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}
/* =========================================================
   ADMIN PANEL — PART 3
   ADD / EDIT / DELETE PRODUCT
========================================================= */


/* =========================================================
   SAVE PRODUCT
========================================================= */

if (productForm) {

    productForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            try {

                /* -----------------------------------------
                   VALIDATE BASIC FIELDS
                ----------------------------------------- */

                if (
                    !productName ||
                    !productCategory ||
                    !productPrice ||
                    !productStock ||
                    !productImage
                ) {

                    alert(
                        "Product form fields are missing."
                    );

                    return;

                }


                /* -----------------------------------------
                   PRODUCT DATA
                ----------------------------------------- */

                const productData = {

                    name:
                        productName.value.trim(),

                    sku:
                        productSKU
                            ? productSKU.value.trim()
                            : "",

                    category:
                        productCategory.value.trim(),

                    mrp:
                        Number(
                            productMrp?.value || 0
                        ),

                    price:
                        Number(
                            productPrice.value || 0
                        ),

                    stock:
                        Number(
                            productStock.value || 0
                        ),

                    weightKg:
                        Number(
                            productWeight?.value || 0
                        ),

                    image:
                        productImage.value.trim(),

                    description:
                        productDescription
                            ? productDescription.value.trim()
                            : "",
                    newArrival:
    productNewArrival
        ? productNewArrival.checked
        : false,

bestSeller:
    productBestSeller
        ? productBestSeller.checked
        : false,        

                    updatedAt:
                        new Date()

                };


                /* -----------------------------------------
                   VALIDATION
                ----------------------------------------- */

                if (
                    !productData.name
                ) {

                    alert(
                        "Please enter product name."
                    );

                    return;

                }


                if (
                    !productData.category
                ) {

                    alert(
                        "Please enter product category."
                    );

                    return;

                }


                if (
                    productData.price <= 0
                ) {

                    alert(
                        "Please enter a valid product price."
                    );

                    return;

                }


                if (
                    !productData.image
                ) {

                    alert(
                        "Please enter product image URL."
                    );

                    return;

                }


                /* -----------------------------------------
                   LOADING
                ----------------------------------------- */

                showLoading();


                /* -----------------------------------------
                   UPDATE EXISTING PRODUCT
                ----------------------------------------- */

                if (
                    editId !== null
                ) {

                    await updateDoc(

                        doc(
                            db,
                            "products",
                            editId
                        ),

                        productData

                    );


                    alert(
                        "✅ Product Updated Successfully"
                    );


                    editId =
                        null;

                }


                /* -----------------------------------------
                   ADD NEW PRODUCT
                ----------------------------------------- */

                else {

                    productData.createdAt =
                        new Date();


                    await addDoc(
                        productsRef,
                        productData
                    );


                    alert(
                        "✅ Product Added Successfully"
                    );

                }


                /* -----------------------------------------
                   RESET FORM
                ----------------------------------------- */

                productForm.reset();


                /* -----------------------------------------
                   RESET BUTTON TEXT
                ----------------------------------------- */

                const saveButton =
                    productForm.querySelector(
                        ".save-btn"
                    );


                if (saveButton) {

                    saveButton.innerHTML = `

                        <i
                            class="fa-solid fa-floppy-disk"
                        ></i>

                        Save Product

                    `;

                }


                /* -----------------------------------------
                   RELOAD PRODUCTS
                ----------------------------------------- */

                await loadProducts();

            }

            catch (error) {

                console.error(
                    "Save Product Error:",
                    error
                );


                alert(
                    "❌ Failed to save product.\n\n" +
                    error.message
                );

            }

            finally {

                hideLoading();

            }

        }
    );

}


/* =========================================================
   EDIT PRODUCT
========================================================= */

function editProduct(
    id
) {

    const product =
        products.find(
            item =>
                item.id === id
        );


    if (!product) {

        alert(
            "Product not found."
        );

        return;

    }


    editId =
        id;


    /* -----------------------------------------
       FILL FORM
    ----------------------------------------- */

    if (productName) {

        productName.value =
            product.name || "";

    }


    if (productSKU) {

        productSKU.value =
            product.sku || "";

    }


    if (productCategory) {

        productCategory.value =
            product.category || "";

    }

    if (productNewArrival) {

    productNewArrival.checked =
        product.newArrival === true;

}


if (productBestSeller) {

    productBestSeller.checked =
        product.bestSeller === true;

}

    if (productMrp) {

        productMrp.value =
            product.mrp ||
            product.price ||
            "";

    }


    if (productPrice) {

        productPrice.value =
            product.price || "";

    }

    if (productNewArrival) {
    productNewArrival.checked =
        product.newArrival === true;
}

if (productBestSeller) {
    productBestSeller.checked =
        product.bestSeller === true;
}

    if (productStock) {

        productStock.value =
            product.stock || 0;

    }


    if (productWeight) {

        productWeight.value =
            product.weightKg ||
            product.weight ||
            "";

    }


    if (productImage) {

        productImage.value =
            product.image || "";

    }


    if (productDescription) {

        productDescription.value =
            product.description || "";

    }


    /* -----------------------------------------
       CHANGE BUTTON TEXT
    ----------------------------------------- */

    const saveButton =
        productForm?.querySelector(
            ".save-btn"
        );


    if (saveButton) {

        saveButton.innerHTML = `

            <i
                class="fa-solid fa-pen"
            ></i>

            Update Product

        `;

    }


    /* -----------------------------------------
       SCROLL TO FORM
    ----------------------------------------- */

    const formSection =
        document.querySelector(
            ".product-form"
        );


    if (formSection) {

        formSection.scrollIntoView({

            behavior:
                "smooth",

            block:
                "start"

        });

    }

}


/* =========================================================
   DELETE PRODUCT
========================================================= */

async function deleteProduct(
    id
) {

    const product =
        products.find(
            item =>
                item.id === id
        );


    const productNameText =
        product?.name ||
        "this product";


    const confirmed =
        confirm(
            `Are you sure you want to delete "${productNameText}"?`
        );


    if (!confirmed) {

        return;

    }


    try {

        showLoading();


        await deleteDoc(

            doc(
                db,
                "products",
                id
            )

        );


        alert(
            "✅ Product Deleted Successfully"
        );


        /* -----------------------------------------
           RESET EDIT MODE IF NEEDED
        ----------------------------------------- */

        if (
            editId === id
        ) {

            editId =
                null;


            if (productForm) {

                productForm.reset();

            }

        }


        /* -----------------------------------------
           RELOAD
        ----------------------------------------- */

        await loadProducts();

    }

    catch (error) {

        console.error(
            "Delete Product Error:",
            error
        );


        alert(
            "❌ Unable to delete product.\n\n" +
            error.message
        );

    }

    finally {

        hideLoading();

    }

}


/* =========================================================
   RESET FORM
========================================================= */

if (productForm) {

    productForm.addEventListener(
        "reset",
        function () {

            editId =
                null;


            const saveButton =
                productForm.querySelector(
                    ".save-btn"
                );


            if (saveButton) {

                saveButton.innerHTML = `

                    <i
                        class="fa-solid fa-floppy-disk"
                    ></i>

                    Save Product

                `;

            }

        }
    );

}


/* =========================================================
   GLOBAL FUNCTIONS
========================================================= */

window.editProduct =
    editProduct;


window.deleteProduct =
    deleteProduct;

/* =========================================================
   ADMIN PANEL — PART 4
   SEARCH + DASHBOARD + LOADING
========================================================= */


/* =========================================================
   SEARCH PRODUCTS
========================================================= */

if (searchProduct) {

    searchProduct.addEventListener(
        "input",
        function () {

            const keyword =
                this.value
                    .toLowerCase()
                    .trim();


            /* -----------------------------------------
               SHOW ALL
            ----------------------------------------- */

            if (!keyword) {

                renderProducts(
                    products
                );

                return;

            }


            /* -----------------------------------------
               FILTER
            ----------------------------------------- */

            const filteredProducts =
                products.filter(
                    product => {

                        const name =
                            String(
                                product.name || ""
                            )
                            .toLowerCase();


                        const category =
                            String(
                                product.category || ""
                            )
                            .toLowerCase();


                        const sku =
                            String(
                                product.sku || ""
                            )
                            .toLowerCase();


                        return (

                            name.includes(
                                keyword
                            )

                            ||

                            category.includes(
                                keyword
                            )

                            ||

                            sku.includes(
                                keyword
                            )

                        );

                    }
                );


            renderProducts(
                filteredProducts
            );

        }
    );

}


/* =========================================================
   DASHBOARD — TOTAL PRODUCTS
========================================================= */

function updateProductCount() {

    if (!totalProducts) {
        return;
    }


    totalProducts.innerText =
        products.length;

}


/* =========================================================
   DASHBOARD — TOTAL ORDERS
========================================================= */

async function loadOrderStats() {

    const totalOrdersElement =
        document.getElementById(
            "total-orders"
        );


    const totalSalesElement =
        document.getElementById(
            "total-sales"
        );


    if (
        !totalOrdersElement &&
        !totalSalesElement
    ) {

        return;

    }


    try {

        /*
         * Orders collection
         */

        const ordersRef =
            collection(
                db,
                "orders"
            );


        const snapshot =
            await getDocs(
                ordersRef
            );


        let totalOrders =
            0;


        let totalSales =
            0;


        snapshot.forEach(
            orderDoc => {

                const order =
                    orderDoc.data();


                totalOrders++;


                const orderTotal =
                    Number(
                        order.total ||
                        order.totalAmount ||
                        order.grandTotal ||
                        0
                    );


                totalSales +=
                    orderTotal;

            }
        );


        /* -----------------------------------------
           UPDATE ORDER COUNT
        ----------------------------------------- */

        if (
            totalOrdersElement
        ) {

            totalOrdersElement.innerText =
                totalOrders;

        }


        /* -----------------------------------------
           UPDATE SALES
        ----------------------------------------- */

        if (
            totalSalesElement
        ) {

            totalSalesElement.innerText =
                `₹${totalSales.toLocaleString(
                    "en-IN"
                )}`;

        }


    }

    catch (error) {

        console.error(
            "Order Stats Error:",
            error
        );


        if (
            totalOrdersElement
        ) {

            totalOrdersElement.innerText =
                "0";

        }


        if (
            totalSalesElement
        ) {

            totalSalesElement.innerText =
                "₹0";

        }

    }

}

/* =========================================================
   CUSTOMER ORDERS
========================================================= */

async function loadCustomerOrders() {

    const ordersList =
        document.getElementById(
            "orders-list"
        );

    if (!ordersList) {
        return;
    }

    try {

        const ordersRef =
            collection(
                db,
                "orders"
            );

        const snapshot =
            await getDocs(
                ordersRef
            );


        if (snapshot.empty) {

            ordersList.innerHTML = `
                <tr>
                    <td colspan="6">
                        No Orders Found
                    </td>
                </tr>
            `;

            return;
        }


        ordersList.innerHTML = "";


        snapshot.forEach(
            orderDoc => {

                const order =
                    orderDoc.data();

                const customer =
                    order.customer || {};


                const orderId =
                    order.orderId ||
                    orderDoc.id;


                const name =
                    customer.name ||
                    "N/A";


                const mobile =
                    customer.mobile ||
                    "N/A";


                const address =
                    customer.address ||
                    "N/A";


                const city =
                    customer.city ||
                    "";


                const state =
                    customer.state ||
                    "";


                const pincode =
                    customer.pincode ||
                    "";


                const total =
                    Number(
                        order.total || 0
                    );


                const status =
                    order.orderStatus ||
                    "New";


                const row =
                    document.createElement(
                        "tr"
                    );


                row.innerHTML = `

                    <td>
                        ${escapeHtml(
                            orderId
                        )}
                    </td>

                    <td>
                        ${escapeHtml(
                            name
                        )}
                    </td>

                    <td>
                        ${escapeHtml(
                            mobile
                        )}
                    </td>

                    <td>
                        ${escapeHtml(
                            address
                        )}
                        <br>
                        ${escapeHtml(
                            city
                        )},
                        ${escapeHtml(
                            state
                        )}
                        -
                        ${escapeHtml(
                            pincode
                        )}
                    </td>

                    <td>
                        ₹${total.toLocaleString(
                            "en-IN"
                        )}
                    </td>

                    <td>

    <select
        class="order-status-select"
        data-order-id="${orderDoc.id}"
    >

        <option
            value="New"
            ${status === "New" ? "selected" : ""}
        >
            New
        </option>

        <option
            value="Confirmed"
            ${status === "Confirmed" ? "selected" : ""}
        >
            Confirmed
        </option>

        <option
            value="Shipped"
            ${status === "Shipped" ? "selected" : ""}
        >
            Shipped
        </option>

        <option
            value="Delivered"
            ${status === "Delivered" ? "selected" : ""}
        >
            Delivered
        </option>

        <option
            value="Cancelled"
            ${status === "Cancelled" ? "selected" : ""}
        >
            Cancelled
        </option>

    </select>

</td>

                `;


                ordersList.appendChild(
                    row
                );

            }
        );


    } catch (error) {

        console.error(
            "Customer Orders Error:",
            error
        );


        ordersList.innerHTML = `
            <tr>
                <td colspan="6">
                    Unable to load orders.
                </td>
            </tr>
        `;

    }

}

/* =========================================================
   LOADING SCREEN
========================================================= */

function showLoading() {

    const loader =
        document.getElementById(
            "loading-screen"
        );


    if (!loader) {
        return;
    }


    loader.style.display =
        "flex";

}


/* =========================================================
   HIDE LOADING
========================================================= */

function hideLoading() {

    const loader =
        document.getElementById(
            "loading-screen"
        );


    if (!loader) {
        return;
    }


    loader.style.display =
        "none";

}


/* =========================================================
   ADMIN INITIALIZATION
========================================================= */

async function initializeAdmin() {

    try {

        showLoading();


        /* -----------------------------------------
           LOAD PRODUCTS
        ----------------------------------------- */

        await loadProducts();


        updateProductCount();


        /* -----------------------------------------
           LOAD ORDER STATS
        ----------------------------------------- */

        await loadOrderStats();

        await loadCustomerOrders();


        if (
            firebaseStatus
        ) {

            firebaseStatus.innerText =
                "Connected ✅";

        }


    }

    catch (error) {

        console.error(
            "Admin Initialization Error:",
            error
        );


        if (
            firebaseStatus
        ) {

            firebaseStatus.innerText =
                "Connection Failed ❌";

        }

    }

    finally {

        hideLoading();

    }

}


/* =========================================================
   START ADMIN AFTER LOGIN
========================================================= */

let adminStarted =
    false;


function startAdminPanel() {

    if (adminStarted) {

        return;

    }


    adminStarted =
        true;


    initializeAdmin();

}


/* =========================================================
   AUTH STATE — START DATA ONLY AFTER LOGIN
========================================================= */

onAuthStateChanged(
    auth,
    function (user) {

        if (user) {

            showAdminPanel();

            startAdminPanel();

        }

        else {

            showLogin();

            adminStarted =
                false;

        }

    }
);


/* =========================================================
   CONSOLE
========================================================= */

console.log(
    "Admin Part 4 Loaded"
);

// ==========================================
// CONSOLE
// ==========================================

console.log(
    "Admin Authentication Protection Loaded"
);
// ==========================================
// ADMIN LOGOUT
// ==========================================

window.logoutAdmin = async function () {

    try {

        await signOut(auth);

        console.log("Admin Logged Out Successfully");

        window.location.replace("auth.html");

    } catch (error) {

        console.error(
            "Logout Error:",
            error
        );

        alert(
            "Logout failed. Please try again."
        );

    }

};