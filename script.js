// main.js

// Import required utility from the new firebase.js
import { loadFirebaseIfConfigured } from "./firebase.js";

/* ====== Config (with your details + cooler prices) ====== */
const CONFIG = {
  BUSINESS_NAME: "DE-JO-BLUEA catering and rentals services",
  // ... (rest of CONFIG remains the same)
  CONTACT: {
    PHONE: "+2348106153005",
    WHATSAPP: "https://wa.me/+2348106153005",
    EMAIL: "ofofongideon708@gmail.com",
    LOCATION: "shelter afrique extension, Uyo Akwa ibom state"
  },
  BANK: {
    NAME: "Globus bank limited",
    ACCOUNT_NAME: "Ofofon Gideon Matthew",
    ACCOUNT_NUMBER: "2003362084"
  },
  PRICES: {
    WARMER_PRICE: 5000, PLATES_BOWLS_PRICE: 100, SPOONS_SET_PRICE: 50, CHAIR_PRICE: 100,
    FIREWOOD_SMALL_PRICE: 200, FIREWOOD_MEDIUM_PRICE: 500, FIREWOOD_LARGE_PRICE: 1000,
    COOLER_LARGE_PRICE: 1500, COOLER_MEDIUM_PRICE: 1000, COOLER_SMALL_PRICE: 500
  },
  DELIVERY_NOTE: "Delivery is on customers' preference and negotiable depending on the location."
};

/* ====== Utility (with basic sanitization) ====== */
const sanitizeText = (t) => String(t || "").replace(/[<>]/g, "");
const formatNaira = (n) => (Number(n || 0)).toLocaleString("en-NG");

// LocalStorage order store (static mode)
const saveLocalOrder = async (order) => {
  const key = "dejo_orders";
  const arr = JSON.parse(localStorage.getItem(key) || "[]");
  const id = "LOCAL-" + Date.now();
  arr.unshift({ id, ...order });
  localStorage.setItem(key, JSON.stringify(arr));
  return { id };
};

/* ====== DOM init ====== */
document.addEventListener("DOMContentLoaded", async () => {
  document.title = CONFIG.BUSINESS_NAME;
  document.getElementById("year").textContent = new Date().getFullYear();

  // Inject prices
  document.querySelectorAll("[data-price]").forEach(el => {
    const key = el.getAttribute("data-price");
    el.textContent = formatNaira(CONFIG.PRICES[key]);
  });

  // Cart state
  let cart = [];

  // Elements
  const cartDrawer = document.getElementById("cartDrawer");
  const openCartBtn = document.getElementById("openCartBtn");
  const closeCartBtn = document.getElementById("closeCartBtn");
  const cartCount = document.getElementById("cartCount");
  const cartItemsEl = document.getElementById("cartItems");
  const cartSubtotalEl = document.getElementById("cartSubtotal");
  const checkoutBtn = document.getElementById("checkoutBtn");

  function toggleCart(open) {
    if (open) cartDrawer.classList.add("open");
    else cartDrawer.classList.remove("open");
  }

  function renderCart() {
    cartItemsEl.innerHTML = "";
    let subtotal = 0;
    // --- RESTORED CART RENDERING LOGIC ---
    cart.forEach((item, idx) => {
      subtotal += item.price * item.qty;
      const div = document.createElement("div");
      div.className = "cart-item";
      const noteLine = item.notes ? `<div class="meta">Note: ${sanitizeText(item.notes)}</div>` : "";
      div.innerHTML = `
        <div>
          <h4>${sanitizeText(item.name)}</h4>
          <div class="meta">₦ ${formatNaira(item.price)} x ${item.qty}</div>
          ${noteLine}
        </div>
        <div class="actions">
          <button class="icon-btn" data-action="dec" data-index="${idx}" aria-label="Decrease">−</button>
          <button class="icon-btn" data-action="inc" data-index="${idx}" aria-label="Increase">+</button>
          <button class="icon-btn" data-action="del" data-index="${idx}" aria-label="Remove">🗑️</button>
        </div>
      `;
      cartItemsEl.appendChild(div);
    });
    cartSubtotalEl.textContent = formatNaira(subtotal);
    cartCount.textContent = cart.reduce((s, i) => s + i.qty, 0);
  }

  function addToCart(item) {
    const existing = cart.find(i => i.id === item.id && i.price === item.price && i.notes === item.notes);
    if (existing) existing.qty += item.qty;
    else cart.push(item);
    renderCart();
    toggleCart(true);
  }

  // Add-to-cart listeners
  document.querySelectorAll(".card .add-to-cart").forEach((btn) => {
    btn.addEventListener("click", () => {
      const card = btn.closest(".card");
      const qty = Math.max(1, Number(card.querySelector(".qty").value || 1));
      const notes = btn.getAttribute("data-notes") || "";
      const mappedKey = btn.getAttribute("data-price");
      const rawPrice = btn.getAttribute("data-price");

      const item = {
        id: btn.getAttribute("data-id"),
        name: sanitizeText(btn.getAttribute("data-name")),
        price: Number(CONFIG.PRICES[mappedKey] ?? rawPrice ?? 0),
        qty,
        notes: sanitizeText(notes)
      };
      addToCart(item);
    });
  });

  // Cart actions
  cartItemsEl.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;
    const idx = Number(btn.getAttribute("data-index"));
    const action = btn.getAttribute("data-action");
    if (action === "inc") cart[idx].qty++;
    if (action === "dec") cart[idx].qty = Math.max(1, cart[idx].qty - 1);
    if (action === "del") cart.splice(idx, 1);
    renderCart();
  });

  openCartBtn.addEventListener("click", () => toggleCart(true));
  closeCartBtn.addEventListener("click", () => toggleCart(false));

  // Checkout modal
  const checkoutModal = document.getElementById("checkoutModal");
  const closeCheckoutBtn = document.getElementById("closeCheckoutBtn");
  const checkoutForm = document.getElementById("checkoutForm");
  const checkoutNotice = document.getElementById("checkoutNotice");

  checkoutBtn.addEventListener("click", () => {
    if (cart.length === 0) {
      alert("Your cart is empty.");
      return;
    }
    checkoutModal.classList.add("open");
  });
  closeCheckoutBtn.addEventListener("click", () => checkoutModal.classList.remove("open"));

  // Optional Firebase init: uses the centralized loader
  const fb = await loadFirebaseIfConfigured();

  // Submit order (POST-like behavior; only creates new orders)
  checkoutForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(checkoutForm);
    const customer = {
      name: sanitizeText(formData.get("name")),
      phone: sanitizeText(formData.get("phone")),
      email: sanitizeText(formData.get("email") || ""),
      notes: sanitizeText(formData.get("notes") || "")
    };
    const paymentStatus = formData.get("paymentStatus");
    const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);

    // Upload payment proof if provided (Firebase only)
    let proofUrl = "";
    const proofFile = document.getElementById("paymentProof").files[0];
    if (proofFile && fb?.storage) {
      const ts = Date.now();
      const path = `payment-proofs/${customer.phone}-${ts}-${proofFile.name.replace(/[^\w.-]/g, "_")}`;
      const ref = fb.storage.ref().child(path);
      await ref.put(proofFile);
      proofUrl = await ref.getDownloadURL();
    }

    // --- RESTORED ORDER OBJECT WITH ITEMS & SUBTOTAL ---
    const order = {
      businessName: CONFIG.BUSINESS_NAME,
      contact: CONFIG.CONTACT,
      deliveryNote: CONFIG.DELIVERY_NOTE,
      customer,
      items: cart, // <-- This is the crucial missing data
      subtotal, // <-- This is the crucial missing data
      payment: {
        method: "bank_transfer",
        bank: CONFIG.BANK,
        status: paymentStatus,
        proofUrl
      },
      createdAt: new Date().toISOString(),
      status: "new"
    };

    try {
      let orderId = "";
      if (fb?.db) {
        const docRef = await fb.db.collection("orders").add(order);
        orderId = docRef.id;
      } else {
        const { id } = await saveLocalOrder(order);
        orderId = id;
      }
      checkoutNotice.textContent = `Order submitted! Your order ID is ${orderId}. We will confirm payment shortly.`;
      cart = [];
      renderCart();
      checkoutForm.reset();
    } catch (err) {
      checkoutNotice.textContent = "Error submitting order. Please try again.";
      console.error(err);
    }
  });
});
