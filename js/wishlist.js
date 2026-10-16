/* ── wishlist.js: Wishlist page rendering ── */
'use strict';

document.addEventListener('DOMContentLoaded', () => {
  const wishlistGrid = document.getElementById('wishlist-grid');
  if (!wishlistGrid) return; // Not on wishlist page

  function getWishlist() { return JSON.parse(localStorage.getItem('FreshKart-wishlist') || '[]'); }

  function renderWishlist() {
    const wl = getWishlist();
    const products = window.PRODUCTS || [];
    const wishlistProducts = products.filter(p => wl.includes(p.id));

    if (!wishlistProducts.length) {
      wishlistGrid.innerHTML = '<div class="empty-state"><div class="empty-icon">❤️</div><h3>Your wishlist is empty</h3><p>Save products you love by clicking the heart icon.</p><a href="products.html" class="btn btn-primary mt-2">Browse Products</a></div>';
      return;
    }
    if (typeof renderProducts === 'function') {
      renderProducts(wishlistProducts, 'wishlist-grid');
    } else {
      wishlistGrid.innerHTML = wishlistProducts.map(p => `
        <div class="card" style="padding:1rem;">
          <img src="${p.image}" alt="${p.name}" style="width:100%;height:160px;object-fit:cover;border-radius:var(--radius-sm);margin-bottom:0.75rem;" onerror="this.src='https://picsum.photos/seed/placeholder/300/200'" />
          <div class="product-name">${p.name}</div>
          <div class="product-price" style="margin:0.5rem 0;">₹${Number(p.price).toLocaleString('en-IN')}</div>
          <button class="btn btn-primary btn-sm btn-block" onclick="if(window.addToCart){addToCart(${JSON.stringify(p).replace(/"/g, '&quot;')});}">Add to Cart</button>
        </div>
      `).join('');
    }
  }

  renderWishlist();

  // Update badge
  const wlCount = document.getElementById('wishlist-count');
  if (wlCount) wlCount.textContent = getWishlist().length;
});
