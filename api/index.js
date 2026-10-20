/**
 * FreshKart - Vercel Serverless API Router
 * 
 * Provides serverless endpoints for Vercel deployment:
 * - /api/health           : System healthcheck
 * - /api/products         : Product catalog with filtering, sorting, and search
 * - /api/products/:id     : Single product details
 * - /api/orders           : Order management
 * - /api/ai/chat          : AI Shopping Assistant recommendation engine
 * - /api/register         : User registration handler (also handles /php-module/process.php)
 * - /api/records          : Admin user records handler (also handles /php-module/records.php)
 * - /api/analyze-url      : E-commerce URL & metadata scraper (also handles /php-module/analyze-url.php)
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Lightweight multipart/form-data parser for browser FormData submissions
app.use((req, res, next) => {
  const contentType = req.headers['content-type'] || '';
  if (contentType.includes('multipart/form-data') && req.method === 'POST') {
    const rawChunks = [];
    req.on('data', chunk => rawChunks.push(chunk));
    req.on('end', () => {
      try {
        const buffer = Buffer.concat(rawChunks);
        const str = buffer.toString('latin1');
        const boundaryMatch = contentType.match(/boundary=(?:"([^"]+)"|([^;]+))/i);
        if (boundaryMatch) {
          const boundary = boundaryMatch[1] || boundaryMatch[2];
          const parts = str.split('--' + boundary);
          req.body = req.body || {};
          for (const part of parts) {
            const matchName = part.match(/name="([^"]+)"/);
            if (matchName) {
              const fieldName = matchName[1];
              if (part.includes('filename="')) {
                const fileMatch = part.match(/filename="([^"]*)"/);
                req.body[fieldName] = fileMatch ? fileMatch[1] : '';
              } else {
                const splitHeader = part.split('\r\n\r\n');
                if (splitHeader.length > 1) {
                  const value = splitHeader.slice(1).join('\r\n\r\n').replace(/\r\n$/, '').trim();
                  if (req.body[fieldName]) {
                    if (Array.isArray(req.body[fieldName])) {
                      req.body[fieldName].push(value);
                    } else {
                      req.body[fieldName] = [req.body[fieldName], value];
                    }
                  } else {
                    req.body[fieldName] = value;
                  }
                }
              }
            }
          }
        }
      } catch (err) {
        console.warn('Multipart parsing error:', err.message);
      }
      next();
    });
  } else {
    next();
  }
});

// Load product catalog
let productsDb = [];
try {
  productsDb = require('../data/products.json');
} catch (e) {
  try {
    const dataPath = path.join(process.cwd(), 'data', 'products.json');
    if (fs.existsSync(dataPath)) {
      productsDb = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    }
  } catch (err) {
    console.warn('Fallback: productsDb initialized as empty array');
  }
}

// In-memory data store for live demonstration
const usersDb = [
  {
    id: 1,
    full_name: 'Aarav Sharma',
    email: 'aarav.sharma@example.com',
    phone: '9876543211',
    dob: '1996-04-12',
    gender: 'male',
    pref_time: '09:00:00',
    address: 'Flat 402, Green Meadows, Anna Nagar',
    city: 'Chennai',
    state: 'Tamil Nadu',
    country: 'IN',
    category_prefs: 'Fresh Vegetables, Fresh Fruits',
    brand_prefs: 'FreshFarm, Amul',
    budget_range: '1000-2500',
    additional_notes: 'Prefers morning delivery between 8 AM and 10 AM.',
    created_at: '2026-10-18 09:30:00'
  },
  {
    id: 2,
    full_name: 'Priya Patel',
    email: 'priya.patel@example.com',
    phone: '9823456789',
    dob: '1998-08-25',
    gender: 'female',
    pref_time: '18:30:00',
    address: '12 Palm Grove Road, Indiranagar',
    city: 'Bengaluru',
    state: 'Karnataka',
    country: 'IN',
    category_prefs: 'Dairy & Breakfast, Daily Needs, Staples & Grains',
    brand_prefs: 'Amul, Aashirvaad, Tata',
    budget_range: '2500-5000',
    additional_notes: 'Requires organic certified produce whenever in stock.',
    created_at: '2026-10-19 14:15:00'
  },
  {
    id: 3,
    full_name: 'Rohan Varma',
    email: 'rohan.varma@example.com',
    phone: '9811223344',
    dob: '1992-11-05',
    gender: 'male',
    pref_time: '11:00:00',
    address: 'B-103, Skyline Heights, Bandra West',
    city: 'Mumbai',
    state: 'Maharashtra',
    country: 'IN',
    category_prefs: 'Fresh Fruits, Snacks & Beverages',
    brand_prefs: 'FreshFarm, Tata',
    budget_range: '5000+',
    additional_notes: 'Looking for seasonal exotic fruit hampers.',
    created_at: '2026-10-20 10:00:00'
  }
];
let nextUserId = 4;
const ordersDb = [];

/* ────────── 1. HEALTHCHECK ────────── */
app.get(['/api/health', '/health'], (req, res) => {
  res.json({
    status: 'UP',
    message: 'FreshKart REST API is active',
    platform: 'Vercel Serverless Node.js',
    timestamp: new Date().toISOString()
  });
});

/* ────────── 2. PRODUCTS API ────────── */
app.get(['/api/products', '/products'], (req, res) => {
  let results = [...productsDb];
  const { category, brand, maxPrice, search, sort } = req.query;

  if (category && category !== 'all') {
    results = results.filter(p => p.category && p.category.toLowerCase() === category.toLowerCase());
  }
  if (brand) {
    results = results.filter(p => p.brand && p.brand.toLowerCase() === brand.toLowerCase());
  }
  if (maxPrice) {
    results = results.filter(p => p.price <= parseInt(maxPrice, 10));
  }
  if (search) {
    const q = search.toLowerCase();
    results = results.filter(p =>
      (p.name && p.name.toLowerCase().includes(q)) ||
      (p.brand && p.brand.toLowerCase().includes(q)) ||
      (p.description && p.description.toLowerCase().includes(q))
    );
  }

  if (sort === 'price-asc') results.sort((a, b) => a.price - b.price);
  if (sort === 'price-desc') results.sort((a, b) => b.price - a.price);
  if (sort === 'rating') results.sort((a, b) => (b.rating || 0) - (a.rating || 0));

  res.json({ count: results.length, data: results });
});

app.get(['/api/products/:id', '/products/:id'], (req, res) => {
  const prod = productsDb.find(p => p.id === req.params.id);
  if (!prod) return res.status(404).json({ error: 'Product not found' });
  res.json(prod);
});

app.post(['/api/products', '/products'], (req, res) => {
  const newProd = {
    id: 'P0' + (productsDb.length + 1),
    name: req.body.name || 'Custom Product',
    category: req.body.category || 'Fresh Vegetables',
    brand: req.body.brand || 'Generic',
    price: Number(req.body.price) || 0,
    originalPrice: Number(req.body.price) * 1.15 || 0,
    discount: 13,
    rating: 5.0,
    reviews: 0,
    stock: Number(req.body.stock) || 10,
    image: req.body.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&auto=format&fit=crop&q=80',
    description: req.body.description || ''
  };
  productsDb.unshift(newProd);
  res.status(201).json({ message: 'Product published', product: newProd });
});

/* ────────── 3. ORDERS API ────────── */
app.get(['/api/orders', '/orders'], (req, res) => {
  res.json(ordersDb);
});

app.post(['/api/orders', '/orders'], (req, res) => {
  const order = {
    id: 'ORD-' + Math.floor(100000 + Math.random() * 900000),
    items: req.body.items || [],
    shipping: req.body.shipping || {},
    total: req.body.total || 0,
    status: 'Confirmed',
    createdAt: new Date().toISOString()
  };
  ordersDb.unshift(order);
  res.status(201).json({ message: 'Order created', order });
});

/* ────────── 4. AI SHOPPING ASSISTANT ────────── */
app.post(['/api/ai/chat', '/ai/chat'], (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: 'Message query is required' });

  const q = message.toLowerCase();
  let suggestions = [];

  if (q.includes('veggie') || q.includes('vegetable') || q.includes('tomato') || q.includes('onion') || q.includes('potato') || q.includes('spinach')) {
    suggestions = productsDb.filter(p => p.category === 'Fresh Vegetables');
  } else if (q.includes('fruit') || q.includes('mango') || q.includes('apple') || q.includes('avocado') || q.includes('banana')) {
    suggestions = productsDb.filter(p => p.category === 'Fresh Fruits');
  } else if (q.includes('milk') || q.includes('dairy') || q.includes('paneer') || q.includes('butter') || q.includes('curd') || q.includes('egg')) {
    suggestions = productsDb.filter(p => p.category === 'Dairy & Breakfast');
  } else if (q.includes('staple') || q.includes('atta') || q.includes('rice') || q.includes('dal') || q.includes('oil')) {
    suggestions = productsDb.filter(p => p.category === 'Staples & Grains');
  } else if (q.includes('tea') || q.includes('coffee') || q.includes('snack') || q.includes('oat') || q.includes('juice')) {
    suggestions = productsDb.filter(p => p.category === 'Snacks & Beverages');
  } else if (q.includes('clean') || q.includes('detergent') || q.includes('surf') || q.includes('vim') || q.includes('dettol') || q.includes('daily')) {
    suggestions = productsDb.filter(p => p.category === 'Daily Needs');
  } else {
    suggestions = productsDb.slice(0, 4);
  }

  res.json({
    reply: `FreshKart Personal Assistant evaluated your query for "${message}". Found ${suggestions.length} top matching products with high satisfaction ratings:`,
    recommendations: suggestions
  });
});

/* ────────── 5. USER REGISTRATION API (Vercel & PHP Compatibility) ────────── */
const handleRegister = (req, res) => {
  const b = req.body || {};
  const fullName = (b.fullName || b.full_name || b.name || '').trim();
  const email = (b.email || '').trim();
  const phone = (b.phone || '').trim();

  // Basic validation
  if (!fullName) {
    return res.status(400).json({ success: false, errors: ['Full name is required.'] });
  }
  if (!email || !email.includes('@')) {
    return res.status(400).json({ success: false, errors: ['A valid email address is required.'] });
  }

  const categoryPrefs = b['categoryPrefs[]'] || b.categoryPrefs || b.category_prefs || '';
  const brandPrefs = b['brandPrefs[]'] || b.brandPrefs || b.brand_prefs || '';

  const newUser = {
    id: nextUserId++,
    full_name: fullName,
    email: email,
    phone: phone,
    dob: b.dob || '',
    gender: b.gender || 'other',
    pref_time: b.prefTime || b.pref_time || '',
    address: b.address || '',
    city: b.city || '',
    state: b.state || '',
    country: b.country || 'IN',
    category_prefs: Array.isArray(categoryPrefs) ? categoryPrefs.join(', ') : categoryPrefs,
    brand_prefs: Array.isArray(brandPrefs) ? brandPrefs.join(', ') : brandPrefs,
    budget_range: b.budgetRange || b.budget_range || '',
    profile_pic: b.profilePic || '',
    additional_notes: b.userNotes || b.additional_notes || b.notes || '',
    created_at: new Date().toISOString().replace('T', ' ').slice(0, 19)
  };

  usersDb.unshift(newUser);

  res.status(200).json({
    success: true,
    userId: newUser.id,
    userName: newUser.full_name,
    message: 'Account registered and saved successfully!'
  });
};

app.post(['/api/register', '/php-module/process.php'], handleRegister);

/* ────────── 6. ADMIN USER RECORDS API (Vercel & PHP Compatibility) ────────── */
const handleRecords = (req, res) => {
  const search = (req.query.search || '').toLowerCase();
  let records = [...usersDb];

  if (search) {
    records = records.filter(u =>
      (u.full_name && u.full_name.toLowerCase().includes(search)) ||
      (u.email && u.email.toLowerCase().includes(search)) ||
      (u.city && u.city.toLowerCase().includes(search)) ||
      (u.phone && u.phone.includes(search))
    );
  }

  res.json({
    success: true,
    count: records.length,
    records: records
  });
};

app.get(['/api/records', '/php-module/records.php'], handleRecords);

/* ────────── 7. URL ANALYZER API (Vercel & PHP Compatibility) ────────── */
const handleAnalyzeUrl = async (req, res) => {
  const rawUrl = (req.query.url || req.body?.url || '').trim();

  if (!rawUrl) {
    return res.json({
      success: false,
      message: 'Please provide a valid URL to analyze.'
    });
  }

  let urlWithProto = rawUrl;
  if (!/^https?:\/\//i.test(urlWithProto)) {
    urlWithProto = 'https://' + urlWithProto;
  }

  try {
    const parsed = new URL(urlWithProto);
    const startTime = Date.now();
    let html = '';
    let statusCode = 200;
    let contentType = 'text/html';

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);

      const resp = await fetch(parsed.href, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) FreshKart-Analyzer/2.0'
        }
      });
      clearTimeout(timeout);
      statusCode = resp.status;
      contentType = resp.headers.get('content-type') || 'text/html';
      html = await resp.text();
    } catch (fetchErr) {
      // Remote site might be unreachable or timed out; continue with URL parsing
      console.warn('URL scraper fetch notice:', fetchErr.message);
    }

    const responseTime = ((Date.now() - startTime) / 1000).toFixed(2);

    // Metadata extraction
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const ogTitleMatch = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i) ||
                         html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:title["']/i);
    const ogDescMatch = html.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i) ||
                        html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:description["']/i);
    const metaDescMatch = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i) ||
                          html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i);
    const ogImageMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ||
                         html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
    const ogSiteName = html.match(/<meta[^>]+property=["']og:site_name["'][^>]+content=["']([^"']+)["']/i);

    const h1Matches = [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)]
      .map(m => m[1].replace(/<[^>]+>/g, '').trim())
      .filter(Boolean)
      .slice(0, 5);

    const h2Matches = [...html.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/gi)]
      .map(m => m[1].replace(/<[^>]+>/g, '').trim())
      .filter(Boolean)
      .slice(0, 8);

    const imgMatches = [...html.matchAll(/<img[^>]+src=["']([^"']+)["'][^>]*>/gi)]
      .map(m => m[1])
      .filter(s => s && !s.startsWith('data:'))
      .slice(0, 10);

    const queryParams = {};
    parsed.searchParams.forEach((val, key) => { queryParams[key] = val; });

    res.json({
      success: true,
      url: parsed.href,
      httpCode: statusCode,
      contentType: contentType,
      responseTime: responseTime + 's',
      parsed: {
        scheme: parsed.protocol.replace(':', ''),
        host: parsed.hostname,
        port: parsed.port || (parsed.protocol === 'https:' ? 443 : 80),
        path: parsed.pathname || '/',
        query: parsed.search.replace(/^\?/, ''),
        queryParams: queryParams,
        hash: parsed.hash.replace(/^#/, '')
      },
      meta: {
        title: titleMatch ? titleMatch[1].trim() : parsed.hostname,
        description: ogDescMatch ? ogDescMatch[1] : (metaDescMatch ? metaDescMatch[1] : `Webpage located at ${parsed.hostname}`),
        ogTitle: ogTitleMatch ? ogTitleMatch[1] : '',
        ogDescription: ogDescMatch ? ogDescMatch[1] : '',
        ogImage: ogImageMatch ? ogImageMatch[1] : '',
        ogSiteName: ogSiteName ? ogSiteName[1] : parsed.hostname
      },
      structure: {
        h1: h1Matches,
        h2: h2Matches,
        headingsCount: h1Matches.length + h2Matches.length
      },
      assets: {
        images: imgMatches,
        imagesCount: imgMatches.length
      }
    });
  } catch (err) {
    res.json({
      success: false,
      message: 'Invalid URL syntax or unable to analyze: ' + err.message
    });
  }
};

app.get(['/api/analyze-url', '/php-module/analyze-url.php'], handleAnalyzeUrl);
app.post(['/api/analyze-url', '/php-module/analyze-url.php'], handleAnalyzeUrl);

/* ────────── 8. ROOT & STATIC PAGE ROUTES (Prevents "Cannot GET /") ────────── */
// Serve static frontend assets if requests are routed to Express
app.use(express.static(process.cwd()));
app.use(express.static(path.join(__dirname, '..')));

// Explicit handler for homepage / and index.html
app.get(['/', '/index.html'], (req, res) => {
  const rootIndex = path.join(process.cwd(), 'index.html');
  if (fs.existsSync(rootIndex)) {
    return res.sendFile(rootIndex);
  }
  const parentIndex = path.join(__dirname, '..', 'index.html');
  if (fs.existsSync(parentIndex)) {
    return res.sendFile(parentIndex);
  }
  res.sendFile(path.resolve('index.html'));
});

// Explicit handler for HTML pages (e.g., /products, /cart, /checkout)
app.get('/:page', (req, res, next) => {
  const page = req.params.page;
  if (!page || page.startsWith('api')) return next();
  const htmlFile = page.endsWith('.html') ? page : `${page}.html`;
  const rootPath = path.join(process.cwd(), htmlFile);
  if (fs.existsSync(rootPath)) {
    return res.sendFile(rootPath);
  }
  const parentPath = path.join(__dirname, '..', htmlFile);
  if (fs.existsSync(parentPath)) {
    return res.sendFile(parentPath);
  }
  next();
});

// API Root info
app.get('/api', (req, res) => {
  res.json({
    name: 'FreshKart REST API',
    version: '1.0.0',
    platform: 'Vercel Serverless Function',
    endpoints: [
      'GET /api/health',
      'GET /api/products',
      'GET /api/products/:id',
      'POST /api/products',
      'GET /api/orders',
      'POST /api/orders',
      'POST /api/ai/chat',
      'POST /api/register',
      'GET /api/records',
      'GET /api/analyze-url'
    ]
  });
});

// Export Express app for Vercel Serverless Function
module.exports = app;

// Allow running standalone locally
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🛍️ FreshKart API running at http://localhost:${PORT}`);
  });
}
