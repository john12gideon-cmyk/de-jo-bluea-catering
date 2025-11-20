/* ====== Admin config ====== */
const ADMIN_PASSCODE = "524684";

/* ====== Firebase config ====== */
const firebaseConfig = {
  apiKey: "AIzaSyB6asthrjc-7nv4JlyCt0on9HK-2JMD76C",
  authDomain: "de-jo-bluea.firebaseapp.com",
  projectId: "de-jo-bluea",
  storageBucket: "de-jo-bluea.appspot.com",
  messagingSenderId: "213345773472",
  appId: "1:213345773472:web:5d0fbed7b68741e2c2e6c5"
};

const firebaseScripts = [
  "https://www.gstatic.com/firebasejs/10.12.4/firebase-app-compat.js",
  "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore-compat.js"
];

function loadFirebaseIfConfigured() {
  return new Promise((resolve) => {
    if (!firebaseConfig.apiKey) { resolve(null); return; }
    let loaded = 0;
    firebaseScripts.forEach(src => {
      const s = document.createElement('script');
      s.src = src;
      s.onload = () => {
        loaded++;
        if (loaded === firebaseScripts.length) {
          firebase.initializeApp(firebaseConfig);
          resolve({ db: firebase.firestore() });
        }
      };
      document.head.appendChild(s);
    });
  });
}

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
      const snapshot = await fb.db.collection("orders").orderBy("createdAt", "desc").get();
      data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } else {
      data = readLocalOrders();
    }

    const filter = filterPaid.value;
    const query = searchInput.value.toLowerCase();

    const filtered = data.filter(o => {
      const matchStatus =
        filter === "all" ||
        (filter === "paid" && o.paymentStatus === "paid") ||
        (filter === "pending" && o.paymentStatus === "pending");

      const matchSearch =
        o.customer?.name?.toLowerCase().includes(query) ||
        o.customer?.phone?.toLowerCase().includes(query);

      return matchStatus && matchSearch;
    });

    ordersEl.innerHTML = "";
    filtered.forEach(o => {
      const div = document.createElement("div");
      const paid = o.paymentStatus === "paid";
      const subtotal = Number(o.subtotal || 0).toLocaleString("en-NG");

      div.className = "order-card";
      div.innerHTML = `
        <h3>${o.customer?.name || "Unnamed"}</h3>
        <p>Phone: ${o.customer?.phone || ""}</p>
        <p>Email: ${o.customer?.email || ""}</p>
        <p>Notes: ${o.notes || "—"}</p>
        <p><strong>Total:</strong> ₦ ${subtotal}</p>
        <p class="status ${paid ? "paid" : "pending"}">Status: ${paid ? "Paid" : "Pending"}</p>
        <div class="order-actions">
          <button class="btn" data-action="mark-paid" data-id="${o.id}">Mark paid</button>
          <button class="btn danger" data-action="mark-pending" data-id="${o.id}">Mark pending</button>
          <button class="btn" data-action="complete" data-id="${o.id}">Complete</button>
          <button class="btn danger" data-action="cancel" data-id="${o.id}">Cancel</button>
          <button class="btn" data-action="delete" data-id="${o.id}">Delete</button>
          <button class="btn" data-action="set-total" data-id="${o.id}">Set total</button>
        </div>
      `;
      ordersEl.appendChild(div);
    });
  }

  refreshBtn.addEventListener("click", fetchOrders);
  filterPaid.addEventListener("change", fetchOrders);
  searchInput.addEventListener("input", fetchOrders);

  exportBtn.addEventListener("click", () => {
    if (!unlocked) return alert("Unlock admin first.");
    const data = fb?.db ? "Export from Firestore not implemented" : readLocalOrders();
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
      const ref = fb.db.collection("orders").doc(id);
      if (action === "mark-paid") await ref.update({ paymentStatus: "paid" });
      if (action === "mark-pending") await ref.update({ paymentStatus: "pending" });
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
      const orders = readLocalOrders();
      const idx = orders.findIndex(o => o.id === id);
      if (idx === -1) return;
      if (action === "mark-paid") orders[idx].paymentStatus = "paid";
      if (action === "mark-pending") orders[idx].paymentStatus = "pending";
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

  await fetchOrders();
});
