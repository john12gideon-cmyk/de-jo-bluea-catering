// Simple state
const state = {
  qty: {
    dryfish: 0, crayfish: 0,
    fw200: 0, fw500: 0, fw1000: 0,
    buffet: 0, chairs: 0, plates: 0, spoons: 0
  },
  cart: []
};

function inc(key){ state.qty[key]++; updateQty(key); }
function dec(key){ state.qty[key] = Math.max(0, state.qty[key]-1); updateQty(key); }
function updateQty(key){ document.getElementById(`qty-${key}`).textContent = state.qty[key]; }

function addNegotiable(key, name){
  const qty = state.qty[key];
  if(!qty) return;
  addToCart({ key, name, price: 0, negotiable: true, qty });
  state.qty[key] = 0; updateQty(key);
  openCartPanel();
}
function addFixed(key, name, price){
  const qty = state.qty[key];
  if(!qty) return;
  addToCart({ key, name, price, negotiable: false, qty });
  state.qty[key] = 0; updateQty(key);
  openCartPanel();
}

function addToCart(item){
  const existing = state.cart.find(i => i.key === item.key);
  if (existing) existing.qty += item.qty;
  else state.cart.push(item);
  renderCart();
}

function renderCart(){
  const wrap = document.getElementById('cartItems');
  wrap.innerHTML = '';
  let subtotal = 0;
  state.cart.forEach(i => {
    const line = document.createElement('div');
    line.className = 'line';
    const priceLabel = i.negotiable ? 'Negotiable' : `₦${i.price}`;
    if(!i.negotiable) subtotal += i.price * i.qty;
    line.innerHTML = `
      <div class="flex justify-between items-center">
        <div>
          <div class="font-semibold">${i.name}</div>
          <div class="muted">${priceLabel} × ${i.qty}</div>
        </div>
        <div class="flex items-center gap-2">
          <button class="qty-btn" onclick="changeCartQty('${i.key}',-1)">−</button>
          <button class="qty-btn" onclick="changeCartQty('${i.key}',1)">+</button>
          <button class="icon-btn" onclick="removeFromCart('${i.key}')">🗑️</button>
        </div>
      </div>`;
    wrap.appendChild(line);
  });
  document.getElementById('cartSubtotal').textContent = `₦${subtotal}`;
}

function changeCartQty(key, delta){
  const item = state.cart.find(i => i.key === key);
  if(!item) return;
  item.qty += delta;
  if(item.qty <= 0) removeFromCart(key);
  renderCart();
}
function removeFromCart(key){
  state.cart = state.cart.filter(i => i.key !== key);
  renderCart();
}

// Splash
const splash = document.getElementById('splash');
document.getElementById('enterBtn').addEventListener('click', () => {
  splash.style.opacity = '0';
  setTimeout(() => { splash.style.display = 'none'; }, 400);
  scrollToShop();
});

function scrollToShop(){
  document.getElementById('shop').scrollIntoView({ behavior: 'smooth' });
}

// Cart panel open/close
const cartPanel = document.getElementById('cartPanel');
document.getElementById('openCart').addEventListener('click', openCartPanel);
document.getElementById('closeCart').addEventListener('click', () => cartPanel.style.display = 'none');
function openCartPanel(){ cartPanel.style.display = 'block'; }

// Checkout
document.getElementById('checkoutBtn').addEventListener('click', openCheckout);
const checkoutModal = document.getElementById('checkoutModal');
function openCheckout(){
  const itemsEl = document.getElementById('checkoutItems');
  itemsEl.innerHTML = state.cart.map(i => {
    const priceLabel = i.negotiable ? 'Negotiable' : `₦${i.price}`;
    return `<div class="line"><strong>${i.name}</strong> — ${priceLabel} × ${i.qty}</div>`;
  }).join('');
  const subtotal = state.cart.filter(i=>!i.negotiable).reduce((s,i)=>s+i.price*i.qty,0);
  document.getElementById('checkoutSubtotal').textContent = `₦${subtotal}`;
  checkoutModal.style.display = 'flex';
}
function closeCheckout(){ checkoutModal.style.display = 'none'; }

document.getElementById('orderForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const fd = new FormData(e.target);
  const order = {
    name: fd.get('name'),
    phone: fd.get('phone'),
    email: fd.get('email'),
    delivery: fd.get('delivery'),
    notes: fd.get('notes') || '',
    paymentStatus: fd.get('paymentStatus'),
    items: state.cart,
    subtotal: state.cart.filter(i=>!i.negotiable).reduce((s,i)=>s+i.price*i.qty,0),
    createdAt: new Date().toISOString(),
    status: 'submitted'
  };

  // Upload receipt if provided
  const file = fd.get('receipt');
  let receiptUrl = '';
  if (file && file.size > 0) {
    receiptUrl = await uploadReceipt(file); // defined in firebase.js
  }
  order.receiptUrl = receiptUrl;

  const orderId = await saveOrder(order);   // defined in firebase.js
  alert(`Order submitted! Your Order ID: ${orderId}`);
  // Clear cart and close
  state.cart = []; renderCart(); closeCheckout();
});
