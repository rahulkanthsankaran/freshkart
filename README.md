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

## ⚡ Deployment to Vercel

This repository is **100% pre-configured and deployment-ready for Vercel**!

### Option A: Deploy via Vercel Web Dashboard (Recommended)
1. Push this project to your GitHub, GitLab, or Bitbucket account.
2. Go to [vercel.com](https://vercel.com) and click **"Add New..." > "Project"**.
3. Import your `FreshKart` repository.
4. Leave all settings at default (**Framework Preset: Other**, Root Directory: `./`).
5. Click **"Deploy"**.
6. Your live site will be ready at `https://<your-project>.vercel.app` in seconds!

### Option B: Deploy via Vercel CLI
```bash
# 1. Install Vercel CLI globally (if not installed)
npm install -g vercel

# 2. Login to your Vercel account
vercel login

# 3. Deploy to production
vercel --prod
```

### 🛠️ Vercel Architecture Details
- **`vercel.json`**: Configures clean URLs, automatic API rewrites, asset caching, CORS, and security headers.
- **Serverless API (`api/index.js`)**: All dynamic endpoints (`/api/products`, `/api/health`, `/api/orders`, `/api/ai/chat`, `/api/register`, `/api/records`, `/api/analyze-url`) execute as ultra-fast Vercel Serverless Functions.
- **Static Assets**: HTML, CSS, JavaScript, and JSON datasets are served globally via Vercel's global CDN Edge Network.
- **PHP Compatibility Layer**: Requests to legacy PHP endpoints (`/php-module/process.php`, `/php-module/records.php`, `/php-module/analyze-url.php`) automatically map to the Node.js serverless functions, preserving full fullstack functionality in serverless cloud hosting!

---

## 💻 How to Run Locally

### 1. Frontend Quick Launch
Simply double click `index.html` or run:
```bash
npm start
```
Server runs at `http://localhost:3000`.

### 2. Full-Stack Node.js REST API Server
```bash
npm run server
```
Server runs at `http://localhost:5000` with live REST endpoints.

### 3. PHP / MySQL Module (Optional XAMPP)
1. Place the repository in your web server root (e.g. `xampp/htdocs/FullStack_CAT2/`).
2. Import `php-module/schema.sql` into phpMyAdmin / MySQL.
3. Access `http://localhost/FullStack_CAT2/php-module/index.html`.


