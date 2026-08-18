// =========================================================
// GARIMA'S HOUSE HOLD
// ADMIN COUPONS
// FRESH COMPLETE VERSION
// PART 1
// FIREBASE + DOM SETUP
// =========================================================


import {
    collection,
    addDoc,
    getDocs,
    getDoc,
    deleteDoc,
    doc,
    updateDoc
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";


import {
    db
} from "./firebase.js";



// =========================================================
// FIREBASE COLLECTION
// =========================================================

const couponCollection =
    collection(
        db,
        "coupons"
    );



// =========================================================
// DOM ELEMENTS
// =========================================================

const codeInput =
    document.getElementById(
        "coupon-code"
    );


const typeInput =
    document.getElementById(
        "coupon-type"
    );


const valueInput =
    document.getElementById(
        "coupon-value"
    );


const minimumOrderInput =
    document.getElementById(
        "minimum-order"
    );


const maxDiscountInput =
    document.getElementById(
        "max-discount"
    );


const expiryInput =
    document.getElementById(
        "expiry-date"
    );


const activeInput =
    document.getElementById(
        "coupon-active"
    );


const saveButton =
    document.getElementById(
        "save-coupon"
    );


const resetButton =
    document.getElementById(
        "reset-coupon"
    );


const couponTable =
    document.getElementById(
        "coupon-table"
    );



// =========================================================
// EDIT MODE
// =========================================================

let editId =
    null;



// =========================================================
// BASIC HTML CHECK
// =========================================================

if (
    !codeInput ||
    !typeInput ||
    !valueInput ||
    !minimumOrderInput ||
    !maxDiscountInput ||
    !expiryInput ||
    !activeInput ||
    !saveButton ||
    !couponTable
) {

    console.error(
        "Coupon Manager: Required HTML element is missing."
    );

}



// =========================================================
// SAFE HTML ESCAPE
// =========================================================

function escapeCouponHtml(
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



// =========================================================
// DATE HELPER
// =========================================================

function isExpired(
    expiry
) {

    if (
        !expiry
    ) {

        return false;

    }


    const expiryDate =
        new Date(
            expiry + "T23:59:59"
        );


    if (
        Number.isNaN(
            expiryDate.getTime()
        )
    ) {

        return false;

    }


    return (
        expiryDate <
        new Date()
    );

}



// =========================================================
// DASHBOARD VALUE HELPER
// =========================================================

function setDashboardValue(
    id,
    value
) {

    const element =
        document.getElementById(
            id
        );


    if (
        element
    ) {

        element.textContent =
            value;

    }

}



// =========================================================
// DASHBOARD COUNTS
// =========================================================

function updateCouponDashboard(
    coupons
) {

    let total =
        0;

    let active =
        0;

    let expired =
        0;

    let disabled =
        0;


    coupons.forEach(
        coupon => {

            total++;


            if (
                coupon.active !== true
            ) {

                disabled++;

                return;

            }


            if (
                isExpired(
                    coupon.expiry
                )
            ) {

                expired++;

            } else {

                active++;

            }

        }
    );


    setDashboardValue(
        "total-coupons",
        total
    );


    setDashboardValue(
        "active-coupons",
        active
    );


    setDashboardValue(
        "expired-coupons",
        expired
    );


    setDashboardValue(
        "disabled-coupons",
        disabled
    );

}



// =========================================================
// PART 1 LOADED
// =========================================================

console.log(
    "Admin Coupons Fresh Complete Version - Part 1 Loaded."
);
// =========================================================
// LOAD ALL COUPONS
// PART 2
// =========================================================

async function loadCoupons() {

    if (!couponTable) {

        console.error(
            "Coupon table not found."
        );

        return;

    }


    couponTable.innerHTML = `

        <tr>

            <td
                colspan="7"
                style="
                    text-align:center;
                    padding:30px;
                "
            >

                <i
                    class="fa-solid fa-spinner fa-spin"
                ></i>

                Loading coupons...

            </td>

        </tr>

    `;


    try {

        const snapshot =
            await getDocs(
                couponCollection
            );


        const coupons = [];


        snapshot.forEach(
            couponDoc => {

                coupons.push({

                    id:
                        couponDoc.id,

                    ...couponDoc.data()

                });

            }
        );


        // Newest first
        coupons.sort(
            (a, b) => {

                const aTime =
                    a.createdAt?.seconds ||
                    0;

                const bTime =
                    b.createdAt?.seconds ||
                    0;

                return bTime - aTime;

            }
        );


        updateCouponDashboard(
            coupons
        );


        renderCoupons(
            coupons
        );


    } catch (error) {

        console.error(
            "Load Coupons Error:",
            error
        );


        couponTable.innerHTML = `

            <tr>

                <td
                    colspan="7"
                    style="
                        text-align:center;
                        padding:30px;
                        color:#b42318;
                    "
                >

                    Unable to load coupons.

                </td>

            </tr>

        `;

    }

}



// =========================================================
// RENDER COUPON LIST
// =========================================================

function renderCoupons(
    coupons
) {

    if (
        coupons.length === 0
    ) {

        couponTable.innerHTML = `

            <tr>

                <td
                    colspan="7"
                    style="
                        text-align:center;
                        padding:40px;
                    "
                >

                    No coupons found.

                </td>

            </tr>

        `;

        return;

    }


    couponTable.innerHTML =
        coupons.map(
            coupon => {

                const code =
                    escapeCouponHtml(
                        coupon.code
                    );


                const type =
                    coupon.type ===
                    "fixed"

                        ? "Fixed"

                        : "Percentage";


                const discount =
                    coupon.type ===
                    "fixed"

                        ? `₹${Number(
                            coupon.value || 0
                        )}`

                        : `${Number(
                            coupon.value || 0
                        )}%`;


                const minimumOrder =
                    Number(
                        coupon.minimumOrder || 0
                    );


                const maxDiscount =
                    Number(
                        coupon.maxDiscount || 0
                    );


                const expired =
                    isExpired(
                        coupon.expiry
                    );


                let statusText =
                    "Inactive";

                let statusClass =
                    "inactive";


                if (
                    coupon.active === true &&
                    expired
                ) {

                    statusText =
                        "Expired";

                    statusClass =
                        "expired";

                }

                else if (
                    coupon.active === true
                ) {

                    statusText =
                        "Active";

                    statusClass =
                        "active";

                }


                return `

                    <tr>

                        <td>

                            <strong>
                                ${code}
                            </strong>

                        </td>


                        <td>

                            ${type}

                        </td>


                        <td>

                            ${discount}

                        </td>


                        <td>

                            ₹${minimumOrder}

                        </td>


                        <td>

                            ${
                                maxDiscount > 0
                                    ? `₹${maxDiscount}`
                                    : "—"
                            }

                        </td>


                        <td>

                            <span
                                class="
                                    coupon-status
                                    ${statusClass}
                                "
                            >

                                ${statusText}

                            </span>

                        </td>


                        <td>

                            <div
                                style="
                                    display:flex;
                                    gap:8px;
                                    flex-wrap:wrap;
                                "
                            >

                                <button
                                    type="button"
                                    class="edit-coupon-btn"
                                    onclick="editCoupon('${coupon.id}')"
                                >

                                    <i
                                        class="fa-solid fa-pen"
                                    ></i>

                                    Edit

                                </button>


                                <button
                                    type="button"
                                    class="delete-coupon-btn"
                                    onclick="deleteCoupon('${coupon.id}')"
                                >

                                    <i
                                        class="fa-solid fa-trash"
                                    ></i>

                                    Delete

                                </button>

                            </div>

                        </td>

                    </tr>

                `;

            }
        ).join("");

}



// =========================================================
// EDIT COUPON
// =========================================================

window.editCoupon =
    async function(
        id
    ) {

        if (
            !id
        ) {

            return;

        }


        try {

            const couponRef =
                doc(
                    db,
                    "coupons",
                    id
                );


            const snapshot =
                await getDoc(
                    couponRef
                );


            if (
                !snapshot.exists()
            ) {

                alert(
                    "Coupon not found."
                );

                return;

            }


            const coupon =
                snapshot.data();


            // -----------------------------------------
            // FILL FORM
            // -----------------------------------------

            codeInput.value =
                coupon.code || "";


            typeInput.value =
                coupon.type ||
                "percentage";


            valueInput.value =
                coupon.value ?? "";


            minimumOrderInput.value =
                coupon.minimumOrder ?? "";


            maxDiscountInput.value =
                coupon.maxDiscount ?? "";


            expiryInput.value =
                coupon.expiry || "";


            activeInput.checked =
                coupon.active !== false;


            // -----------------------------------------
            // EDIT MODE
            // -----------------------------------------

            editId =
                id;


            saveButton.textContent =
                "Update Coupon";


            // -----------------------------------------
            // SCROLL TO FORM
            // -----------------------------------------

            const form =
                document.querySelector(
                    ".card"
                );


            if (
                form
            ) {

                form.scrollIntoView({

                    behavior:
                        "smooth",

                    block:
                        "start"

                });

            }


        } catch (error) {

            console.error(
                "Edit Coupon Error:",
                error
            );


            alert(
                "Unable to load coupon."
            );

        }

    };



// =========================================================
// DELETE COUPON
// =========================================================

window.deleteCoupon =
    async function(
        id
    ) {

        if (
            !id
        ) {

            return;

        }


        const confirmed =
            confirm(
                "Are you sure you want to delete this coupon?"
            );


        if (
            !confirmed
        ) {

            return;

        }


        try {

            await deleteDoc(

                doc(
                    db,
                    "coupons",
                    id
                )

            );


            alert(
                "Coupon deleted successfully."
            );


            // Reload list
            await loadCoupons();


        } catch (error) {

            console.error(
                "Delete Coupon Error:",
                error
            );


            alert(
                "Unable to delete coupon."
            );

        }

    };



// =========================================================
// INITIAL LOAD
// =========================================================

loadCoupons();
// =========================================================
// ADMIN COUPONS
// PART 3
// ADD + UPDATE COUPON
// =========================================================


// =========================================================
// SAVE / UPDATE COUPON
// =========================================================

saveButton.addEventListener(
    "click",
    async function () {

        // -------------------------------------------------
        // GET VALUES
        // -------------------------------------------------

        const couponCode =
            codeInput.value
                .trim()
                .toUpperCase();


        const couponType =
            typeInput.value;


        const couponValue =
            Number(
                valueInput.value
            );


        const minimumOrder =
            Number(
                minimumOrderInput.value ||
                0
            );


        const maxDiscount =
            Number(
                maxDiscountInput.value ||
                0
            );


        const expiry =
            expiryInput.value;


        const active =
            activeInput.checked;


        // -------------------------------------------------
        // BASIC VALIDATION
        // -------------------------------------------------

        if (
            !couponCode
        ) {

            alert(
                "Please enter coupon code."
            );

            codeInput.focus();

            return;

        }


        if (
            !couponType
        ) {

            alert(
                "Please select discount type."
            );

            return;

        }


        if (
            !Number.isFinite(
                couponValue
            ) ||
            couponValue <= 0
        ) {

            alert(
                "Please enter a valid discount value."
            );

            valueInput.focus();

            return;

        }


        // -------------------------------------------------
        // PERCENTAGE LIMIT
        // -------------------------------------------------

        if (
            couponType === "percentage" &&
            couponValue > 100
        ) {

            alert(
                "Percentage discount cannot be more than 100%."
            );

            valueInput.focus();

            return;

        }


        // -------------------------------------------------
        // MINIMUM ORDER
        // -------------------------------------------------

        if (
            minimumOrder < 0
        ) {

            alert(
                "Minimum order cannot be negative."
            );

            minimumOrderInput.focus();

            return;

        }


        // -------------------------------------------------
        // MAX DISCOUNT
        // -------------------------------------------------

        if (
            maxDiscount < 0
        ) {

            alert(
                "Maximum discount cannot be negative."
            );

            maxDiscountInput.focus();

            return;

        }


        // -------------------------------------------------
        // EXPIRY DATE
        // -------------------------------------------------

        if (
            expiry
        ) {

            const expiryDate =
                new Date(
                    expiry +
                    "T23:59:59"
                );


            if (
                Number.isNaN(
                    expiryDate.getTime()
                )
            ) {

                alert(
                    "Please enter a valid expiry date."
                );

                expiryInput.focus();

                return;

            }

        }


        // -------------------------------------------------
        // DISABLE BUTTON
        // -------------------------------------------------

        saveButton.disabled =
            true;


        saveButton.textContent =
            editId
                ? "Updating..."
                : "Saving...";


        try {

            // =============================================
            // CHECK DUPLICATE CODE
            // =============================================

            const snapshot =
                await getDocs(
                    couponCollection
                );


            let duplicate =
                false;


            snapshot.forEach(
                couponDoc => {

                    // Ignore the coupon currently being edited
                    if (
                        editId &&
                        couponDoc.id === editId
                    ) {

                        return;

                    }


                    const existingCoupon =
                        couponDoc.data();


                    const existingCode =
                        String(
                            existingCoupon.code ||
                            ""
                        )
                        .trim()
                        .toUpperCase();


                    if (
                        existingCode ===
                        couponCode
                    ) {

                        duplicate =
                            true;

                    }

                }
            );


            if (
                duplicate
            ) {

                alert(
                    "This coupon code already exists."
                );

                return;

            }


            // =============================================
            // COUPON DATA
            // =============================================

            const couponData = {

                code:
                    couponCode,

                type:
                    couponType,

                value:
                    couponValue,

                minimumOrder:
                    minimumOrder,

                maxDiscount:
                    maxDiscount,

                expiry:
                    expiry,

                active:
                    active

            };


            // =============================================
            // UPDATE EXISTING COUPON
            // =============================================

            if (
                editId
            ) {

                const couponRef =
                    doc(
                        db,
                        "coupons",
                        editId
                    );


                await updateDoc(
                    couponRef,
                    couponData
                );


                alert(
                    "Coupon updated successfully."
                );

            }


            // =============================================
            // ADD NEW COUPON
            // =============================================

            else {

                await addDoc(
                    couponCollection,
                    {

                        ...couponData,

                        createdAt:
                            new Date()

                    }
                );


                alert(
                    "Coupon added successfully."
                );

            }


            // =============================================
            // RESET FORM
            // =============================================

            resetCouponForm();


            // =============================================
            // RELOAD COUPONS
            // =============================================

            await loadCoupons();


        } catch (error) {

            console.error(
                "Save Coupon Error:",
                error
            );


            alert(
                "Unable to save coupon. Please try again."
            );


        } finally {

            saveButton.disabled =
                false;


            saveButton.textContent =
                editId
                    ? "Update Coupon"
                    : "Save Coupon";

        }

    }
);
