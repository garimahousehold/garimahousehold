// ==========================================
// Garima's House Hold
// Admin Coupon JS
// ==========================================

import { db } from "./firebase.js";

import {
    collection,
    addDoc,
    getDocs,
    deleteDoc,
    doc,
    updateDoc
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

const couponCollection = collection(db, "coupons");

const code = document.getElementById("coupon-code");
const type = document.getElementById("coupon-type");
const value = document.getElementById("coupon-value");
const minimumOrder = document.getElementById("minimum-order");
const maxDiscount = document.getElementById("max-discount");
const expiry = document.getElementById("expiry-date");

const saveBtn = document.getElementById("save-coupon");

const table = document.getElementById("coupon-table");

let editId = null;
async function loadCoupons() {

    table.innerHTML = "";

    const snapshot = await getDocs(couponCollection);

    snapshot.forEach(docSnap => {

        const coupon = docSnap.data();

        table.innerHTML += `

        <tr>

            <td>${coupon.code}</td>

            <td>${coupon.type}</td>

            <td>${coupon.value}</td>

            <td>₹${coupon.minimumOrder}</td>

            <td>

                ${
                    coupon.active
                    ? '<span class="active">Active</span>'
                    : '<span class="inactive">Inactive</span>'
                }

            </td>

            <td>

                <button
                    class="edit-btn"
                    onclick="editCoupon('${docSnap.id}')">

                    Edit

                </button>

                <button
                    class="delete-btn"
                    onclick="deleteCoupon('${docSnap.id}')">

                    Delete

                </button>

            </td>

        </tr>

        `;

    });

}
loadCoupons();
// ==========================================
// Save / Update Coupon
// ==========================================

saveBtn.addEventListener("click", async () => {

    if (
        code.value.trim() === "" ||
        value.value === "" ||
        minimumOrder.value === "" ||
        expiry.value === ""
    ) {

        alert("Please fill all fields.");

        return;

    }

    const couponData = {

        code: code.value.trim().toUpperCase(),

        type: type.value,

        value: Number(value.value),

        minimumOrder: Number(minimumOrder.value),

        maxDiscount: Number(maxDiscount.value || 0),

        expiry: expiry.value,

        active: true

    };

    try {

        if (editId) {

            await updateDoc(

                doc(db, "coupons", editId),

                couponData

            );

            alert("Coupon Updated Successfully.");

        }

        else {

            await addDoc(

                couponCollection,

                couponData

            );

            alert("Coupon Added Successfully.");

        }

        clearForm();

        loadCoupons();

    }

    catch (error) {

        console.error(error);

        alert("Something went wrong.");

    }

});


// ==========================================
// Clear Form
// ==========================================

function clearForm() {

    code.value = "";

    type.value = "percentage";

    value.value = "";

    minimumOrder.value = "";

    maxDiscount.value = "";

    expiry.value = "";

    editId = null;

}


// ==========================================
// Delete Coupon
// ==========================================

window.deleteCoupon = async function(id){

    if(!confirm("Delete this coupon?"))

        return;

    await deleteDoc(

        doc(db,"coupons",id)

    );

    loadCoupons();

};


// ==========================================
// Edit Coupon
// ==========================================

window.editCoupon = async function(id){

    editId=id;

    const snapshot=await getDocs(couponCollection);

    snapshot.forEach(docSnap=>{

        if(docSnap.id===id){

            const c=docSnap.data();

            code.value=c.code;

            type.value=c.type;

            value.value=c.value;

            minimumOrder.value=c.minimumOrder;

            maxDiscount.value=c.maxDiscount || "";

            expiry.value=c.expiry;

        }

    });

};


// ===== Enhancements =====
const couponActive=document.getElementById("coupon-active");

const _oldClear=clearForm;
clearForm=function(){
    _oldClear();
    if(couponActive) couponActive.checked=true;
}

const _oldLoad=loadCoupons;
loadCoupons=async function(){
    await _oldLoad();
    let total=0,active=0,expired=0,disabled=0;
    const snapshot=await getDocs(couponCollection);
    const today=new Date();
    snapshot.forEach(d=>{
        total++;
        const c=d.data();
        if(!c.active) disabled++;
        else if(new Date(c.expiry)<today) expired++;
        else active++;
    });
    const set=(id,val)=>{const e=document.getElementById(id); if(e) e.textContent=val;}
    set("total-coupons",total);
    set("active-coupons",active);
    set("expired-coupons",expired);
    set("disabled-coupons",disabled);
}
loadCoupons();

saveBtn.addEventListener("click",()=>{}, {once:true});
