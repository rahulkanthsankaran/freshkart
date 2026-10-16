# 🛍️ FreshKart — AI Personal Shopping Agent Platform

> Full-Stack Intelligent E-Commerce and Personal Shopping Assistance System built with modern HTML5, Vanilla CSS3, ES6+ JavaScript, jQuery, Node.js/Express, MongoDB, and PHP/MySQL.

---

## 🚀 Key Features

### 1. 🤖 Intelligent Personal Shopping Agent
- **Natural Language Assistant**: Understands user intent, budget constraints, and product categories to deliver tailored recommendations.
- **Specification Comparison Matrix**: Compare up to 4 devices side-by-side with automatic specification highlight and AI Verdict summary.
- **Sentiment & Review Analysis**: Real-time breakdown of community sentiment (Positive, Neutral, Critical) with key highlights.

### 2. 🛒 Complete E-Commerce Storefront
- **Dynamic Product Catalog**: Search across grocery titles and freshness metrics, instant category filtering (Fresh Vegetables, Fruits, Dairy, Staples, Daily Needs), price range sliders, and multi-criteria sorting without page reloads.
- **HTML5 Drag-and-Drop Zones**: Drag product cards directly into dynamic Cart, Wishlist, or Comparison drop zones.
- **Full Checkout Flow**: Multi-step checkout with address validation, payment method selection (UPI, Credit/Debit Card, COD), and instantaneous order confirmation.
- **Live Order Tracking**: Visual step-by-step milestone timeline tracking package status from confirmation to doorstep delivery.

### 3. 🏪 Multi-Role Dashboards
- **Seller / Vendor Central (`seller-dashboard.html`)**: Real-time sales KPIs, listing creation form, inventory management with stock modification and deletion.
- **Enterprise Admin Console (`admin-dashboard.html`)**: Platform GMV metrics, user permission controls, and live security activity logs.

### 4. 🌐 E-Commerce URL & Metadata Scraper (`url-analyzer.html`)
- Extract OpenGraph preview tags, prices, host headers, image asset grids, internal hyperlinks, and HTML heading structures from any webpage URL.

### 5. 🐘 Dedicated PHP + MySQL Demonstration Module (`php-module/`)
- Production-grade PDO database connection (`db.php`).
- Form submission with server-side validation, secure bcrypt password hashing, and image upload handling (`process.php`).
- Searchable records listing with inline delete functionality (`records.php`).

---

## 📂 Project Architecture

```
FullStack_CAT2/
├── index.html                  # Central Storefront & Feature Showcase
├── products.html               # Searchable & Filterable Catalog
├── product-detail.html         # Detailed Product View & Sentiment
├── cart.html                   # Dynamic Cart with Discounts & Taxes
├── checkout.html               # Multi-step Address & Payment
├── orders.html                 # Visual Delivery Timeline & History
├── wishlist.html               # Wishlist with Transfer-to-Cart
├── compare.html                # 4-Item Side-by-Side Comparison Matrix
├── ai-assistant.html           # Real-Time AI Chatbot & Suggestions
├── register.html               # 20+ Field Form with Password Strength
├── login.html                  # Quick-Fill Demo Roles (User/Seller/Admin)
├── seller-dashboard.html       # Vendor Inventory & Sales Management
├── admin-dashboard.html        # Platform Analytics & Activity Stream
├── url-analyzer.html           # Web URL & Product Scraper Tool
├── contact.html                # Customer Support & FAQ Accordion
├── css/
│   └── style.css               # Design System, CSS Variables, Responsive
├── js/
│   ├── main.js                 # Theme switcher, Clock, Hero slider, Storage UI
│   ├── products.js             # Catalog Engine, Filter logic, AJAX Loader
│   ├── jquery-ops.js           # jQuery DOM Manipulation & Star Ratings
│   └── drag-drop.js            # HTML5 Drag-and-Drop Handlers
├── data/
│   └── products.json           # 12 Detailed Product Records
├── backend/
│   ├── server.js               # Node.js Express REST API
│   ├── package.json            # Dependencies & Scripts
│   ├── .env.example            # Environment Configuration
│   └── models/                 # Mongoose Schemas (User, Product, Order)
└── php-module/
    ├── index.html              # PHP Form Interface
    ├── db.php                  # PDO Connection
    ├── process.php             # Server-Side Validator & Upload Handler
    ├── records.php             # Searchable Records CRUD
    └── schema.sql              # MySQL Database & Table Definitions
```

---

## 💻 How to Run Locally

### 1. Frontend Quick Launch
Simply double click `index.html` or open any `.html` file directly in any modern browser. All features (storage, cart, search, AI simulator) function seamlessly client-side!

### 2. Node.js REST API Server
```bash
cd backend
npm install
npm start
```
Server runs at `http://localhost:5000`.

### 3. PHP / MySQL Module
1. Place the repository in your web server root (e.g. `xampp/htdocs/FullStack_CAT2/`).
2. Import `php-module/schema.sql` into phpMyAdmin / MySQL.
3. Access `http://localhost/FullStack_CAT2/php-module/index.html`.

