// Simple passcode gate, then Firebase anonymous auth
const ADMIN_PASSCODE = '524684';

document.getElementById('loginBtn').addEventListener('click', async () => {
  const pass = document.getElementById('adminPass').value.trim();
  if (pass !== ADMIN_PASSCODE) {
    alert('Incorrect password');
    return;
  }
  await adminLogin(); // firebase.js: ensures anonymous sign-in
  document.getElementById('loginBox').style.display = 'none';
  document.getElementById('adminBox').style.display = 'block';
  loadOrders();
});

document.getElementById('logoutBtn').addEventListener('click', async () => {
  await adminLogout();
  document.getElementById('adminBox').style.display = 'none';
  document.getElementById('loginBox').style.display = 'block';
});

document.getElementById('refreshBtn').addEventListener('click', loadOrders);

async function loadOrders(){
  const q = document.getElementById('searchQuery').value.trim().toLowerCase();
  const status = document.getElementById('statusFilter').value;
  const orders = await fetchOrders(); // firebase.js
  const filtered = orders.filter(o => {
    const matchQ = !q || (o.name?.toLowerCase().includes(q) || o.email?.toLowerCase().includes(q));
    const matchS = !status || o.status === status;
    return matchQ && matchS;
  });

  const list = document.getElementById('ordersList');
  list.innerHTML = '';
  filtered.sort((a,b)=> (b.createdAt || '').localeCompare(a.createdAt || ''));
  filtered.forEach(o => {
    const wrap = document.createElement('div');
    wrap.className = 'line';
    const itemsHtml = (o.items || []).map(i => {
      const priceLabel = i.negotiable ? 'Negotiable' : `₦${i.price}`;
      return `${i.name} — ${priceLabel} × ${i.qty}`;
    }).join('<br>');
    wrap.innerHTML = `
      <div class="card" style="padding:12px; margin-bottom:10px;">
        <div class="flex items-center justify-between">
          <div>
            <div class="font-semibold">Order ID: ${o.id || ''}</div>
            <div class="muted">Created: ${o.createdAt || ''}</div>
          </div>
          <div><span class="badge">${o.status || 'submitted'}</span></div>
        </div>
        <div class="mt-2"><strong>Customer:</strong> ${o.name} — ${o.email} — ${o.phone}</div>
        <div class="mt-1"><strong>Delivery/Pickup:</strong> ${o.delivery}</div>
        <div class="mt-1"><strong>Subtotal:</strong> ₦${o.subtotal || 0} — <strong>Payment:</strong> ${o.paymentStatus || 'pending'}</div>
        <div class="mt-2"><strong>Items:</strong><br>${itemsHtml}</div>
        <div class="mt-2"><strong>Receipt:</strong> ${o.receiptUrl ? `<a href="${o.receiptUrl}" target="_blank">View</a>` : 'None'}</div>
        <div class="mt-3 flex gap-8">
          <button class="btn btn-maroon" onclick="confirmPayment('${o.id}')">Mark payment confirmed</button>
          <button class="btn btn-cream" onclick="deleteOrder('${o.id}')">Delete order</button>
        </div>
      </div>`;
    list.appendChild(wrap);
  });
}

async function confirmPayment(id){
  await updateOrder(id, { status: 'confirmed', paymentStatus: 'completed' });
  loadOrders();
}
async function deleteOrder(id){
  if(!confirm('Delete this order?')) return;
  await removeOrder(id);
  loadOrders();
}
