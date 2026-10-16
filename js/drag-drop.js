/* ── drag-drop.js: HTML5 drag-and-drop for cart, wishlist, compare zones ── */
'use strict';

let draggedProductId = null;

/* ────────── Set up draggable product cards ────────── */
document.addEventListener('dragstart', (e) => {
  const card = e.target.closest('.product-card[draggable="true"]');
  if (!card) return;
  draggedProductId = card.dataset.productId;
  card.style.opacity = '0.5';
  e.dataTransfer.effectAllowed = 'copy';
  e.dataTransfer.setData('text/plain', draggedProductId);
});

document.addEventListener('dragend', (e) => {
  const card = e.target.closest('.product-card');
  if (card) card.style.opacity = '1';
});

/* ────────── Drop Zones Initialization ────────── */
function initDropZones() {
  const dropZones = document.querySelectorAll('.drop-zone');
  dropZones.forEach(zone => {
    if (zone.dataset.dndBound) return;
    zone.dataset.dndBound = 'true';

    zone.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
      zone.classList.add('drag-over');
    });

    zone.addEventListener('dragleave', (e) => {
      if (!zone.contains(e.relatedTarget)) zone.classList.remove('drag-over');
    });

    zone.addEventListener('drop', (e) => {
      e.preventDefault();
      zone.classList.remove('drag-over');
      const id = e.dataTransfer.getData('text/plain') || draggedProductId;
      if (!id) return;
      const action = zone.dataset.action;
      handleDrop(id, action, zone);
    });
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initDropZones);
} else {
  initDropZones();
}
window.initDropZones = initDropZones;

/* ────────── Handle Drop Action ────────── */
function handleDrop(id, action, zone) {
  const products = window.PRODUCTS || [];
  const prod = products.find(p => p.id === id);
  if (!prod) return;

  if (action === 'cart') {
    window.addToCart && addToCart(prod);
    appendDropItem(zone, 'drop-cart-list', prod, '🛒');
  }

  if (action === 'wishlist') {
    let wl = JSON.parse(localStorage.getItem('FreshKart-wishlist') || '[]');
    if (!wl.includes(id)) {
      wl.push(id);
      localStorage.setItem('FreshKart-wishlist', JSON.stringify(wl));
      window.showToast && showToast(`${prod.name} added to Wishlist ❤️`, 'success');
    } else {
      window.showToast && showToast('Already in Wishlist', 'info');
    }
    appendDropItem(zone, 'drop-wishlist-list', prod, '❤️');
  }

  if (action === 'compare') {
    let compare = JSON.parse(sessionStorage.getItem('FreshKart-compare') || '[]');
    if (compare.includes(id)) { window.showToast && showToast('Already in compare list', 'info'); return; }
    if (compare.length >= 4)  { window.showToast && showToast('Compare list full (max 4)', 'warning'); return; }
    compare.push(id);
    sessionStorage.setItem('FreshKart-compare', JSON.stringify(compare));
    window.showToast && showToast(`${prod.name} added to Compare`, 'success');
    appendDropItem(zone, 'drop-compare-list', prod, '⚖️');
  }
}

function appendDropItem(zone, listId, prod, icon) {
  const listEl = document.getElementById(listId);
  if (!listEl) return;
  // Remove placeholder text from zone
  zone.querySelectorAll('span, strong, small').forEach(el => {
    if (!el.closest(`#${listId}`)) el.style.fontSize = '0';
  });
  const existing = listEl.querySelectorAll('[data-id]');
  for (let el of existing) { if (el.dataset.id === prod.id) return; }
  const item = document.createElement('div');
  item.dataset.id = prod.id;
  item.style.cssText = 'display:flex;align-items:center;gap:0.4rem;padding:0.3rem;background:var(--bg-3);border-radius:6px;margin-top:0.3rem;font-size:0.75rem;';
  item.innerHTML = `${icon} <span style="color:var(--text-strong);flex:1;">${prod.name}</span> <button data-remove="${prod.id}" data-list="${listId}" style="background:none;color:var(--danger);font-size:0.85rem;border:none;cursor:pointer;">✕</button>`;
  listEl.appendChild(item);

  // Remove button
  item.querySelector('[data-remove]').addEventListener('click', () => item.remove());
}

