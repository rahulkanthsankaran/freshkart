/* ── main.js: Core JS — theme, clock, slider, nav, notifications, stats counter, storage UI ── */
'use strict';

/* ────────── Theme Switcher ────────── */
const themeToggle = document.getElementById('themeToggle');
const themeIcon   = document.getElementById('theme-icon');
const html        = document.documentElement;

const savedTheme = localStorage.getItem('FreshKart-theme') || 'light';
html.setAttribute('data-theme', savedTheme);
updateThemeIcon(savedTheme);

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const current = html.getAttribute('data-theme');
    const next    = current === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    localStorage.setItem('FreshKart-theme', next);
    updateThemeIcon(next);
    showToast(`Switched to ${next} mode`, 'info');
  });
}
function updateThemeIcon(theme) {
  if (!themeIcon) return;
  themeIcon.className = theme === 'dark' ? 'fa fa-sun' : 'fa fa-moon';
}

/* ────────── Live Clock ────────── */
function updateClock() {
  const now  = new Date();
  const time = document.getElementById('live-time');
  const date = document.getElementById('live-date');
  const full = document.getElementById('full-datetime');
  if (time) time.textContent = now.toLocaleTimeString('en-IN');
  if (date) date.textContent = now.toLocaleDateString('en-IN', { weekday:'short', month:'short', day:'numeric' });
  if (full) full.textContent = now.toLocaleString('en-IN', { dateStyle:'medium', timeStyle:'short' });
}
updateClock();
setInterval(updateClock, 1000);

/* ────────── Hamburger / Mobile Nav ────────── */
const hamburger = document.getElementById('hamburger');
const siteNav   = document.getElementById('site-nav');
if (hamburger && siteNav) {
  hamburger.addEventListener('click', () => {
    siteNav.classList.toggle('open');
    hamburger.innerHTML = siteNav.classList.contains('open')
      ? '<i class="fa fa-times"></i>'
      : '<i class="fa fa-bars"></i>';
  });
}

/* ────────── Hero Slider ────────── */
const slides    = document.querySelectorAll('.slide');
const dots      = document.querySelectorAll('.dot');
const slidePrev = document.getElementById('slidePrev');
const slideNext = document.getElementById('slideNext');
let currentSlide = 0;
let sliderTimer;

function goToSlide(n) {
  slides[currentSlide].classList.remove('active');
  dots[currentSlide].classList.remove('active');
  currentSlide = (n + slides.length) % slides.length;
  slides[currentSlide].classList.add('active');
  dots[currentSlide].classList.add('active');
}
function startSlider() { sliderTimer = setInterval(() => goToSlide(currentSlide + 1), 4500); }
function stopSlider()  { clearInterval(sliderTimer); }

if (slides.length) {
  startSlider();
  if (slidePrev) slidePrev.addEventListener('click', () => { stopSlider(); goToSlide(currentSlide - 1); startSlider(); });
  if (slideNext) slideNext.addEventListener('click', () => { stopSlider(); goToSlide(currentSlide + 1); startSlider(); });
  dots.forEach(dot => dot.addEventListener('click', () => { stopSlider(); goToSlide(parseInt(dot.dataset.slide)); startSlider(); }));
}

/* ────────── Notification Panel ────────── */
const notifBtn   = document.getElementById('notifBtn');
const notifPanel = document.getElementById('notifPanel');
let notifOpen    = false;
if (notifBtn && notifPanel) {
  notifBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    notifOpen = !notifOpen;
    notifPanel.classList.toggle('open', notifOpen);
  });
  document.addEventListener('click', (e) => {
    if (notifOpen && !notifPanel.contains(e.target) && e.target !== notifBtn) {
      notifOpen = false; notifPanel.classList.remove('open');
    }
  });
}
const markAllRead = document.getElementById('markAllRead');
if (markAllRead) {
  markAllRead.addEventListener('click', () => {
    document.querySelectorAll('.notif-item.unread').forEach(el => el.classList.remove('unread'));
    const notifCount = document.getElementById('notif-count');
    if (notifCount) notifCount.textContent = '0';
    showToast('All notifications marked as read', 'success');
  });
}

/* ────────── Animated Stats Counter ────────── */
function animateCounter(el) {
  const target = parseInt(el.dataset.target);
  const prefix = el.dataset.prefix || '';
  const duration = 1800;
  const start = performance.now();
  function step(time) {
    const progress = Math.min((time - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const val = Math.floor(eased * target);
    el.textContent = prefix + (prefix === '₹' ? '₹' + val.toLocaleString('en-IN') : val.toLocaleString('en-IN'));
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}
const statsGrid = document.getElementById('stats-grid');
if (statsGrid) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.querySelectorAll('[data-target]').forEach(el => animateCounter(el));
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });
  observer.observe(statsGrid);
}

/* ────────── Tabs ────────── */
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', function() {
    const container = this.closest('section') || document;
    container.querySelectorAll('.tab-btn').forEach(b => { b.classList.remove('active'); b.setAttribute('aria-selected','false'); });
    container.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    this.classList.add('active');
    this.setAttribute('aria-selected','true');
    const panel = document.getElementById('tab-' + this.dataset.tab);
    if (panel) panel.classList.add('active');
  });
});

/* ────────── Accordion ────────── */
document.querySelectorAll('.accordion-header').forEach(hdr => {
  hdr.addEventListener('click', function() {
    const item = this.parentElement;
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.accordion-item.open').forEach(el => el.classList.remove('open'));
    if (!isOpen) item.classList.add('open');
  });
});

/* ────────── Web Storage Panel ────────── */
function setupStorage(prefix, storage) {
  const saveBtn  = document.getElementById(`${prefix}-save`);
  const getBtn   = document.getElementById(`${prefix}-get`);
  const clearBtn = document.getElementById(`${prefix}-clear`);
  const keyEl    = document.getElementById(`${prefix}-key`);
  const valEl    = document.getElementById(`${prefix}-val`);
  const output   = document.getElementById(`${prefix}-output`);
  if (!saveBtn) return;
  saveBtn.addEventListener('click', () => {
    const k = keyEl.value.trim(), v = valEl.value.trim();
    if (!k || !v) { output.textContent = '⚠️ Please enter both key and value.'; return; }
    storage.setItem(k, v);
    output.textContent = `✅ Saved: "${k}" = "${v}"`;
    showToast(`Saved to ${prefix === 'ls' ? 'localStorage' : 'sessionStorage'}`, 'success');
  });
  getBtn.addEventListener('click', () => {
    const k = keyEl.value.trim();
    if (!k) { output.textContent = '⚠️ Enter a key to retrieve.'; return; }
    const v = storage.getItem(k);
    output.textContent = v !== null ? `📦 "${k}" = "${v}"` : `❌ Key "${k}" not found.`;
  });
  clearBtn.addEventListener('click', () => {
    storage.clear();
    output.textContent = '🗑️ All data cleared.';
    showToast('Storage cleared', 'warning');
  });
}
setupStorage('ls', localStorage);
setupStorage('ss', sessionStorage);

/* ────────── Toast Notifications ────────── */
function showToast(message, type = 'info', duration = 3000) {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const icons = { success:'✅', error:'❌', warning:'⚠️', info:'ℹ️' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${icons[type] || 'ℹ️'}</span><span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('hide');
    setTimeout(() => toast.remove(), 400);
  }, duration);
}
window.showToast = showToast;

/* ────────── Home Chat (AI Teaser) ────────── */
const homeChatInput  = document.getElementById('home-chat-input');
const homeChatSend   = document.getElementById('home-chat-send');
const homeChatMsgs   = document.getElementById('home-chat-messages');
const homeQuickPrompts = document.getElementById('home-quick-prompts');

const AI_RESPONSES = {
  vegetables: ['🥦 For fresh cooking, I recommend **Farm Fresh Hybrid Tomatoes** (₹38/kg), **Fresh Green Capsicum** (₹45/500g), and **Hydroponic Spinach** (₹29/2 bunches). Sourced directly from local farms and 100% pesticide tested!'],
  fruits: ['🍎 For juicy, nutritious fruits, try our **Royal Ratnagiri Alphonso Mangoes** (₹1,499/dozen), **Organic Hass Avocados** (₹349/4-pack), and **Shimla Royal Delicious Apples** (₹189/kg). Naturally ripened & sweet!'],
  dairy: ['🥛 For daily dairy & breakfast essentials, we have **Country Fresh Pure Cow Milk (2L)** (₹140), **Fresh Malai Paneer (200g)** (₹95), **Amul Salted Butter (500g)** (₹275), and **Farm Fresh Brown Eggs (12 pcs)** (₹119)! Delivered cold in 15 mins.'],
  staples: ['🌾 For your monthly kitchen pantry, top essentials include **Aashirvaad MP Sharbati Atta (5kg)** (₹295), **Daawat Rozana Basmati Rice (5kg)** (₹449), **Tata Sampann Toor Dal (1kg)** (₹175), and **Fortune Sunflower Oil (1L)** (₹138).'],
  snacks: ['🍪 For tea & snacks, top picks are **Tata Tea Gold (500g)** (₹299), **Nescafe Classic Coffee (100g)** (₹340), **Quaker Rolled Oats (1kg)** (₹185), and **Epigamia Greek Yogurt (3-pack)** (₹149).'],
  daily: ['🧼 For daily home cleaning & hygiene, I recommend **Surf Excel Matic Liquid Detergent (1L)** (₹225), **Vim Lemon Dishwash Gel (750ml)** (₹155), **Dettol Liquid Handwash Refill (1500ml)** (₹219), and **Lizol Surface Cleaner (1L)** (₹199)!'],
  budget: ['💰 **Budget Meal Basket under ₹200:**<br/>• Farm Fresh Tomatoes (1kg) — ₹38<br/>• Red Onions (1kg) — ₹35<br/>• Fresh Potatoes (1kg) — ₹32<br/>• Amul Taaza Milk (1L) — ₹72<br/>**Total: ₹177** with instant 15-minute doorstep delivery! ⚡'],
  default: ['🥦 I am your BigBasket-style grocery assistant! I can help you find **Fresh Farm Vegetables, Seasonal Fruits, Dairy & Breakfast, Monthly Staples & Grains, and Daily Household Needs**. Tell me what you need or what recipe you want to make! 🛒']
};

function getAIResponse(msg) {
  const lower = msg.toLowerCase();
  if (lower.includes('veggie') || lower.includes('vegetable') || lower.includes('tomato') || lower.includes('onion') || lower.includes('potato') || lower.includes('spinach') || lower.includes('palak') || lower.includes('mushroom') || lower.includes('capsicum') || lower.includes('carrot') || lower.includes('broccoli') || lower.includes('curry')) return AI_RESPONSES.vegetables[0];
  if (lower.includes('fruit') || lower.includes('mango') || lower.includes('avocado') || lower.includes('apple') || lower.includes('banana') || lower.includes('orange') || lower.includes('grape') || lower.includes('watermelon') || lower.includes('papaya')) return AI_RESPONSES.fruits[0];
  if (lower.includes('milk') || lower.includes('dairy') || lower.includes('paneer') || lower.includes('curd') || lower.includes('dahi') || lower.includes('butter') || lower.includes('ghee') || lower.includes('egg') || lower.includes('bread') || lower.includes('breakfast')) return AI_RESPONSES.dairy[0];
  if (lower.includes('staple') || lower.includes('atta') || lower.includes('flour') || lower.includes('rice') || lower.includes('basmati') || lower.includes('dal') || lower.includes('oil') || lower.includes('salt') || lower.includes('sugar') || lower.includes('grain')) return AI_RESPONSES.staples[0];
  if (lower.includes('tea') || lower.includes('coffee') || lower.includes('oat') || lower.includes('juice') || lower.includes('snack') || lower.includes('beverage') || lower.includes('yogurt')) return AI_RESPONSES.snacks[0];
  if (lower.includes('clean') || lower.includes('detergent') || lower.includes('surf') || lower.includes('vim') || lower.includes('dishwash') || lower.includes('dettol') || lower.includes('handwash') || lower.includes('soap') || lower.includes('colgate') || lower.includes('paste') || lower.includes('lizol') || lower.includes('harpic') || lower.includes('daily') || lower.includes('toilet') || lower.includes('floor')) return AI_RESPONSES.daily[0];
  if (lower.includes('budget') || lower.includes('under') || lower.includes('cheap') || lower.includes('save') || lower.includes('dinner') || lower.includes('lunch') || lower.includes('recipe')) return AI_RESPONSES.budget[0];
  return AI_RESPONSES.default[0];
}

function appendMsg(content, role) {
  if (!homeChatMsgs) return;
  const div = document.createElement('div');
  div.className = `msg ${role}`;
  div.innerHTML = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  homeChatMsgs.appendChild(div);
  homeChatMsgs.scrollTop = homeChatMsgs.scrollHeight;
}

function sendHomeChat(msg) {
  if (!msg.trim()) return;
  appendMsg(msg, 'user');
  if (homeChatInput) homeChatInput.value = '';
  const thinking = document.createElement('div');
  thinking.className = 'msg ai';
  thinking.innerHTML = '<span class="typing"></span> Analyzing your request...';
  if (homeChatMsgs) { homeChatMsgs.appendChild(thinking); homeChatMsgs.scrollTop = homeChatMsgs.scrollHeight; }
  setTimeout(() => {
    if (thinking.parentNode) thinking.remove();
    appendMsg(getAIResponse(msg), 'ai');
  }, 1200);
}

if (homeChatSend) homeChatSend.addEventListener('click', () => { if (homeChatInput) sendHomeChat(homeChatInput.value); });
if (homeChatInput) {
  homeChatInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); sendHomeChat(homeChatInput.value); } });
}
if (homeQuickPrompts) {
  homeQuickPrompts.addEventListener('click', (e) => {
    const prompt = e.target.closest('.quick-prompt');
    if (prompt) sendHomeChat(prompt.dataset.msg);
  });
}

/* ────────── Scroll Reveal ────────── */
const revealEls = document.querySelectorAll('.card, .stat-card, .product-card');
if ('IntersectionObserver' in window) {
  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.animation = 'fadeIn 0.5s ease both';
        revealObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  revealEls.forEach(el => revealObs.observe(el));
}

/* ────────── Keyboard shortcut: Ctrl+K → focus search ────────── */
document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault();
    const search = document.getElementById('home-search') || document.getElementById('product-search');
    if (search) { search.focus(); search.select(); }
  }
});

