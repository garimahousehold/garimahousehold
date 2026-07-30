// ==========================================
// Garima's House Hold
// coupon.js (Part 1)
// ==========================================

import { db } from "./firebase.js";

import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

// -------------------------------
// Global Variables
// -------------------------------

let coupons = [];
let appliedCoupon = null;

// -------------------------------
// Load Coupons From Firestore
// -------------------------------

export async function loadCoupons() {

    coupons = [];

    try {

        const snapshot = await getDocs(
            collection(db, "coupons")
        );

        snapshot.forEach(doc => {

            coupons.push({
                id: doc.id,
                ...doc.data()
            });

        });

        console.log("Coupons Loaded", coupons);

    }

    catch (error) {

        console.error(error);

    }

}

// -------------------------------
// Find Coupon
// -------------------------------

function getCoupon(code) {

    return coupons.find(coupon =>

        coupon.code.toUpperCase() ===
        code.toUpperCase()

    );

}

// -------------------------------
// Validate Coupon
// -------------------------------

export function validateCoupon(code, subtotal) {

    const coupon = getCoupon(code);

    if (!coupon) {

        return {

            success: false,

            message: "Invalid Coupon Code"

        };

    }

    if (!coupon.active) {

        return {

            success: false,

            message: "Coupon Disabled"

        };

    }

    if (coupon.minimumOrder > subtotal) {

        return {

            success: false,

            message:
                `Minimum Order ₹${coupon.minimumOrder}`

        };

    }

    const today = new Date();

    const expiry = new Date(coupon.expiry);

    if (today > expiry) {

        return {

            success: false,

            message: "Coupon Expired"

        };

    }

    return {

        success: true,

        coupon

    };

}
// -------------------------------
// Calculate Discount
// -------------------------------

export function calculateDiscount(coupon, subtotal) {

    let discount = 0;

    if (coupon.type === "percentage") {

        discount =
            (subtotal * Number(coupon.value)) / 100;

        if (coupon.maxDiscount) {

            discount = Math.min(
                discount,
                Number(coupon.maxDiscount)
            );

        }

    }

    else if (coupon.type === "flat") {

        discount = Number(coupon.value);

    }

    discount = Math.min(discount, subtotal);

    return Math.round(discount);

}

// -------------------------------
// Apply Coupon
// -------------------------------

export function applyCoupon(code, subtotal) {

    const result =
        validateCoupon(code, subtotal);

    if (!result.success) {

        return result;

    }

    appliedCoupon = result.coupon;

    const discount =
        calculateDiscount(
            appliedCoupon,
            subtotal
        );

    return {

        success: true,

        coupon: appliedCoupon,

        discount,

        finalTotal:
            subtotal - discount

    };

}

// -------------------------------
// Remove Coupon
// -------------------------------

export function removeCoupon() {

    appliedCoupon = null;

}

// -------------------------------
// Get Applied Coupon
// -------------------------------

export function getAppliedCoupon() {

    return appliedCoupon;

}

// -------------------------------
// Save Coupon
// -------------------------------

export function saveAppliedCoupon() {

    if (appliedCoupon) {

        localStorage.setItem(
            "appliedCoupon",
            JSON.stringify(appliedCoupon)
        );

    } else {

        localStorage.removeItem(
            "appliedCoupon"
        );

    }

}

// -------------------------------
// Load Coupon
// -------------------------------

export function loadAppliedCoupon() {

    appliedCoupon =
        JSON.parse(
            localStorage.getItem("appliedCoupon")
        );

    return appliedCoupon;

}
