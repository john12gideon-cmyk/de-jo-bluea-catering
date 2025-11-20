// admin.js

// Import required utility from the new firebase.js
import { loadFirebaseIfConfigured } from "./firebase.js";

/* ====== Admin config ====== */
const ADMIN_PASSCODE = "524684";

function readLocalOrders() {
  const key = "dejo_orders";
  return JSON.parse(localStorage.getItem(key) || "[]");
}
function writeLocalOrders(arr) {
  localStorage.setItem("dejo_orders", JSON.stringify(arr));
}

document.addEventListener("DOMContentLoaded", async () => {
  const ordersEl = document.getElementById("orders");
  const refreshBtn = document.getElementById("refreshBtn");
  const filterPaid = document.getElementById("filterPaid");
  const searchInput = document.getElementById("searchInput");
  const adminPass = document.getElementById("adminPass");
  const loginBtn = document.getElementById("loginBtn");
  const exportBtn = document.getElementById("exportBtn");

  let unlocked = false;
  // Use the centralized loader
  let fb = await loadFirebaseIfConfigured();

  loginBtn.addEventListener("click", () => {
    if (adminPass.value === ADMIN_PASSCODE) {
      unlocked = true;
      document.getElementById("adminPanel").style.display = "block";
      alert("✅ Admin unlocked.");
      fetchOrders();
    } else {
      alert("❌ Wrong passcode.");
    }
  });

  async function fetchOrders() {
    if (!unlocked) {
      ordersEl.innerHTML = "<p>Please unlock with passcode.</p>";
      return;
    }
    ordersEl.innerHTML = "<p>Loading...</p>";

    let data = [];
    if (fb?.db) {
      // Use Firestore
      const snapshot = await fb.db.collection("orders").orderBy("createdAt", "desc").get();
      data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), createdAt: doc.data().createdAt?.toDate()?.toISOString() || new Date().toISOString() }));
    } else {
      // Use Local Storage
      data = readLocalOrders();
    }

    const filter = filterPaid.value;
    const query = searchInput.value.toLowerCase();

    const filtered = data.filter(o => {
      const matchStatus =
        filter === "all" ||
        (filter === "paid" && o.payment?.status === "paid") || // Use o.payment.status
        (filter === "pending" && o.payment?.status === "pending"); // Use o.payment.status

      const matchSearch =
        o.customer?.name?.toLowerCase().includes(query) ||
        o.customer?.phone?.toLowerCase().includes(query);

      return matchStatus && matchSearch;
    });

    ordersEl.innerHTML = "";
    filtered.forEach(o => {
      const paid = o.payment?.status === "paid"; // Use o.payment.status
      const subtotal = Number(o.subtotal || 0).toLocaleString("en-NG");
      const orderDate = new Date(o.createdAt).toLocaleString();

      const div = document.createElement("div");
      div.className = "order-card";
      div.innerHTML = `
        <h3>${o.customer?.name || "Unnamed"}</h3>
        <p>Order ID: ${o.id}</p>
        <p>Date: ${orderDate}</p>
        <p>Phone: ${o.customer?.phone || ""}</p>
        <p>Email: ${o.customer?.email || ""}</p>
        <p>Notes: ${o.customer?.notes || "—"}</p>
        <p><strong>Total:</strong> ₦ ${subtotal}</p>
        <p class="status ${paid ? "paid" : "pending"}">Status: ${paid ? "Paid" : "Pending"}</p>
        <div class="order-actions">
          <button class="btn" data-action="mark-paid" data-id="${o.id}">Mark paid</button>
          <button class="btn danger" data-action="mark-pending" data-id="${o.id}">Mark pending</button>
          <button class="btn" data-action="complete" data-id="${o.id}">Complete</button>
          <button class="btn danger" data-action="cancel" data-id="${o.id}">Cancel</button>
          <button class="btn danger" data-action="delete" data-id="${o.id}">Delete</button>
          <button class="btn" data-action="set-total" data-id="${o.id}">Set total</button>
        </div>
        ${o.payment?.proofUrl ? `<p><a href="${o.payment.proofUrl}" target="_blank">View Payment Proof</a></p>` : ''}
      `;
      ordersEl.appendChild(div);
    });
  }

  refreshBtn.addEventListener("click", fetchOrders);
  filterPaid.addEventListener("change", fetchOrders);
  searchInput.addEventListener("input", fetchOrders);

  exportBtn.addEventListener("click", () => {
    if (!unlocked) return alert("Unlock admin first.");
    // Export data will only work for LocalStorage mode unless further Firestore logic is added
    const data = fb?.db ? "Export from Firestore not implemented (showing local data as fallback)" : readLocalOrders();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "orders.json";
    a.click();
    URL.revokeObjectURL(url);
  });

  ordersEl.addEventListener("click", async (e) => {
    const btn = e.target.closest("button");
    if (!btn || !unlocked) return;
    const id = btn.getAttribute("data-id");
    const action = btn.getAttribute("data-action");

    if (fb?.db) {
      // Logic for Firebase updates
      const ref = fb.db.collection("orders").doc(id);
      if (action === "mark-paid") await ref.update({ "payment.status": "paid" });
      if (action === "mark-pending") await ref.update({ "payment.status": "pending" });
      if (action === "complete") await ref.update({ status: "completed" });
      if (action === "cancel") await ref.update({ status: "cancelled" });
      if (action === "delete") {
        if (confirm("Delete this order?")) await ref.delete();
      }
      if (action === "set-total") {
        const newTotalStr = prompt("Enter negotiated total (naira):", "");
        const newTotal = Number(newTotalStr);
        if (!isNaN(newTotal) && newTotal >= 0) await ref.update({ subtotal: newTotal });
      }
    } else {
      // Logic for Local Storage updates
      const orders = readLocalOrders();
      const idx = orders.findIndex(o => o.id === id);
      if (idx === -1) return;
      if (action === "mark-paid") orders[idx].payment.status = "paid";
      if (action === "mark-pending") orders[idx].payment.status = "pending";
      if (action === "complete") orders[idx].status = "completed";
      if (action === "cancel") orders[idx].status = "cancelled";
      if (action === "delete") {
        if (confirm("Delete this order?")) orders.splice(idx, 1);
      }
      if (action === "set-total") {
        const newTotalStr = prompt("Enter negotiated total (naira):", "");
        const newTotal = Number(newTotalStr);
        if (!isNaN(newTotal) && newTotal >= 0) orders[idx].subtotal = newTotal;
      }
      writeLocalOrders(orders);
    }

    await fetchOrders();
  });

  fetchOrders();
});
