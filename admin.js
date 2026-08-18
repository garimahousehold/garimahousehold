/* =========================================================
   GARIMA'S HOUSE HOLD
   ADMIN.JS
   PART 1 / 5

   Firebase:
   12.16.0
========================================================= */


/* =========================================================
   FIREBASE IMPORTS
========================================================= */

import {
    db,
    auth,
    storage
} from "./firebase.js";


import {
    collection,
    doc,
    getDocs,
    getDoc,
    addDoc,
    updateDoc,
    deleteDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";


import {
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    sendPasswordResetEmail,
    setPersistence,
    browserLocalPersistence,
    browserSessionPersistence
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";


import {
    ref,
    uploadBytes,
    getDownloadURL
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-storage.js";


/* =========================================================
   ADMIN CONFIGURATION
========================================================= */

const ADMIN_EMAIL =
    "garimakothari1995@gmail.com";


/* =========================================================
   GLOBAL VARIABLES
========================================================= */

let products = [];

let editingProductId = null;

let currentOrderId = null;

let isLoadingProducts = false;

let isLoadingOrders = false;


/* =========================================================
   DOM HELPER
========================================================= */

function $(id) {

    return document.getElementById(id);

}


/* =========================================================
   HTML ESCAPE
========================================================= */

function escapeHtml(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(value)

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
   NUMBER HELPER
========================================================= */

function numberValue(value) {

    const number =
        Number(value);


    return Number.isFinite(number)
        ? number
        : 0;

}


/* =========================================================
   MONEY FORMAT
========================================================= */

function money(value) {

    return (
        "Rs. " +
        numberValue(value)
            .toLocaleString("en-IN")
    );

}


/* =========================================================
   PRODUCT ID
========================================================= */

function getProductId(
    product
) {

    return (
        product?.id ||
        product?.productId ||
        ""
    );

}


/* =========================================================
   PRODUCT NAME
========================================================= */

function getProductName(
    product
) {

    return (
        product?.name ||
        "Product"
    );

}


/* =========================================================
   PRODUCT IMAGE
========================================================= */

function getProductImage(
    product
) {

    return (
        product?.image ||
        product?.imageUrl ||
        "image/no-image.png"
    );

}


/* =========================================================
   PRODUCT PRICE
========================================================= */

function getProductPrice(
    product
) {

    return numberValue(
        product?.price
    );

}


/* =========================================================
   PRODUCT MRP
========================================================= */

function getProductMrp(
    product
) {

    return numberValue(
        product?.mrp
    );

}


/* =========================================================
   PRODUCT STOCK
========================================================= */

function getProductStock(
    product
) {

    return numberValue(
        product?.stock
    );

}


/* =========================================================
   PRODUCT WEIGHT
========================================================= */

function getProductWeight(
    product
) {

    return numberValue(
        product?.weight
    );

}


/* =========================================================
   PRODUCT CATEGORY
========================================================= */

function getProductCategory(
    product
) {

    return (
        product?.category ||
        "Uncategorized"
    );

}


/* =========================================================
   PRODUCT DESCRIPTION
========================================================= */

function getProductDescription(
    product
) {

    return (
        product?.description ||
        ""
    );

}


/* =========================================================
   PRODUCT STATUS
========================================================= */

function getProductStatus(
    product
) {

    const stock =
        getProductStock(
            product
        );


    return stock > 0
        ? "In Stock"
        : "Out of Stock";

}


/* =========================================================
   TOAST
========================================================= */

function showToast(
    message,
    type = "success"
) {

    const toast =
        $("adminToast");


    const toastMessage =
        $("adminToastMessage");


    if (
        !toast ||
        !toastMessage
    ) {

        return;

    }


    toastMessage.textContent =
        message;


    toast.dataset.type =
        type;


    toast.hidden =
        false;


    clearTimeout(
        window.adminToastTimer
    );


    window.adminToastTimer =
        setTimeout(
            () => {

                toast.hidden =
                    true;

            },
            3000
        );

}


/* =========================================================
   LOGIN ERROR
========================================================= */

function showLoginError(
    message
) {

    const errorBox =
        $("loginError");


    if (!errorBox) {

        return;

    }


    errorBox.textContent =
        message;


    errorBox.hidden =
        false;

}


/* =========================================================
   CLEAR LOGIN ERROR
========================================================= */

function clearLoginError() {

    const errorBox =
        $("loginError");


    if (!errorBox) {

        return;

    }


    errorBox.textContent =
        "";


    errorBox.hidden =
        true;

}


/* =========================================================
   ADMIN LOGIN UI
========================================================= */

function showLoginScreen() {

    const loginSection =
        $("adminLogin");


    const adminPanel =
        $("adminPanel");


    if (loginSection) {

        loginSection.hidden =
            false;

    }


    if (adminPanel) {

        adminPanel.hidden =
            true;

    }

}


/* =========================================================
   ADMIN PANEL UI
========================================================= */

function showAdminPanel() {

    const loginSection =
        $("adminLogin");


    const adminPanel =
        $("adminPanel");


    if (loginSection) {

        loginSection.hidden =
            true;

    }


    if (adminPanel) {

        adminPanel.hidden =
            false;

    }

}


/* =========================================================
   PASSWORD TOGGLE
========================================================= */

function setupPasswordToggle() {

    const button =
        $("togglePassword");


    const password =
        $("adminPassword");


    if (
        !button ||
        !password
    ) {

        return;

    }


    if (
        button.dataset.connected ===
        "true"
    ) {

        return;

    }


    button.dataset.connected =
        "true";


    button.addEventListener(
        "click",
        () => {

            const isPassword =
                password.type ===
                "password";


            password.type =
                isPassword
                    ? "text"
                    : "password";


            const icon =
                button.querySelector(
                    "i"
                );


            if (icon) {

                icon.classList.toggle(
                    "fa-eye",
                    !isPassword
                );

                icon.classList.toggle(
                    "fa-eye-slash",
                    isPassword
                );

            }


            button.setAttribute(
                "aria-label",
                isPassword
                    ? "Hide password"
                    : "Show password"
            );

        }
    );

}


/* =========================================================
   ADMIN LOGIN
========================================================= */

function setupLogin() {

    const form =
        $("adminLoginForm");


    if (!form) {

        console.error(
            "Admin login form not found."
        );

        return;

    }


    if (
        form.dataset.connected ===
        "true"
    ) {

        return;

    }


    form.dataset.connected =
        "true";


    form.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            clearLoginError();


            const emailInput =
                $("adminEmail");


            const passwordInput =
                $("adminPassword");


            const rememberInput =
                $("remember");


            const loginButton =
                $("loginButton");


            const email =
                emailInput
                    ? emailInput.value.trim()
                    : "";


            const password =
                passwordInput
                    ? passwordInput.value
                    : "";


            if (!email) {

                showLoginError(
                    "Please enter your email."
                );

                return;

            }


            if (!password) {

                showLoginError(
                    "Please enter your password."
                );

                return;

            }


            if (loginButton) {

                loginButton.disabled =
                    true;


                loginButton.innerHTML = `

                    <i
                        class="fa-solid fa-spinner fa-spin"
                    ></i>

                    <span>
                        Logging in...
                    </span>

                `;

            }


            try {

                const persistence =
                    rememberInput &&
                    rememberInput.checked

                        ? browserLocalPersistence

                        : browserSessionPersistence;


                await setPersistence(
                    auth,
                    persistence
                );


                const credential =
                    await signInWithEmailAndPassword(
                        auth,
                        email,
                        password
                    );


                const user =
                    credential.user;


                if (
                    !user.email ||
                    user.email.toLowerCase() !==
                    ADMIN_EMAIL.toLowerCase()
                ) {

                    await signOut(
                        auth
                    );


                    showLoginError(
                        "This account is not authorized for Admin Panel."
                    );


                    return;

                }


                console.log(
                    "Admin login successful:",
                    user.email
                );


                showAdminPanel();


                clearLoginError();


                await initializeDashboard();


            } catch (error) {

                console.error(
                    "Admin Login Error:",
                    error
                );


                switch (
                    error.code
                ) {

                    case "auth/invalid-credential":

                        showLoginError(
                            "Invalid Email or Password."
                        );

                        break;


                    case "auth/invalid-email":

                        showLoginError(
                            "Invalid email address."
                        );

                        break;


                    case "auth/user-not-found":

                        showLoginError(
                            "User not found."
                        );

                        break;


                    case "auth/wrong-password":

                        showLoginError(
                            "Incorrect password."
                        );

                        break;


                    case "auth/too-many-requests":

                        showLoginError(
                            "Too many login attempts. Please try again later."
                        );

                        break;


                    case "auth/network-request-failed":

                        showLoginError(
                            "Network error. Please check your internet connection."
                        );

                        break;


                    default:

                        showLoginError(
                            error.message ||
                            "Login failed."
                        );

                        break;

                }

            } finally {

                if (loginButton) {

                    loginButton.disabled =
                        false;


                    loginButton.innerHTML = `

                        <i
                            class="fa-solid fa-right-to-bracket"
                        ></i>

                        <span>
                            Login
                        </span>

                    `;

                }

            }

        }
    );

}


/* =========================================================
   LOGOUT
========================================================= */

function setupLogout() {

    const button =
        $("logoutButton");


    if (!button) {

        return;

    }


    if (
        button.dataset.connected ===
        "true"
    ) {

        return;

    }


    button.dataset.connected =
        "true";


    button.addEventListener(
        "click",
        async () => {

            try {

                await signOut(
                    auth
                );


                showLoginScreen();


                const email =
                    $("adminEmail");


                const password =
                    $("adminPassword");


                if (email) {

                    email.value =
                        "";

                }


                if (password) {

                    password.value =
                        "";

                }


                showToast(
                    "Logged out successfully."
                );


            } catch (error) {

                console.error(
                    "Logout Error:",
                    error
                );


                showToast(
                    "Unable to logout.",
                    "error"
                );

            }

        }
    );

}


/* =========================================================
   FORGOT PASSWORD
========================================================= */

function setupPasswordReset() {

    /*
       Fresh admin.html mein reset button
       intentionally nahi rakha gaya hai.

       Function future use ke liye ready hai.
    */

    return;

}


/* =========================================================
   DASHBOARD INITIALIZATION
========================================================= */

async function initializeDashboard() {

    console.log(
        "Initializing Admin Dashboard..."
    );


    try {

        await Promise.all([
            loadProducts(),
            loadCustomerOrders()
        ]);


        updateDashboardStats();


        console.log(
            "Admin Dashboard Ready"
        );


    } catch (error) {

        console.error(
            "Dashboard Initialization Error:",
            error
        );


        showToast(
            "Unable to load dashboard data.",
            "error"
        );

    }

}


/* =========================================================
   AUTH STATE
========================================================= */

function setupAuthState() {

    onAuthStateChanged(
        auth,
        async user => {

            console.log(
                "Auth State:",
                user
                    ? user.email
                    : "Logged Out"
            );


            if (!user) {

                showLoginScreen();

                return;

            }


            if (
                !user.email ||
                user.email.toLowerCase() !==
                ADMIN_EMAIL.toLowerCase()
            ) {

                try {

                    await signOut(
                        auth
                    );

                } catch (error) {

                    console.error(
                        "Unauthorized Logout Error:",
                        error
                    );

                }


                showLoginScreen();

                return;

            }


            showAdminPanel();


            await initializeDashboard();

        }
    );

}


/* =========================================================
   INITIAL LOAD LOG
========================================================= */

console.log(
    "========================================"
);

console.log(
    "Garima's House Hold Admin JS Loaded"
);

console.log(
    "Firebase Version: 12.16.0"
);

console.log(
    "Admin Email:",
    ADMIN_EMAIL
);

console.log(
    "========================================"
);
/* =========================================================
   PRODUCT HELPERS
========================================================= */


/* =========================================================
   PRODUCT FORM DATA
========================================================= */

function getProductFormData() {

    return {

        name:
            $("product-name")?.value.trim() ||
            "",

        sku:
            $("product-sku")?.value.trim() ||
            "",

        category:
            $("product-category")?.value.trim() ||
            "",

        mrp:
            numberValue(
                $("product-mrp")?.value
            ),

        price:
            numberValue(
                $("product-price")?.value
            ),

        stock:
            numberValue(
                $("product-stock")?.value
            ),

        weight:
            numberValue(
                $("product-weight")?.value
            ),

        image:
            $("product-image")?.value.trim() ||
            "",

        description:
            $("product-description")?.value.trim() ||
            "",

        newArrival:
            Boolean(
                $("product-new-arrival")?.checked
            ),

        bestSeller:
            Boolean(
                $("product-best-seller")?.checked
            )

    };

}


/* =========================================================
   CLEAR PRODUCT FORM
========================================================= */

function clearProductForm() {

    const form =
        $("product-form");


    if (form) {

        form.reset();

    }


    const productId =
        $("product-id");


    if (productId) {

        productId.value =
            "";

    }


    editingProductId =
        null;


    const cancelButton =
        $("cancel-edit-button");


    if (cancelButton) {

        cancelButton.hidden =
            true;

    }


    const saveButton =
        $("save-product-button");


    if (saveButton) {

        saveButton.innerHTML = `

            <i
                class="fa-solid fa-floppy-disk"
            ></i>

            <span>
                Save Product
            </span>

        `;

    }


    const previewWrap =
        $("product-image-preview-wrap");


    const preview =
        $("product-image-preview");


    if (previewWrap) {

        previewWrap.hidden =
            true;

    }


    if (preview) {

        preview.src =
            "";

    }

}


/* =========================================================
   IMAGE PREVIEW
========================================================= */

function setupImagePreview() {

    const imageInput =
        $("product-image");


    const preview =
        $("product-image-preview");


    const previewWrap =
        $("product-image-preview-wrap");


    if (
        !imageInput ||
        !preview ||
        !previewWrap
    ) {

        return;

    }


    if (
        imageInput.dataset.connected ===
        "true"
    ) {

        return;

    }


    imageInput.dataset.connected =
        "true";


    imageInput.addEventListener(
        "input",
        () => {

            const url =
                imageInput.value.trim();


            if (!url) {

                preview.src =
                    "";

                previewWrap.hidden =
                    true;

                return;

            }


            preview.src =
                url;


            preview.onload =
                () => {

                    previewWrap.hidden =
                        false;

                };


            preview.onerror =
                () => {

                    previewWrap.hidden =
                        true;

                };

        }
    );

}


/* =========================================================
   LOAD PRODUCTS
========================================================= */

async function loadProducts() {

    if (isLoadingProducts) {

        return;

    }


    isLoadingProducts =
        true;


    const productsList =
        $("products-list");


    try {

        const productsRef =
            collection(
                db,
                "products"
            );


        const snapshot =
            await getDocs(
                productsRef
            );


        products =
            [];


        snapshot.forEach(
            productDoc => {

                products.push({

                    id:
                        productDoc.id,

                    ...productDoc.data()

                });

            }
        );


        console.log(
            "Products Loaded:",
            products.length
        );


        renderProducts(
            products
        );


        updateDashboardStats();


    } catch (error) {

        console.error(
            "Load Products Error:",
            error
        );


        if (productsList) {

            productsList.innerHTML = `

                <tr>

                    <td
                        colspan="10"
                        class="table-error"
                    >

                        Unable to load products.

                    </td>

                </tr>

            `;

        }


        throw error;


    } finally {

        isLoadingProducts =
            false;

    }

}


/* =========================================================
   RENDER PRODUCTS
========================================================= */

function renderProducts(
    list
) {

    const productsList =
        $("products-list");


    if (!productsList) {

        return;

    }


    if (
        !list ||
        list.length === 0
    ) {

        productsList.innerHTML = `

            <tr>

                <td
                    colspan="10"
                    class="table-empty"
                >

                    <i
                        class="fa-solid fa-box-open"
                    ></i>

                    <span>
                        No Products Found
                    </span>

                </td>

            </tr>

        `;

        return;

    }


    productsList.innerHTML =
        list.map(
            product => {

                const id =
                    getProductId(
                        product
                    );


                const name =
                    getProductName(
                        product
                    );


                const image =
                    getProductImage(
                        product
                    );


                const sku =
                    product.sku ||
                    "N/A";


                const category =
                    getProductCategory(
                        product
                    );


                const mrp =
                    getProductMrp(
                        product
                    );


                const price =
                    getProductPrice(
                        product
                    );


                const stock =
                    getProductStock(
                        product
                    );


                const weight =
                    getProductWeight(
                        product
                    );


                const stockClass =
                    stock > 0
                        ? "stock-in"
                        : "stock-out";


                const sections = [];


                if (
                    product.newArrival
                ) {

                    sections.push(
                        "New Arrival"
                    );

                }


                if (
                    product.bestSeller
                ) {

                    sections.push(
                        "Best Seller"
                    );

                }


                if (
                    sections.length === 0
                ) {

                    sections.push(
                        "—"
                    );

                }


                return `

                    <tr
                        data-product-id="${escapeHtml(id)}"
                    >


                        <!-- IMAGE -->

                        <td>

                            <img
                                src="${escapeHtml(image)}"
                                class="product-table-image"
                                alt="${escapeHtml(name)}"
                                onerror="
                                    this.src='image/no-image.png'
                                "
                            >

                        </td>


                        <!-- PRODUCT -->

                        <td>

                            <strong>
                                ${escapeHtml(name)}
                            </strong>

                            ${
                                product.description
                                    ? `
                                        <small
                                            class="product-description-cell"
                                        >
                                            ${escapeHtml(
                                                product.description
                                            )}
                                        </small>
                                      `
                                    : ""
                            }

                        </td>


                        <!-- SKU -->

                        <td>

                            ${escapeHtml(sku)}

                        </td>


                        <!-- CATEGORY -->

                        <td>

                            ${escapeHtml(category)}

                        </td>


                        <!-- MRP -->

                        <td>

                            ${
                                mrp > 0
                                    ? money(mrp)
                                    : "—"
                            }

                        </td>


                        <!-- PRICE -->

                        <td>

                            <strong>
                                ${money(price)}
                            </strong>

                        </td>


                        <!-- STOCK -->

                        <td>

                            <span
                                class="stock-badge ${stockClass}"
                            >

                                ${stock}

                            </span>

                        </td>


                        <!-- WEIGHT -->

                        <td>

                            ${
                                weight > 0
                                    ? weight.toFixed(2) + " kg"
                                    : "—"
                            }

                        </td>


                        <!-- SECTIONS -->

                        <td>

                            <div
                                class="product-section-badges"
                            >

                                ${sections.map(
                                    section => `

                                        <span
                                            class="section-badge"
                                        >
                                            ${escapeHtml(
                                                section
                                            )}
                                        </span>

                                    `
                                ).join("")}

                            </div>

                        </td>


                        <!-- ACTIONS -->

                        <td>

                            <div
                                class="product-actions"
                            >

                                <button
                                    type="button"
                                    class="edit-product-btn"
                                    data-product-id="${escapeHtml(id)}"
                                    title="Edit Product"
                                >

                                    <i
                                        class="fa-solid fa-pen"
                                    ></i>

                                </button>


                                <button
                                    type="button"
                                    class="delete-product-btn"
                                    data-product-id="${escapeHtml(id)}"
                                    title="Delete Product"
                                >

                                    <i
                                        class="fa-solid fa-trash"
                                    ></i>

                                </button>

                            </div>

                        </td>


                    </tr>

                `;

            }
        ).join("");

}


/* =========================================================
   SAVE PRODUCT
========================================================= */

async function saveProduct() {

    const form =
        $("product-form");


    if (!form) {

        return;

    }


    const data =
        getProductFormData();


    /* -----------------------------------------------------
       VALIDATION
    ----------------------------------------------------- */

    if (!data.name) {

        showToast(
            "Please enter product name.",
            "error"
        );

        return;

    }


    if (!data.category) {

        showToast(
            "Please enter product category.",
            "error"
        );

        return;

    }


    if (
        data.price <= 0
    ) {

        showToast(
            "Please enter a valid selling price.",
            "error"
        );

        return;

    }


    if (
        data.mrp > 0 &&
        data.mrp < data.price
    ) {

        showToast(
            "MRP cannot be less than selling price.",
            "error"
        );

        return;

    }


    const saveButton =
        $("save-product-button");


    if (saveButton) {

        saveButton.disabled =
            true;


        saveButton.innerHTML = `

            <i
                class="fa-solid fa-spinner fa-spin"
            ></i>

            <span>
                Saving...
            </span>

        `;

    }


    try {

        /* -------------------------------------------------
           EDIT EXISTING PRODUCT
        ------------------------------------------------- */

        if (editingProductId) {

            await updateDoc(

                doc(
                    db,
                    "products",
                    editingProductId
                ),

                {

                    ...data,

                    updatedAt:
                        serverTimestamp()

                }

            );


            showToast(
                "Product updated successfully."
            );

        }


        /* -------------------------------------------------
           ADD NEW PRODUCT
        ------------------------------------------------- */

        else {

            const newProduct =
                await addDoc(

                    collection(
                        db,
                        "products"
                    ),

                    {

                        ...data,

                        createdAt:
                            serverTimestamp(),

                        updatedAt:
                            serverTimestamp()

                    }

                );


            console.log(
                "Product Added:",
                newProduct.id
            );


            showToast(
                "Product added successfully."
            );

        }


        clearProductForm();


        await loadProducts();


    } catch (error) {

        console.error(
            "Save Product Error:",
            error
        );


        showToast(
            "Unable to save product.",
            "error"
        );

    } finally {

        if (saveButton) {

            saveButton.disabled =
                false;


            saveButton.innerHTML = `

                <i
                    class="fa-solid fa-floppy-disk"
                ></i>

                <span>
                    Save Product
                </span>

            `;

        }

    }

}


/* =========================================================
   EDIT PRODUCT
========================================================= */

function editProduct(
    productId
) {

    const product =
        products.find(
            item =>
                item.id ===
                productId
        );


    if (!product) {

        showToast(
            "Product not found.",
            "error"
        );

        return;

    }


    editingProductId =
        productId;


    $("product-id").value =
        productId;


    $("product-name").value =
        product.name ||
        "";


    $("product-sku").value =
        product.sku ||
        "";


    $("product-category").value =
        product.category ||
        "";


    $("product-mrp").value =
        product.mrp ??
        "";


    $("product-price").value =
        product.price ??
        "";


    $("product-stock").value =
        product.stock ??
        0;


    $("product-weight").value =
        product.weight ??
        0;


    $("product-image").value =
        product.image ||
        "";


    $("product-description").value =
        product.description ||
        "";


    $("product-new-arrival").checked =
        Boolean(
            product.newArrival
        );


    $("product-best-seller").checked =
        Boolean(
            product.bestSeller
        );


    const preview =
        $("product-image-preview");


    const previewWrap =
        $("product-image-preview-wrap");


    if (
        product.image &&
        preview &&
        previewWrap
    ) {

        preview.src =
            product.image;


        previewWrap.hidden =
            false;

    }


    const cancelButton =
        $("cancel-edit-button");


    if (cancelButton) {

        cancelButton.hidden =
            false;

    }


    const saveButton =
        $("save-product-button");


    if (saveButton) {

        saveButton.innerHTML = `

            <i
                class="fa-solid fa-pen"
            ></i>

            <span>
                Update Product
            </span>

        `;

    }


    const productSection =
        $("productSection");


    if (productSection) {

        productSection.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    }

}


/* =========================================================
   DELETE PRODUCT
========================================================= */

async function deleteProduct(
    productId
) {

    const product =
        products.find(
            item =>
                item.id ===
                productId
        );


    if (!product) {

        showToast(
            "Product not found.",
            "error"
        );

        return;

    }


    const confirmed =
        window.confirm(
            `Delete "${getProductName(product)}"?`
        );


    if (!confirmed) {

        return;

    }


    try {

        await deleteDoc(

            doc(
                db,
                "products",
                productId
            )

        );


        showToast(
            "Product deleted successfully."
        );


        if (
            editingProductId ===
            productId
        ) {

            clearProductForm();

        }


        await loadProducts();


    } catch (error) {

        console.error(
            "Delete Product Error:",
            error
        );


        showToast(
            "Unable to delete product.",
            "error"
        );

    }

}


/* =========================================================
   PRODUCT SEARCH
========================================================= */

function setupProductSearch() {

    const searchInput =
        $("product-search");


    if (!searchInput) {

        return;

    }


    if (
        searchInput.dataset.connected ===
        "true"
    ) {

        return;

    }


    searchInput.dataset.connected =
        "true";


    searchInput.addEventListener(
        "input",
        () => {

            const search =
                searchInput.value
                    .trim()
                    .toLowerCase();


            if (!search) {

                renderProducts(
                    products
                );

                return;

            }


            const filtered =
                products.filter(
                    product => {

                        const name =
                            String(
                                product.name ||
                                ""
                            ).toLowerCase();


                        const sku =
                            String(
                                product.sku ||
                                ""
                            ).toLowerCase();


                        const category =
                            String(
                                product.category ||
                                ""
                            ).toLowerCase();


                        return (
                            name.includes(
                                search
                            ) ||
                            sku.includes(
                                search
                            ) ||
                            category.includes(
                                search
                            )
                        );

                    }
                );


            renderProducts(
                filtered
            );

        }
    );

}


/* =========================================================
   PRODUCT EVENTS
========================================================= */

function setupProductEvents() {

    const productList =
        $("products-list");


    if (!productList) {

        return;

    }


    if (
        productList.dataset.connected ===
        "true"
    ) {

        return;

    }


    productList.dataset.connected =
        "true";


    productList.addEventListener(
        "click",
        event => {

            const editButton =
                event.target.closest(
                    ".edit-product-btn"
                );


            if (editButton) {

                editProduct(
                    editButton.dataset.productId
                );

                return;

            }


            const deleteButton =
                event.target.closest(
                    ".delete-product-btn"
                );


            if (deleteButton) {

                deleteProduct(
                    deleteButton.dataset.productId
                );

                return;

            }

        }
    );

}


/* =========================================================
   PRODUCT FORM EVENTS
========================================================= */

function setupProductForm() {

    const form =
        $("product-form");


    if (!form) {

        return;

    }


    if (
        form.dataset.connected ===
        "true"
    ) {

        return;

    }


    form.dataset.connected =
        "true";


    form.addEventListener(
        "submit",
        async event => {

            event.preventDefault();

            await saveProduct();

        }
    );


    const cancelButton =
        $("cancel-edit-button");


    if (cancelButton) {

        cancelButton.addEventListener(
            "click",
            () => {

                clearProductForm();

            }
        );

    }

}


/* =========================================================
   END OF PART 2
========================================================= */
/* =========================================================
   CUSTOMER ORDERS
========================================================= */


/* =========================================================
   LOAD CUSTOMER ORDERS
========================================================= */

async function loadCustomerOrders() {

    if (isLoadingOrders) {

        return;

    }


    isLoadingOrders =
        true;


    const ordersList =
        $("orders-list");


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


        const orders =
            [];


        snapshot.forEach(
            orderDoc => {

                orders.push({

                    id:
                        orderDoc.id,

                    ...orderDoc.data()

                });

            }
        );


        console.log(
            "Orders Loaded:",
            orders.length
        );


        renderOrders(
            orders
        );


        updateDashboardStats(
            orders
        );


    } catch (error) {

        console.error(
            "Load Customer Orders Error:",
            error
        );


        if (ordersList) {

            ordersList.innerHTML = `

                <tr>

                    <td
                        colspan="7"
                        class="table-error"
                    >

                        Unable to load orders.

                    </td>

                </tr>

            `;

        }


        throw error;


    } finally {

        isLoadingOrders =
            false;

    }

}


/* =========================================================
   ORDER CUSTOMER DETAILS
========================================================= */

function getOrderCustomer(
    order
) {

    return (
        order?.customer ||
        {}
    );

}


/* =========================================================
   ORDER TOTAL
========================================================= */

function getOrderTotal(
    order
) {

    return numberValue(
        order?.total
    );

}


/* =========================================================
   ORDER STATUS
========================================================= */

function getOrderStatus(
    order
) {

    return (
        order?.orderStatus ||
        order?.status ||
        "New"
    );

}


/* =========================================================
   RENDER ORDERS
========================================================= */

function renderOrders(
    orders
) {

    const ordersList =
        $("orders-list");


    if (!ordersList) {

        return;

    }


    if (
        !orders ||
        orders.length === 0
    ) {

        ordersList.innerHTML = `

            <tr>

                <td
                    colspan="7"
                    class="table-empty"
                >

                    <i
                        class="fa-solid fa-cart-shopping"
                    ></i>

                    <span>
                        No Orders Found
                    </span>

                </td>

            </tr>

        `;

        return;

    }


    ordersList.innerHTML =
        orders.map(
            order => {

                const orderId =
                    order.id ||
                    order.orderId ||
                    "N/A";


                const customer =
                    getOrderCustomer(
                        order
                    );


                const name =
                    customer.name ||
                    order.customerName ||
                    "N/A";


                const mobile =
                    customer.mobile ||
                    customer.phone ||
                    order.mobile ||
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
                    getOrderTotal(
                        order
                    );


                const status =
                    getOrderStatus(
                        order
                    );


                return `

                    <tr
                        data-order-id="${escapeHtml(order.id)}"
                    >


                        <!-- ORDER ID -->

                        <td>

                            <strong>
                                ${escapeHtml(orderId)}
                            </strong>

                        </td>


                        <!-- CUSTOMER -->

                        <td>

                            ${escapeHtml(name)}

                        </td>


                        <!-- MOBILE -->

                        <td>

                            ${escapeHtml(mobile)}

                        </td>


                        <!-- ADDRESS -->

                        <td>

                            ${escapeHtml(address)}

                            ${
                                city ||
                                state ||
                                pincode
                                    ? `

                                        <br>

                                        <small>

                                            ${escapeHtml(city)}

                                            ${
                                                city &&
                                                state
                                                    ? ", "
                                                    : ""
                                            }

                                            ${escapeHtml(state)}

                                            ${
                                                pincode
                                                    ? " - " +
                                                      escapeHtml(
                                                          pincode
                                                      )
                                                    : ""
                                            }

                                        </small>

                                      `
                                    : ""
                            }

                        </td>


                        <!-- TOTAL -->

                        <td>

                            <strong>
                                ${money(total)}
                            </strong>

                        </td>


                        <!-- STATUS -->

                        <td>

                            <select
                                class="order-status-select"
                                data-order-id="${escapeHtml(order.id)}"
                            >

                                <option
                                    value="New"
                                    ${
                                        status ===
                                        "New"
                                            ? "selected"
                                            : ""
                                    }
                                >
                                    New
                                </option>


                                <option
                                    value="Confirmed"
                                    ${
                                        status ===
                                        "Confirmed"
                                            ? "selected"
                                            : ""
                                    }
                                >
                                    Confirmed
                                </option>


                                <option
                                    value="Shipped"
                                    ${
                                        status ===
                                        "Shipped"
                                            ? "selected"
                                            : ""
                                    }
                                >
                                    Shipped
                                </option>


                                <option
                                    value="Delivered"
                                    ${
                                        status ===
                                        "Delivered"
                                            ? "selected"
                                            : ""
                                    }
                                >
                                    Delivered
                                </option>


                                <option
                                    value="Cancelled"
                                    ${
                                        status ===
                                        "Cancelled"
                                            ? "selected"
                                            : ""
                                    }
                                >
                                    Cancelled
                                </option>

                            </select>

                        </td>


                        <!-- VIEW -->

                        <td>

                            <button
                                type="button"
                                class="view-order-btn"
                                data-order-id="${escapeHtml(order.id)}"
                                title="View Order Details"
                            >

                                <i
                                    class="fa-solid fa-eye"
                                ></i>

                                View

                            </button>

                        </td>


                    </tr>

                `;

            }
        ).join("");

}


/* =========================================================
   UPDATE ORDER STATUS
========================================================= */

async function updateOrderStatus(
    orderId,
    newStatus
) {

    if (
        !orderId ||
        !newStatus
    ) {

        return;

    }


    try {

        await updateDoc(

            doc(
                db,
                "orders",
                orderId
            ),

            {

                orderStatus:
                    newStatus,

                updatedAt:
                    serverTimestamp()

            }

        );


        showToast(
            "Order status updated successfully."
        );


    } catch (error) {

        console.error(
            "Update Order Status Error:",
            error
        );


        showToast(
            "Unable to update order status.",
            "error"
        );


        /*
           Reload orders so the UI returns
           to the saved Firestore value.
        */

        await loadCustomerOrders();

    }

}


/* =========================================================
   ORDER STATUS EVENTS
========================================================= */

function setupOrderStatusEvents() {

    const ordersList =
        $("orders-list");


    if (!ordersList) {

        return;

    }


    if (
        ordersList.dataset.statusConnected ===
        "true"
    ) {

        return;

    }


    ordersList.dataset.statusConnected =
        "true";


    ordersList.addEventListener(
        "change",
        event => {

            const select =
                event.target.closest(
                    ".order-status-select"
                );


            if (!select) {

                return;

            }


            const orderId =
                select.dataset.orderId;


            const newStatus =
                select.value;


            updateOrderStatus(
                orderId,
                newStatus
            );

        }
    );

}


/* =========================================================
   REFRESH ORDERS
========================================================= */

function setupRefreshOrders() {

    const button =
        $("refreshOrdersButton");


    if (!button) {

        return;

    }


    if (
        button.dataset.connected ===
        "true"
    ) {

        return;

    }


    button.dataset.connected =
        "true";


    button.addEventListener(
        "click",
        async () => {

            if (
                isLoadingOrders
            ) {

                return;

            }


            button.disabled =
                true;


            button.innerHTML = `

                <i
                    class="fa-solid fa-spinner fa-spin"
                ></i>

                Refreshing...

            `;


            try {

                await loadCustomerOrders();


                showToast(
                    "Orders refreshed successfully."
                );


            } catch (error) {

                console.error(
                    "Refresh Orders Error:",
                    error
                );


                showToast(
                    "Unable to refresh orders.",
                    "error"
                );

            } finally {

                button.disabled =
                    false;


                button.innerHTML = `

                    <i
                        class="fa-solid fa-rotate"
                    ></i>

                    Refresh Orders

                `;

            }

        }
    );

}


/* =========================================================
   ORDER SEARCH
========================================================= */

function setupOrderSearch() {

    /*
       Current admin.html does not have a separate
       order search input.

       Kept intentionally empty so we don't create
       another unnecessary element.
    */

    return;

}


/* =========================================================
   VIEW ORDER DETAILS
========================================================= */

async function viewOrderDetails(
    orderId
) {

    if (!orderId) {

        return;

    }


    const modal =
        $("orderDetailsModal");


    const content =
        $("orderDetailsContent");


    if (
        !modal ||
        !content
    ) {

        return;

    }


    currentOrderId =
        orderId;


    modal.hidden =
        false;


    content.innerHTML = `

        <div
            class="order-loading"
        >

            <i
                class="fa-solid fa-spinner fa-spin"
            ></i>

            <p>
                Loading order details...
            </p>

        </div>

    `;


    try {

        const orderSnapshot =
            await getDoc(

                doc(
                    db,
                    "orders",
                    orderId
                )

            );


        if (
            !orderSnapshot.exists()
        ) {

            content.innerHTML = `

                <div
                    class="table-error"
                >

                    Order not found.

                </div>

            `;

            return;

        }


        const order =
            orderSnapshot.data();


        const customer =
            getOrderCustomer(
                order
            );

const items =
    Array.isArray(
        order.products
    )
        ? order.products
        : [];


        const orderNumber =
            order.orderId ||
            orderSnapshot.id;


        const paymentMethod =
    order.payment?.method ||
    order.paymentMethod ||
    "N/A";

const paymentStatus =
    order.payment?.status ||
    order.paymentStatus ||
    "N/A";

    const paymentReference =
    order.payment?.reference ||
    order.payment?.transactionId ||
    order.payment?.utr ||
    order.paymentReference ||
    order.utr ||
    "N/A";


const paymentProof =
    order.payment?.proof ||
    order.payment?.paymentProof ||
    order.paymentProof ||
    "";



        const orderStatus =
            getOrderStatus(
                order
            );


        const subtotal =
            numberValue(
                order.subtotal
            );


        const discount =
            numberValue(
                order.discount
            );


        const shipping =
            numberValue(
                order.deliveryCharge
            );


        const total =
            numberValue(
                order.total
            );


        let itemsHtml = "";


        if (
            items.length === 0
        ) {

            itemsHtml = `

                <div
                    class="order-empty"
                >

                    No products found in this order.

                </div>

            `;

        } else {

            itemsHtml =
    items.map(
        item => {

            const itemName =
                item.name ||
                "Product";


            const itemImage =
                item.image ||
                item.imageUrl ||
                "image/no-image.png";


            const itemSku =
                item.sku ||
                "N/A";


            const quantity =
                numberValue(
                    item.quantity ||
                    item.qty ||
                    1
                );


            const price =
                numberValue(
                    item.price
                );


            const itemTotal =
                price *
                quantity;


            return `

                <div
                    class="order-item"
                    style="
                        display:flex;
                        align-items:center;
                        gap:18px;
                        padding:16px;
                        margin-bottom:12px;
                        border:1px solid #eee;
                        border-radius:14px;
                        background:#fff;
                        box-sizing:border-box;
                    "
                >

                    <!-- PRODUCT IMAGE -->

                    <div
                        style="
                            width:100px;
                            height:100px;
                            min-width:100px;
                            border-radius:12px;
                            overflow:hidden;
                            background:#f8f8f8;
                            display:flex;
                            align-items:center;
                            justify-content:center;
                            border:1px solid #eee;
                        "
                    >

                        <img
                            src="${escapeHtml(itemImage)}"
                            alt="${escapeHtml(itemName)}"
                            style="
                                width:100%;
                                height:100%;
                                object-fit:contain;
                                display:block;
                            "
                            onerror="
                                this.src='image/no-image.png'
                            "
                        >

                    </div>


                    <!-- PRODUCT INFORMATION -->

                    <div
                        class="order-item-info"
                        style="
                            flex:1;
                            min-width:0;
                            display:flex;
                            flex-direction:column;
                            gap:6px;
                        "
                    >

                        <strong
                            style="
                                font-size:17px;
                                color:#333;
                            "
                        >
                            ${escapeHtml(itemName)}
                        </strong>


                        <span
                            style="
                                font-size:13px;
                                color:#777;
                            "
                        >
                            SKU:
                            ${escapeHtml(itemSku)}
                        </span>


                        <span
                            style="
                                font-size:14px;
                                color:#555;
                            "
                        >
                            Quantity:
                            <strong>
                                ${quantity}
                            </strong>
                        </span>


                        <span
                            style="
                                font-size:14px;
                                color:#555;
                            "
                        >
                            Price:
                            <strong>
                                ${money(price)}
                            </strong>
                        </span>

                    </div>


                    <!-- ITEM TOTAL -->

                    <div
                        style="
                            min-width:100px;
                            text-align:right;
                        "
                    >

                        <span
                            style="
                                display:block;
                                font-size:12px;
                                color:#888;
                                margin-bottom:4px;
                            "
                        >
                            Item Total
                        </span>


                        <strong
                            style="
                                font-size:18px;
                                color:#8b1e4b;
                            "
                        >
                            ${money(itemTotal)}
                        </strong>

                    </div>

                </div>

            `;

        }
    ).join("");
        }


            content.innerHTML = `

            <!-- =============================================
                 ORDER INFORMATION
            ============================================== -->

            <div
                class="order-detail-section"
            >

                <h3>
                    Order Information
                </h3>


                <p>
                    <strong>
                        Order ID:
                    </strong>

                    ${escapeHtml(orderNumber)}
                </p>


                <p>
                    <strong>
                        Status:
                    </strong>

                    ${escapeHtml(orderStatus)}
                </p>


                <p>
                    <strong>
                        Payment Method:
                    </strong>

                    ${escapeHtml(paymentMethod)}
                </p>


                <p>
                    <strong>
                        Payment Status:
                    </strong>

                    ${escapeHtml(paymentStatus)}
                </p>

            </div>



            <!-- =============================================
                 CUSTOMER DETAILS
            ============================================== -->

            <div
                class="order-detail-section"
            >

                <h3>
                    Customer Details
                </h3>


                <p>
                    <strong>
                        Name:
                    </strong>

                    ${escapeHtml(
                        customer.name ||
                        "N/A"
                    )}
                </p>


                <p>
                    <strong>
                        Mobile:
                    </strong>

                    ${escapeHtml(
                        customer.mobile ||
                        customer.phone ||
                        "N/A"
                    )}
                </p>


                <p>
                    <strong>
                        Email:
                    </strong>

                    ${escapeHtml(
                        customer.email ||
                        "N/A"
                    )}
                </p>


                <p>
                    <strong>
                        Address:
                    </strong>

                    ${escapeHtml(
                        customer.address ||
                        "N/A"
                    )}
                </p>


                <p>

                    ${escapeHtml(
                        customer.city ||
                        ""
                    )}

                    ${
                        customer.city &&
                        customer.state
                            ? ", "
                            : ""
                    }

                    ${escapeHtml(
                        customer.state ||
                        ""
                    )}

                    ${
                        customer.pincode
                            ? " - " +
                              escapeHtml(
                                  customer.pincode
                              )
                            : ""
                    }

                </p>

            </div>



            <!-- =============================================
                 ORDERED PRODUCTS
            ============================================== -->

            <div
                class="order-detail-section"
            >

                <h3>
                    Ordered Products
                </h3>


                <div
                    class="order-items"
                >

                    ${itemsHtml}

                </div>

            </div>



            <!-- =============================================
                 PAYMENT DETAILS
            ============================================== -->

            <div
                class="order-detail-section"
            >

                <h3>
                    Payment Details
                </h3>


                <p>

                    <strong>
                        Payment Method:
                    </strong>

                    ${escapeHtml(paymentMethod)}

                </p>


                <p>

                    <strong>
                        Payment Status:
                    </strong>

                    ${escapeHtml(paymentStatus)}

                </p>


                ${
                    paymentProof
                        ? `

                            <div
                                class="payment-proof"
                            >

                                <p>
                                    <strong>
                                        Payment Proof:
                                    </strong>
                                </p>

                                <a
                                    href="${escapeHtml(paymentProof)}"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >

                                    <img
                                        src="${escapeHtml(paymentProof)}"
                                        class="payment-proof-image"
                                        alt="Payment Proof"
                                        onerror="
                                            this.style.display='none'
                                        "
                                    >

                                </a>

                            </div>

                          `
                        : `

                            <p>
                                <strong>
                                    Payment Proof:
                                </strong>

                                N/A
                            </p>

                          `
                }

            </div>

<!-- =========================================================
     COUPON SECTION
========================================================= -->

<div class="checkout-coupon-section">

    <h3>
        Have a Coupon?
    </h3>


    <div class="coupon-input-row">

        <input
            type="text"
            id="checkout-coupon-code"
            placeholder="Enter coupon code"
            maxlength="30"
            autocomplete="off"
        >


        <button
            type="button"
            id="apply-coupon"
        >
            Apply
        </button>

    </div>


    <div
        id="coupon-message"
        class="coupon-message"
        hidden
    ></div>


    <div
        id="coupon-applied"
        class="coupon-applied"
        hidden
    >

        <span>

            Coupon:
            <strong
                id="applied-coupon-code"
            ></strong>

        </span>


        <button
            type="button"
            id="remove-coupon"
        >
            Remove
        </button>

    </div>

</div>

            <!-- =============================================
                 PAYMENT SUMMARY
            ============================================== -->

            <div
                class="order-detail-section"
            >

                <h3>
                    Payment Summary
                </h3>


                <p>

                    <strong>
                        Subtotal:
                    </strong>

                    ${money(subtotal)}

                </p>


                <p>

                    <strong>
                        Discount:
                    </strong>

                    - ${money(discount)}

                </p>


                <p>

                    <strong>
                        Delivery:
                    </strong>

                    ${
                        shipping === 0
                            ? "FREE"
                            : money(shipping)
                    }

                </p>


                <hr>


                <h3>

                    Total:
                    ${money(total)}

                </h3>

            </div>

        `;


    } catch (error) {

        console.error(
            "View Order Details Error:",
            error
        );


        content.innerHTML = `

            <div
                class="table-error"
            >

                Unable to load order details.

            </div>

        `;

    }

}


/* =========================================================
   ORDER EVENTS
========================================================= */

function setupOrderEvents() {

    const ordersList =
        $("orders-list");


    if (!ordersList) {

        return;

    }


    if (
        ordersList.dataset.eventsConnected ===
        "true"
    ) {

        return;

    }


    ordersList.dataset.eventsConnected =
        "true";


    ordersList.addEventListener(
        "click",
        event => {

            const viewButton =
                event.target.closest(
                    ".view-order-btn"
                );


            if (!viewButton) {

                return;

            }


            viewOrderDetails(
                viewButton.dataset.orderId
            );

        }
    );

}


/* =========================================================
   CLOSE ORDER DETAILS MODAL
========================================================= */

function closeOrderDetails() {

    const modal =
        $("orderDetailsModal");


    if (!modal) {

        return;

    }


    modal.hidden =
        true;


    currentOrderId =
        null;

}


/* =========================================================
   MODAL EVENTS
========================================================= */

function setupOrderModal() {

    const closeButton =
        $("closeOrderDetailsModal");


    const modal =
        $("orderDetailsModal");


    if (closeButton) {

        if (
            closeButton.dataset.connected !==
            "true"
        ) {

            closeButton.dataset.connected =
                "true";


            closeButton.addEventListener(
                "click",
                closeOrderDetails
            );

        }

    }


    if (modal) {

        if (
            modal.dataset.connected !==
            "true"
        ) {

            modal.dataset.connected =
                "true";


            modal.addEventListener(
                "click",
                event => {

                    if (
                        event.target ===
                        modal
                    ) {

                        closeOrderDetails();

                    }

                }
            );

        }

    }


    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key ===
                "Escape"
            ) {

                closeOrderDetails();

            }

        }
    );

}


/* =========================================================
   END OF PART 3
========================================================= */
/* =========================================================
   DASHBOARD STATISTICS
========================================================= */


/* =========================================================
   UPDATE DASHBOARD STATS
========================================================= */

function updateDashboardStats(
    orders = null
) {

    const totalProductsElement =
        $("total-products");


    const totalOrdersElement =
        $("total-orders");


    const totalSalesElement =
        $("total-sales");


    /* -----------------------------------------------------
       TOTAL PRODUCTS
    ----------------------------------------------------- */

    if (totalProductsElement) {

        totalProductsElement.textContent =
            products.length;

    }


    /* -----------------------------------------------------
       ORDERS
       
       Agar orders parameter nahi diya gaya,
       Firestore se dobara load nahi karenge.
       Existing orders table ke current data
       ke basis par safe value rakhenge.
    ----------------------------------------------------- */

    if (Array.isArray(orders)) {

        if (totalOrdersElement) {

            totalOrdersElement.textContent =
                orders.length;

        }


        /* -------------------------------------------------
           TOTAL SALES
           
           Cancelled orders ko sales mein count
           nahi kiya jayega.
        ------------------------------------------------- */

        let totalSales =
            0;


        orders.forEach(
            order => {

                const status =
                    getOrderStatus(
                        order
                    );


                if (
                    status ===
                    "Cancelled"
                ) {

                    return;

                }


                totalSales +=
                    getOrderTotal(
                        order
                    );

            }
        );


        if (totalSalesElement) {

            totalSalesElement.textContent =
                money(
                    totalSales
                );

        }

    }

}


/* =========================================================
   REFRESH DASHBOARD STATS
========================================================= */

async function refreshDashboardStats() {

    try {

        const ordersSnapshot =
            await getDocs(
                collection(
                    db,
                    "orders"
                )
            );


        const orders =
            [];


        ordersSnapshot.forEach(
            orderDoc => {

                orders.push({

                    id:
                        orderDoc.id,

                    ...orderDoc.data()

                });

            }
        );


        updateDashboardStats(
            orders
        );


    } catch (error) {

        console.error(
            "Dashboard Stats Error:",
            error
        );

    }

}


/* =========================================================
   PRODUCT EVENTS INITIALIZATION
========================================================= */

function initializeProductEvents() {

    setupProductForm();

    setupProductEvents();

    setupProductSearch();

    setupImagePreview();

}


/* =========================================================
   ORDER EVENTS INITIALIZATION
========================================================= */

function initializeOrderEvents() {

    setupOrderEvents();

    setupOrderStatusEvents();

    setupRefreshOrders();

    setupOrderModal();

}


/* =========================================================
   DASHBOARD EVENT INITIALIZATION
========================================================= */

function initializeDashboardEvents() {

    initializeProductEvents();

    initializeOrderEvents();

}


/* =========================================================
   IMAGE URL PREVIEW
========================================================= */

function refreshImagePreview() {

    const imageInput =
        $("product-image");


    const preview =
        $("product-image-preview");


    const previewWrap =
        $("product-image-preview-wrap");


    if (
        !imageInput ||
        !preview ||
        !previewWrap
    ) {

        return;

    }


    const url =
        imageInput.value.trim();


    if (!url) {

        preview.src =
            "";

        previewWrap.hidden =
            true;

        return;

    }


    preview.src =
        url;


    preview.onload =
        () => {

            previewWrap.hidden =
                false;

        };


    preview.onerror =
        () => {

            previewWrap.hidden =
                true;

        };

}


/* =========================================================
   PRODUCT IMAGE INPUT EVENTS
========================================================= */

function setupProductImageInput() {

    const input =
        $("product-image");


    if (!input) {

        return;

    }


    if (
        input.dataset.previewConnected ===
        "true"
    ) {

        return;

    }


    input.dataset.previewConnected =
        "true";


    input.addEventListener(
        "input",
        refreshImagePreview
    );

}


/* =========================================================
   PRODUCT FORM RESET ON NEW PRODUCT
========================================================= */

function setupNewProductShortcut() {

    const productSection =
        $("productSection");


    if (!productSection) {

        return;

    }


    /*
       No extra "New Product" button is created.
       The existing form itself is used for adding
       a new product after Cancel Edit.
    */

}


/* =========================================================
   SAFE ADMIN PANEL CHECK
========================================================= */

function isAdminPanelVisible() {

    const panel =
        $("adminPanel");


    if (!panel) {

        return false;

    }


    return !panel.hidden;

}


/* =========================================================
   ADMIN DASHBOARD LOAD
========================================================= */

async function loadDashboardData() {

    if (
        !isAdminPanelVisible()
    ) {

        return;

    }


    try {

        await loadProducts();

        await loadCustomerOrders();

        updateDashboardStats();


    } catch (error) {

        console.error(
            "Load Dashboard Data Error:",
            error
        );

    }

}


/* =========================================================
   MANUAL DASHBOARD REFRESH
========================================================= */

async function refreshDashboard() {

    const button =
        $("refreshOrdersButton");


    try {

        if (button) {

            button.disabled =
                true;

        }


        await Promise.all([

            loadProducts(),

            loadCustomerOrders()

        ]);


        await refreshDashboardStats();


        showToast(
            "Dashboard refreshed successfully."
        );


    } catch (error) {

        console.error(
            "Dashboard Refresh Error:",
            error
        );


        showToast(
            "Unable to refresh dashboard.",
            "error"
        );

    } finally {

        if (button) {

            button.disabled =
                false;

        }

    }

}


/* =========================================================
   CONNECT REFRESH BUTTON
========================================================= */

function setupDashboardRefresh() {

    const button =
        $("refreshOrdersButton");


    if (!button) {

        return;

    }


    /*
       setupRefreshOrders() already handles
       the refresh button.

       This function intentionally does
       nothing extra to avoid duplicate
       click handlers.
    */

}


/* =========================================================
   FIREBASE CONNECTION CHECK
========================================================= */

function checkFirebaseInstances() {

    if (!db) {

        console.error(
            "Firestore DB instance is missing."
        );


        return false;

    }


    if (!auth) {

        console.error(
            "Firebase Auth instance is missing."
        );


        return false;

    }


    if (!storage) {

        console.warn(
            "Firebase Storage instance is missing."
        );

    }


    console.log(
        "Firestore Ready"
    );


    console.log(
        "Authentication Ready"
    );


    console.log(
        "Storage Ready"
    );


    return true;

}


/* =========================================================
   FIREBASE DEBUG INFO
========================================================= */

function logFirebaseStatus() {

    console.log(
        "========================================"
    );


    console.log(
        "Garima's House Hold Admin"
    );


    console.log(
        "Firebase SDK: 12.16.0"
    );


    console.log(
        "Firestore:",
        db
            ? "Ready"
            : "Missing"
    );


    console.log(
        "Authentication:",
        auth
            ? "Ready"
            : "Missing"
    );


    console.log(
        "Storage:",
        storage
            ? "Ready"
            : "Missing"
    );


    console.log(
        "Admin Email:",
        ADMIN_EMAIL
    );


    console.log(
        "========================================"
    );

}



/* =========================================================
   AUTH STATE HANDLER
========================================================= */

function startAuthListener() {

    onAuthStateChanged(
        auth,
        async (user) => {

            console.log(
                "Auth State Changed:",
                user
                    ? user.email
                    : "No User"
            );


            /* -------------------------------------------------
               USER NOT LOGGED IN
            ------------------------------------------------- */

            if (!user) {

                showLoginScreen();

                return;

            }


            /* -------------------------------------------------
               CHECK ADMIN EMAIL
            ------------------------------------------------- */

            if (
                !user.email ||
                user.email.toLowerCase() !==
                ADMIN_EMAIL.toLowerCase()
            ) {

                console.warn(
                    "Unauthorized user:",
                    user.email
                );


                try {

                    await signOut(
                        auth
                    );

                } catch (error) {

                    console.error(
                        "Unauthorized Sign Out Error:",
                        error
                    );

                }


                showLoginScreen();

                showLoginError(
                    "This account is not authorized for Admin Panel."
                );


                return;

            }


            /* -------------------------------------------------
               ADMIN USER
            ------------------------------------------------- */

            showAdminPanel();


            try {

                await initializeDashboard();

            } catch (error) {

                console.error(
                    "Admin Dashboard Load Error:",
                    error
                );

            }

        }
    );

}


/* =========================================================
   FORGOT PASSWORD FUNCTION
========================================================= */

async function sendAdminPasswordReset() {

    const emailInput =
        $("adminEmail");


    const email =
        emailInput
            ? emailInput.value.trim()
            : "";


    if (!email) {

        showLoginError(
            "Please enter your email first."
        );

        return;

    }


    try {

        await sendPasswordResetEmail(
            auth,
            email
        );


        clearLoginError();


        alert(
            "Password reset email sent successfully."
        );


    } catch (error) {

        console.error(
            "Password Reset Error:",
            error
        );


        showLoginError(
            error.message ||
            "Unable to send password reset email."
        );

    }

}


/* =========================================================
   OPTIONAL FORGOT PASSWORD BUTTON
========================================================= */

function setupForgotPasswordButton() {

    const button =
        $("forgotPassword");


    if (!button) {

        return;

    }


    if (
        button.dataset.connected ===
        "true"
    ) {

        return;

    }


    button.dataset.connected =
        "true";


    button.addEventListener(
        "click",
        sendAdminPasswordReset
    );

}


/* =========================================================
   FINAL APP START
========================================================= */

function startAdminApplication() {

    console.log(
        "========================================"
    );


    console.log(
        "Garima's House Hold Admin Application"
    );


    console.log(
        "Starting..."
    );


    /* -------------------------------------------------
       FIREBASE CHECK
    ------------------------------------------------- */

    if (
        !checkFirebaseInstances()
    ) {

        showLoginScreen();


        showLoginError(
            "Firebase connection failed."
        );


        return;

    }


    /* -------------------------------------------------
       BASIC UI EVENTS
    ------------------------------------------------- */

    setupPasswordToggle();

    setupLogin();

    setupLogout();

    setupForgotPasswordButton();


    /* -------------------------------------------------
       PRODUCT EVENTS
    ------------------------------------------------- */

    initializeProductEvents();

    setupProductImageInput();


    /* -------------------------------------------------
       ORDER EVENTS
    ------------------------------------------------- */

    initializeOrderEvents();


    /* -------------------------------------------------
       AUTH LISTENER
    ------------------------------------------------- */

    startAuthListener();


    /* -------------------------------------------------
       INITIAL SCREEN
       
       Firebase auth listener automatically
       changes this when logged in.
    ------------------------------------------------- */

    showLoginScreen();


    console.log(
        "Admin Application Ready"
    );


    console.log(
        "========================================"
    );

}


/* =========================================================
   START APPLICATION
========================================================= */

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        startAdminApplication,
        {
            once: true
        }
    );

} else {

    startAdminApplication();

}


/* =========================================================
   END OF ADMIN.JS
========================================================= */
