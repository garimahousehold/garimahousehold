const params = new URLSearchParams(window.location.search);

const orderId = params.get("id");

document.getElementById("orderId").textContent =
orderId || "N/A";