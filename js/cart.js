/* ── cart.js: Cart page rendering and management ── */
'use strict';

/* Cart page rendering is handled here; cart add/remove logic is in products.js */
document.addEventListener('DOMContentLoaded', () => {
  const cartContainer = document.getElementById('cart-items');
  const cartSummary   = document.getElementById('cart-summary');
  if (!cartContainer) return; // Not on cart page

  function getCart() { return JSON.parse(localStorage.getItem('FreshKart-cart') || '[]'); }
  function saveCart(cart) { localStorage.setItem('FreshKart-cart', JSON.stringify(cart)); }

  function renderCart() {
    const cart = getCart();
    if (!cart.length) {
      cartContainer.innerHTML = '<div class="empty-state"><div class="empty-icon">🛒</div><h3>Your cart is empty</h3><p>Browse products and add them to your cart.</p><a href="products.html" class="btn btn-primary mt-2">Shop Now</a></div>';
      if (cartSummary) cartSummary.innerHTML = '';
      return;
    }
    cartContainer.innerHTML = cart.map(item => `
      <div class="cart-item" data-id="${item.id}">
        <img class="cart-item-img" src="${item.image}" alt="${item.name}" onerror="this.src='https://picsum.photos/seed/placeholder/70/70'" />
        <div class="cart-item-info">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-price">₹${Number(item.price).toLocaleString('en-IN')}</div>
        </div>
        <div class="qty-control">
          <button class="qty-btn" data-id="${item.id}" data-action="qty-dec">−</button>
          <span class="qty-val">${item.qty}</span>
          <button class="qty-btn" data-id="${item.id}" data-action="qty-inc">+</button>
        </div>
        <button class="btn btn-danger btn-sm" data-id="${item.id}" data-action="remove-item">✕</button>
      </div>
    `).join('');

    const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
    const count = cart.reduce((s, i) => s + i.qty, 0);
    if (cartSummary) {
      cartSummary.innerHTML = `
        <div class="card" style="padding:1.5rem;">
          <h3 style="margin-bottom:1rem;">Order Summary</h3>
          <div style="display:flex; justify-content:space-between; margin-bottom:0.5rem;"><span>Items (${count})</span><span>₹${total.toLocaleString('en-IN')}</span></div>
          <div style="display:flex; justify-content:space-between; margin-bottom:0.5rem;"><span>Shipping</span><span style="color:var(--success);">Free</span></div>
          <hr class="divider" />
          <div style="display:flex; justify-content:space-between; font-weight:700; font-size:1.1rem;"><span>Total</span><span>₹${total.toLocaleString('en-IN')}</span></div>
          <a href="checkout.html" class="btn btn-primary btn-block mt-3">Proceed to Checkout</a>
        </div>`;
    }
  }

  renderCart();

  cartContainer.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const action = btn.dataset.action;
    const id = btn.dataset.id;
    let cart = getCart();
    if (action === 'qty-inc') {
      const item = cart.find(i => i.id === id);
      if (item) item.qty++;
    }
    if (action === 'qty-dec') {
      const item = cart.find(i => i.id === id);
      if (item && item.qty > 1) item.qty--;
      else cart = cart.filter(i => i.id !== id);
    }
    if (action === 'remove-item') {
      cart = cart.filter(i => i.id !== id);
      window.showToast && showToast('Item removed from cart', 'info');
    }
    saveCart(cart);
    renderCart();
    document.querySelectorAll('#cart-count').forEach(el => el.textContent = cart.reduce((s, i) => s + i.qty, 0));
  });
});
