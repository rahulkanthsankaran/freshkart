/* ── products.js: Product catalog, search, filter, sort, AJAX loader, product card factory ── */
'use strict';

/* ────────── Product Data (inline, also fetched via AJAX) ────────── */
const PRODUCTS = [
  /* ── 🥦 Fresh Vegetables ── */
  { id:'P001', name:'Farm Fresh Hybrid Tomatoes (1 kg)', category:'Fresh Vegetables', brand:'FreshFarm', price:38, originalPrice:50, discount:24, rating:4.8, reviews:5410, stock:120, badge:'hot', image:'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80', description:'Plump, juicy, firm hybrid tomatoes fresh from local farms. Ideal for gravies, curries, and fresh salads.' },
  { id:'P002', name:'Farm Fresh Red Onions (1 kg)', category:'Fresh Vegetables', brand:'FreshFarm', price:35, originalPrice:45, discount:22, rating:4.7, reviews:6200, stock:150, badge:'hot', image:'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=600&auto=format&fit=crop&q=80', description:'Pungent, crispy, high-quality red onions with thin skin. Essential staple for everyday Indian cooking.' },
  { id:'P003', name:'Fresh New Crop Potatoes (1 kg)', category:'Fresh Vegetables', brand:'FreshFarm', price:32, originalPrice:42, discount:24, rating:4.8, reviews:7100, stock:180, badge:'', image:'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=600&auto=format&fit=crop&q=80', description:'Smooth-skinned fresh harvesting potatoes, perfect for boiling, roasting, curries, and crispy french fries.' },
  { id:'P004', name:'Fresh Green Capsicum / Bell Pepper (500g)', category:'Fresh Vegetables', brand:'FreshFarm', price:45, originalPrice:65, discount:31, rating:4.6, reviews:2340, stock:75, badge:'', image:'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=600&auto=format&fit=crop&q=80', description:'Crunchy, thick-walled green bell peppers rich in Vitamin C. Great for stir-fries, pizza toppings, and noodles.' },
  { id:'P005', name:'Fresh Hydroponic Spinach / Palak (2 Bunches)', category:'Fresh Vegetables', brand:'FreshFarm', price:29, originalPrice:45, discount:36, rating:4.8, reviews:3120, stock:60, badge:'new', image:'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=600&auto=format&fit=crop&q=80', description:'Tender, washed green spinach leaves packed with iron and minerals. Perfect for Palak Paneer and healthy smoothies.' },
  { id:'P006', name:'Farm Fresh Orange Carrots (500g)', category:'Fresh Vegetables', brand:'FreshFarm', price:36, originalPrice:50, discount:28, rating:4.7, reviews:1890, stock:90, badge:'', image:'https://images.unsplash.com/photo-1598170845058-32b9d6a5c317?w=600&auto=format&fit=crop&q=80', description:'Sweet and crisp farm carrots packed with beta-carotene. Delicious raw, steamed, or in traditional halwa.' },
  { id:'P007', name:'Tender Green Broccoli (1 pc, ~400g)', category:'Fresh Vegetables', brand:'FreshFarm', price:68, originalPrice:95, discount:28, rating:4.6, reviews:1420, stock:45, badge:'', image:'https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?w=600&auto=format&fit=crop&q=80', description:'Crisp, deep green florets loaded with antioxidants. Ideal for pastas, healthy steamed bowls, and soups.' },
  { id:'P008', name:'Fresh Button Mushrooms (200g Pack)', category:'Fresh Vegetables', brand:'FreshFarm', price:52, originalPrice:75, discount:31, rating:4.7, reviews:2980, stock:65, badge:'hot', image:'https://images.unsplash.com/photo-1504544750208-dc0358e63f7f?w=600&auto=format&fit=crop&q=80', description:'Clean, white, tender button mushrooms packaged hygienically. Excellent for mushroom masala, pizza, and soups.' },
  { id:'P009', name:'Fresh Cauliflower / Gobi (1 pc, ~600g)', category:'Fresh Vegetables', brand:'FreshFarm', price:34, originalPrice:48, discount:29, rating:4.5, reviews:1650, stock:55, badge:'', image:'https://images.unsplash.com/photo-1568584711075-3d021a7c3ca3?w=600&auto=format&fit=crop&q=80', description:'Fresh, compact white curd with green outer leaves. Clean, pesticide-tested for delicious Gobi Aloo and Manchurian.' },
  { id:'P010', name:'Coriander Leaves (100g) + Spicy Green Chillies (100g) Combo', category:'Fresh Vegetables', brand:'FreshFarm', price:25, originalPrice:38, discount:34, rating:4.8, reviews:8400, stock:200, badge:'hot', image:'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600&auto=format&fit=crop&q=80', description:'Fragrant fresh aromatic coriander leaves and pungent spicy green chillies. The indispensable Indian tadka combo.' },
  { id:'P011', name:'Fresh Ginger (250g) + Fresh Garlic (250g) Duo', category:'Fresh Vegetables', brand:'FreshFarm', price:58, originalPrice:85, discount:32, rating:4.7, reviews:3910, stock:110, badge:'', image:'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=600&auto=format&fit=crop&q=80', description:'Fresh washed aromatic ginger roots and plump, peeled-ready garlic bulbs. Pure natural immunity boosters.' },
  { id:'P012', name:'Fresh Green English Cucumber (500g)', category:'Fresh Vegetables', brand:'FreshFarm', price:28, originalPrice:40, discount:30, rating:4.6, reviews:2100, stock:80, badge:'', image:'https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?w=600&auto=format&fit=crop&q=80', description:'Crisp, seedless, hydrating English cucumbers. Perfect for raita, healthy lunchtime salads, and cold juices.' },

  /* ── 🍎 Fresh Fruits ── */
  { id:'P013', name:'Royal Ratnagiri Alphonso Mangoes (1 Dozen Box)', category:'Fresh Fruits', brand:'FreshFarm', price:1499, originalPrice:1999, discount:25, rating:4.9, reviews:4820, stock:40, badge:'hot', image:'https://images.unsplash.com/photo-1553279768-865429fa0078?w=600&auto=format&fit=crop&q=80', description:'Authentic GI-tagged Ratnagiri Alphonso mangoes, carbide-free natural ripening, heavenly sweet aroma and pulp.' },
  { id:'P014', name:'Organic Hass Avocados (Pack of 4, ~800g)', category:'Fresh Fruits', brand:'FreshFarm', price:349, originalPrice:499, discount:30, rating:4.8, reviews:3410, stock:65, badge:'hot', image:'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=600&auto=format&fit=crop&q=80', description:'Buttery, nutty, nutrient-dense imported Hass avocados. High in heart-healthy monounsaturated fats.' },
  { id:'P015', name:'Shimla Royal Delicious Apples (1 kg, 4-5 pcs)', category:'Fresh Fruits', brand:'FreshFarm', price:189, originalPrice:240, discount:21, rating:4.7, reviews:4120, stock:95, badge:'new', image:'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=600&auto=format&fit=crop&q=80', description:'Crisp, sweet, hand-graded red apples directly from Himachal orchards. Rich in dietary fiber and Vitamin C.' },
  { id:'P016', name:'Robusta Fresh Yellow Bananas (1 Dozen / ~1.2 kg)', category:'Fresh Fruits', brand:'FreshFarm', price:58, originalPrice:75, discount:23, rating:4.8, reviews:9200, stock:160, badge:'hot', image:'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=600&auto=format&fit=crop&q=80', description:'Naturally ripened golden Robusta bananas. Excellent instant energy source loaded with potassium.' },
  { id:'P017', name:'Fresh Nagpur Sweet Oranges (1 kg)', category:'Fresh Fruits', brand:'FreshFarm', price:95, originalPrice:130, discount:27, rating:4.7, reviews:2840, stock:85, badge:'', image:'https://images.unsplash.com/photo-1547514701-42782101795e?w=600&auto=format&fit=crop&q=80', description:'Juicy, easy-to-peel Nagpur Santra oranges with tangy-sweet natural juice. Excellent Vitamin C immunity.' },
  { id:'P018', name:'Premium Imported Red Globe Grapes (500g)', category:'Fresh Fruits', brand:'FreshFarm', price:145, originalPrice:195, discount:26, rating:4.8, reviews:1950, stock:50, badge:'', image:'https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=600&auto=format&fit=crop&q=80', description:'Large, firm, sweet and crunchy Red Globe grapes. Perfect for healthy fruit bowls and dessert platters.' },
  { id:'P019', name:'Ruby Red Fresh Pomegranates (Pack of 4, ~1 kg)', category:'Fresh Fruits', brand:'FreshFarm', price:210, originalPrice:275, discount:24, rating:4.8, reviews:2540, stock:60, badge:'', image:'https://images.unsplash.com/photo-1541344999736-83eca872f241?w=600&auto=format&fit=crop&q=80', description:'Deep crimson arils brimming with antioxidant-rich sweet juice. Promotes cardiovascular health.' },
  { id:'P020', name:'Farm Fresh Semi-Ripe Sweet Papaya (1 pc, ~1.2 kg)', category:'Fresh Fruits', brand:'FreshFarm', price:65, originalPrice:90, discount:28, rating:4.6, reviews:1780, stock:40, badge:'', image:'https://images.unsplash.com/photo-1517282009859-f000ec3b26fe?w=600&auto=format&fit=crop&q=80', description:'Smooth-textured orange flesh papaya rich in digestive papain enzymes and Vitamin A.' },
  { id:'P021', name:'Sweet Seedless Watermelon (1 pc, ~2.5 kg)', category:'Fresh Fruits', brand:'FreshFarm', price:89, originalPrice:125, discount:29, rating:4.7, reviews:3290, stock:70, badge:'hot', image:'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600&auto=format&fit=crop&q=80', description:'Ultra-hydrating, sweet, crisp red seedless watermelon. The ultimate summer refresher.' },
  { id:'P022', name:'Fresh Green Kiwi (Pack of 3 pcs)', category:'Fresh Fruits', brand:'FreshFarm', price:99, originalPrice:140, discount:29, rating:4.6, reviews:1210, stock:50, badge:'', image:'https://images.unsplash.com/photo-1585059895524-72359e06133a?w=600&auto=format&fit=crop&q=80', description:'Zesty, sweet-tangy green kiwi fruit loaded with Vitamin C, dietary fiber, and actinidin.' },

  /* ── 🥛 Dairy & Breakfast ── */
  { id:'P023', name:'Country Fresh Pure Cow Milk (Pack of 2 Litres)', category:'Dairy & Breakfast', brand:'Country Fresh', price:140, originalPrice:160, discount:13, rating:4.9, reviews:6800, stock:100, badge:'hot', image:'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600&auto=format&fit=crop&q=80', description:'Farm-fresh, chilled, non-homogenized single-origin A2 cow milk delivered in sterilized glass bottles.' },
  { id:'P024', name:'Amul Taaza Homogenised Toned Milk (1 Litre)', category:'Dairy & Breakfast', brand:'Amul', price:72, originalPrice:76, discount:5, rating:4.8, reviews:11200, stock:140, badge:'', image:'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=600&auto=format&fit=crop&q=80', description:'UHT-treated long-life toned milk with 3.0% fat and 8.5% SNF. No boiling needed before drinking.' },
  { id:'P025', name:'Fresh Farm Malai Paneer (200g Fresh Pack)', category:'Dairy & Breakfast', brand:'Amul', price:95, originalPrice:115, discount:17, rating:4.8, reviews:5640, stock:80, badge:'hot', image:'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600&auto=format&fit=crop&q=80', description:'Soft, creamy, melt-in-mouth cottage cheese crafted from pure cow milk. High protein vegetarian powerhouse.' },
  { id:'P026', name:'Mother Dairy Classic Dahi / Curd (400g Tub)', category:'Dairy & Breakfast', brand:'Mother Dairy', price:40, originalPrice:45, discount:11, rating:4.7, reviews:4320, stock:90, badge:'', image:'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600&auto=format&fit=crop&q=80', description:'Thick, creamy, naturally set traditional curd packed with live gut-friendly probiotic cultures.' },
  { id:'P027', name:'Amul Pasteurized Salted Butter (500g)', category:'Dairy & Breakfast', brand:'Amul', price:275, originalPrice:295, discount:7, rating:4.9, reviews:14200, stock:120, badge:'hot', image:'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=600&auto=format&fit=crop&q=80', description:'The iconic "Utterly Butterly Delicious" Amul salted yellow butter made from pure fresh cream.' },
  { id:'P028', name:'Artisan Sourdough Loaf & Farm Butter Combo', category:'Dairy & Breakfast', brand:'Urban Bakery', price:399, originalPrice:550, discount:27, rating:4.7, reviews:1290, stock:30, badge:'new', image:'https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?w=600&auto=format&fit=crop&q=80', description:'Slow-fermented artisan crusty sourdough loaf paired with 200g churned salted yellow farm butter.' },
  { id:'P029', name:'Country Brown Farm Fresh Eggs (Pack of 12)', category:'Dairy & Breakfast', brand:'Country Fresh', price:119, originalPrice:145, discount:18, rating:4.8, reviews:7850, stock:110, badge:'hot', image:'https://images.unsplash.com/photo-1506976785307-8732e854ad03?w=600&auto=format&fit=crop&q=80', description:'Antibiotic-free, farm-fresh brown eggs rich in omega-3, protein, and lutein from free-range hens.' },
  { id:'P030', name:'Amul Pure Cow Ghee Tin (1 Litre)', category:'Dairy & Breakfast', brand:'Amul', price:649, originalPrice:720, discount:10, rating:4.9, reviews:8900, stock:70, badge:'', image:'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=600&auto=format&fit=crop&q=80', description:'Traditional granular aromatic cow ghee with rich golden colour. Perfect for festive sweets and daily rotis.' },

  /* ── 🌾 Staples, Atta & Dals ── */
  { id:'P031', name:'Aashirvaad Superior MP Sharbati Atta (5 kg)', category:'Staples & Grains', brand:'Aashirvaad', price:295, originalPrice:345, discount:15, rating:4.8, reviews:15200, stock:130, badge:'hot', image:'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop&q=80', description:'100% whole wheat flour from MP Sehore golden grains. Yields ultra-soft, fluffy rotis with rich nutrition.' },
  { id:'P032', name:'Daawat Rozana Gold Basmati Rice (5 kg)', category:'Staples & Grains', brand:'Daawat', price:449, originalPrice:575, discount:22, rating:4.7, reviews:8400, stock:90, badge:'hot', image:'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop&q=80', description:'Aged aromatic basmati rice with slender long grains that don\'t stick together. Ideal for daily pulao and biryani.' },
  { id:'P033', name:'Organic Unpolished Toor Dal / Arhar Dal (1 kg)', category:'Staples & Grains', brand:'Tata Sampann', price:175, originalPrice:220, discount:20, rating:4.8, reviews:6100, stock:105, badge:'', image:'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80', description:'Unpolished toor dal retaining its natural dietary fiber and natural protein. Certified chemical-free.' },
  { id:'P034', name:'Tata Sampann Moong Dal Split (1 kg)', category:'Staples & Grains', brand:'Tata Sampann', price:155, originalPrice:195, discount:21, rating:4.7, reviews:4500, stock:80, badge:'', image:'https://images.unsplash.com/photo-1585994192701-f1a505c817ea?w=600&auto=format&fit=crop&q=80', description:'Easy to digest, rich in plant protein and iron. Quick-cooking split yellow moong dal for comforting khichdi.' },
  { id:'P035', name:'Fortune Sunlite Refined Sunflower Oil (1 Litre)', category:'Staples & Grains', brand:'Fortune', price:138, originalPrice:165, discount:16, rating:4.6, reviews:7200, stock:140, badge:'', image:'https://images.unsplash.com/photo-1620706857370-e1b9770e8bb1?w=600&auto=format&fit=crop&q=80', description:'Light, odorless refined sunflower cooking oil enriched with Vitamins A, D, and E for healthy heart.' },
  { id:'P036', name:'Figaro Extra Virgin Olive Oil (1 Litre)', category:'Staples & Grains', brand:'Figaro Organic', price:1199, originalPrice:1599, discount:25, rating:4.8, reviews:2950, stock:50, badge:'new', image:'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600&auto=format&fit=crop&q=80', description:'First cold-pressed Mediterranean extra virgin olive oil with low acidity (<0.3%) for heart-healthy cooking.' },
  { id:'P037', name:'Tata Salt Vacuum Evaporated Iodized (1 kg)', category:'Staples & Grains', brand:'Tata', price:28, originalPrice:30, discount:7, rating:4.9, reviews:21500, stock:300, badge:'', image:'https://images.unsplash.com/photo-1607672632458-9eb56696346b?w=600&auto=format&fit=crop&q=80', description:'Desh Ka Namak — pure vacuum-evaporated refined salt with optimal iodine level for daily wellness.' },
  { id:'P038', name:'24 Mantra Organic Raw Brown Sugar (1 kg)', category:'Staples & Grains', brand:'24 Mantra', price:95, originalPrice:125, discount:24, rating:4.7, reviews:3100, stock:75, badge:'', image:'https://images.unsplash.com/photo-1581441363689-1f3c3c414635?w=600&auto=format&fit=crop&q=80', description:'Unbleached organic brown demerara sugar packed with natural molasses and essential minerals.' },
  { id:'P039', name:'California Jumbo Whole Almonds & Walnuts (1kg Duo)', category:'Staples & Grains', brand:'Nutraj', price:1249, originalPrice:1799, discount:31, rating:4.8, reviews:3820, stock:80, badge:'hot', image:'https://images.unsplash.com/photo-1508061257970-f75baf96d214?w=600&auto=format&fit=crop&q=80', description:'Jumbo crunchy California almonds (500g) and premium Kashmiri walnut halves (500g) rich in omega 3.' },

  /* ── 🍪 Snacks & Beverages ── */
  { id:'P040', name:'Tata Tea Gold Leaf & Long Leaves (500g)', category:'Snacks & Beverages', brand:'Tata', price:299, originalPrice:350, discount:15, rating:4.8, reviews:9400, stock:110, badge:'hot', image:'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&auto=format&fit=crop&q=80', description:'A rich blend of Assam CTC granules and gently pressed aromatic long tea leaves for the perfect morning chai.' },
  { id:'P041', name:'Nescafe Classic 100% Pure Instant Coffee (100g Jar)', category:'Snacks & Beverages', brand:'Nescafe', price:340, originalPrice:395, discount:14, rating:4.8, reviews:8100, stock:95, badge:'', image:'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80', description:'Crafted from quality roasted Robusta coffee beans. Delivers unmistakable rich bold aroma and flavor.' },
  { id:'P042', name:'Quaker Rolled Whole Grain White Oats (1 kg)', category:'Snacks & Beverages', brand:'Quaker', price:185, originalPrice:225, discount:18, rating:4.7, reviews:5200, stock:85, badge:'', image:'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=600&auto=format&fit=crop&q=80', description:'100% whole grain rolled oats providing soluble beta-glucan fiber to support heart health and digestion.' },
  { id:'P043', name:'Tropicana 100% Real Orange Fruit Juice (1 Litre)', category:'Snacks & Beverages', brand:'Tropicana', price:135, originalPrice:160, discount:16, rating:4.6, reviews:3900, stock:70, badge:'new', image:'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=600&auto=format&fit=crop&q=80', description:'Refreshing 100% pure orange juice with no added sugar or artificial preservatives.' },
  { id:'P044', name:'Epigamia Greek Yogurt Natural Berry Trio (3 x 90g)', category:'Snacks & Beverages', brand:'Epigamia', price:149, originalPrice:180, discount:17, rating:4.7, reviews:2800, stock:60, badge:'', image:'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600&auto=format&fit=crop&q=80', description:'Thick, strained Greek yogurt layered with real strawberry and blueberry fruit compote. High protein snack.' },

  /* ── 🧼 Cleaning & Daily Needs ── */
  { id:'P045', name:'Surf Excel Matic Liquid Detergent Front Load (1 Litre)', category:'Daily Needs', brand:'Surf Excel', price:225, originalPrice:260, discount:13, rating:4.8, reviews:11400, stock:130, badge:'hot', image:'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?w=600&auto=format&fit=crop&q=80', description:'Powerful enzyme liquid detergent designed for washing machines. Removes tough stains in 1 wash without residue.' },
  { id:'P046', name:'Vim Lemon Dishwash Liquid Gel (750ml Bottle)', category:'Daily Needs', brand:'Vim', price:155, originalPrice:195, discount:21, rating:4.8, reviews:14100, stock:160, badge:'hot', image:'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80', description:'Concentrated degreasing formula with power of 100 lemons. Leaves stainless steel and glass sparkling clean.' },
  { id:'P047', name:'Dettol Original Liquid Handwash Refill Pouch (1500ml)', category:'Daily Needs', brand:'Dettol', price:219, originalPrice:279, discount:22, rating:4.9, reviews:16200, stock:140, badge:'', image:'https://images.unsplash.com/photo-1584483766114-2cea6facdf57?w=600&auto=format&fit=crop&q=80', description:'Trusted antibacterial 99.9% germ protection with moisturizing pine fragrance. Dermatologically tested.' },
  { id:'P048', name:'Colgate Total Whole Mouth Antibacterial Toothpaste (2 x 150g)', category:'Daily Needs', brand:'Colgate', price:235, originalPrice:290, discount:19, rating:4.7, reviews:8900, stock:120, badge:'', image:'https://images.unsplash.com/photo-1559591937-e103259e87f8?w=600&auto=format&fit=crop&q=80', description:'Dual-zinc and arginine antibacterial protection for teeth, tongue, cheeks, and gums for 12 hours.' },
  { id:'P049', name:'Lizol Disinfectant Surface Floor Cleaner Citrus (1 Litre)', category:'Daily Needs', brand:'Lizol', price:199, originalPrice:235, discount:15, rating:4.8, reviews:9700, stock:90, badge:'', image:'https://images.unsplash.com/photo-1585421514738-01798e348b17?w=600&auto=format&fit=crop&q=80', description:'Kills 99.9% germs and viruses while leaving long-lasting citrus fragrance and streak-free shiny floors.' },
  { id:'P050', name:'Harpic Power Plus Disinfectant Toilet Cleaner (1 Litre)', category:'Daily Needs', brand:'Harpic', price:195, originalPrice:225, discount:13, rating:4.8, reviews:12500, stock:100, badge:'', image:'https://images.unsplash.com/photo-1585421514738-01798e348b17?w=600&auto=format&fit=crop&q=80', description:'Thick disinfectant liquid formula removes yellow stains, limescale, and eliminates 99.9% toilet germs.' }
];

window.PRODUCTS = PRODUCTS;

/* ────────── Helpers ────────── */
function stars(rating) {
  const full = Math.floor(rating), half = rating % 1 >= 0.4;
  let s = '';
  for (let i = 0; i < full; i++) s += '★';
  if (half) s += '½';
  for (let i = Math.ceil(rating); i < 5; i++) s += '☆';
  return s;
}
function rupees(n) { return '₹' + Number(n).toLocaleString('en-IN'); }
function getWishlist() { return JSON.parse(localStorage.getItem('FreshKart-wishlist') || '[]'); }
function getCart()     { return JSON.parse(localStorage.getItem('FreshKart-cart')     || '[]'); }

/* ────────── Product Card HTML ────────── */
function productCardHTML(p) {
  const wl   = getWishlist().includes(p.id);
  const badge = p.badge ? `<div class="product-badge ${p.badge === 'new' ? 'new' : p.badge === 'hot' ? 'hot' : ''}">${p.badge === 'new' ? '🆕 New' : '🔥 Hot'}</div>` : '';
  return `
  <article class="product-card draggable"
    id="prod-${p.id}"
    data-product-id="${p.id}"
    data-category="${p.category}"
    data-price="${p.price}"
    data-brand="${p.brand}"
    data-rating="${p.rating}"
    data-stock="${p.stock}"
    draggable="true"
    aria-label="${p.name}">
    <div class="product-img-wrap">
      ${badge}
      <img src="${p.image}" alt="${p.name}" loading="lazy" onerror="this.src='https://picsum.photos/seed/placeholder/400/300'" />
      <button class="wishlist-btn ${wl ? 'active' : ''}" data-id="${p.id}" data-action="wishlist-toggle" aria-label="Toggle wishlist">${wl ? '❤️' : '🤍'}</button>
    </div>
    <div class="product-body">
      <div class="product-brand">${p.brand} · ${p.category}</div>
      <div class="product-name">${p.name}</div>
      <div class="product-desc">${p.description}</div>
      <div class="product-meta">
        <div class="product-pricing">
          <span class="product-price">${rupees(p.price)}</span>
          <del class="original-price" title="Original MRP">${rupees(p.originalPrice)}</del>
        </div>
        <span class="product-discount">${p.discount}% off</span>
      </div>
      <div class="flex" style="align-items:center; justify-content:space-between; margin-bottom:0.75rem;">
        <div><span class="stars">${stars(p.rating)}</span><span class="rating-count">(${p.reviews.toLocaleString()})</span></div>
        <span class="availability ${p.stock > 0 ? 'in-stock' : 'out-stock'}">${p.stock > 0 ? '✓ In Stock' : '✗ Out of Stock'}</span>
      </div>
      <div class="product-actions">
        <button class="btn-cart" data-id="${p.id}" data-action="add-to-cart">🛒 Add to Cart</button>
        <button class="btn-compare" data-id="${p.id}" data-action="add-to-compare" data-tooltip="Compare">⚖️</button>
      </div>
    </div>
    <div class="product-preview">
      <strong style="font-size:0.8rem; color:var(--text-strong);">Quick Look</strong>
      <p style="font-size:0.75rem; margin-top:0.25rem;">${p.description}</p>
      <a href="product-detail.html?id=${p.id}" style="font-size:0.78rem; color:var(--primary); font-weight:600; display:inline-block; margin-top:0.4rem;">View Full Details →</a>
    </div>
  </article>`;
}

/* ────────── Render Products ────────── */
function renderProducts(list, containerId) {
  const el = document.getElementById(containerId);
  if (!el) return;
  if (!list.length) { el.innerHTML = '<div class="empty-state"><div class="empty-icon">🔍</div><h3>No products found</h3><p>Try adjusting your search or filters.</p></div>'; return; }
  el.innerHTML = list.map(productCardHTML).join('');
  bindProductEvents(el);
}

/* ────────── Product Events (delegation) ────────── */
function bindProductEvents(container) {
  container.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const action = btn.dataset.action;
    const id     = btn.dataset.id;
    const prod   = PRODUCTS.find(p => p.id === id);
    if (!prod) return;

    if (action === 'add-to-cart') {
      addToCart(prod);
      btn.textContent = '✅ Added!';
      btn.style.background = 'var(--success)';
      setTimeout(() => { btn.textContent = '🛒 Add to Cart'; btn.style.background = ''; }, 1800);
    }
    if (action === 'wishlist-toggle') {
      toggleWishlist(id, btn.closest('.product-card'));
    }
    if (action === 'add-to-compare') {
      const compare = JSON.parse(sessionStorage.getItem('FreshKart-compare') || '[]');
      if (compare.includes(id)) { window.showToast && showToast('Already in compare list', 'info'); return; }
      if (compare.length >= 4)  { window.showToast && showToast('Compare list full (max 4)', 'warning'); return; }
      compare.push(id);
      sessionStorage.setItem('FreshKart-compare', JSON.stringify(compare));
      window.showToast && showToast(`${prod.name} added to compare`, 'success');
    }
  });

  /* Product selection highlight on click */
  container.addEventListener('click', (e) => {
    const card = e.target.closest('.product-card');
    if (!card || e.target.closest('[data-action]')) return;
    container.querySelectorAll('.product-card.selected').forEach(c => c.classList.remove('selected'));
    card.classList.toggle('selected');
  });

  /* Mouseover preview */
  container.addEventListener('mouseover', (e) => {
    const card = e.target.closest('.product-card');
    if (card) card.querySelector('.product-preview')?.style && null;
  });
}

/* ────────── Cart ────────── */
function addToCart(prod, qty = 1) {
  let cart = getCart();
  const existing = cart.find(i => i.id === prod.id);
  if (existing) { existing.qty += qty; }
  else { cart.push({ id:prod.id, name:prod.name, price:prod.price, image:prod.image, qty }); }
  localStorage.setItem('FreshKart-cart', JSON.stringify(cart));
  updateCartBadge();
  window.showToast && showToast(`${prod.name} added to cart 🛒`, 'success');
}
window.addToCart = addToCart;

function updateCartBadge() {
  const cart  = getCart();
  const total = cart.reduce((s, i) => s + i.qty, 0);
  document.querySelectorAll('#cart-count').forEach(el => el.textContent = total);
}

/* ────────── Wishlist ────────── */
function toggleWishlist(id, card) {
  let wl = getWishlist();
  const btn = card?.querySelector('[data-action="wishlist-toggle"]');
  if (wl.includes(id)) {
    wl = wl.filter(i => i !== id);
    if (btn) { btn.textContent = '🤍'; btn.classList.remove('active'); }
    window.showToast && showToast('Removed from wishlist', 'info');
  } else {
    wl.push(id);
    if (btn) { btn.textContent = '❤️'; btn.classList.add('active'); }
    window.showToast && showToast('Added to wishlist ❤️', 'success');
  }
  localStorage.setItem('FreshKart-wishlist', JSON.stringify(wl));
  updateWishlistBadge();
}
window.toggleWishlist = toggleWishlist;

function updateWishlistBadge() {
  const wl = getWishlist();
  document.querySelectorAll('#wishlist-count').forEach(el => el.textContent = wl.length);
}

/* ────────── Search & Filter (inline products page) ────────── */
let filteredProducts = [...PRODUCTS];

function applyFilters() {
  const search   = (document.getElementById('product-search')?.value || '').toLowerCase();
  const catFilter = [...(document.querySelectorAll('.filter-cat:checked'))].map(el => el.value);
  const brandFilter = [...(document.querySelectorAll('.filter-brand:checked'))].map(el => el.value);
  const maxPrice = parseInt(document.getElementById('price-range')?.value || 999999);
  const minRating = parseFloat(document.getElementById('filter-rating')?.value || 0);
  const sortBy = document.getElementById('sort-select')?.value || '';

  filteredProducts = PRODUCTS.filter(p => {
    const matchSearch = !search || p.name.toLowerCase().includes(search) || p.brand.toLowerCase().includes(search) || p.category.toLowerCase().includes(search) || p.description.toLowerCase().includes(search);
    const matchCat    = !catFilter.length   || catFilter.includes(p.category);
    const matchBrand  = !brandFilter.length || brandFilter.includes(p.brand);
    const matchPrice  = p.price <= maxPrice;
    const matchRating = p.rating >= minRating;
    return matchSearch && matchCat && matchBrand && matchPrice && matchRating;
  });

  if (sortBy === 'price-asc')  filteredProducts.sort((a,b) => a.price - b.price);
  if (sortBy === 'price-desc') filteredProducts.sort((a,b) => b.price - a.price);
  if (sortBy === 'rating')     filteredProducts.sort((a,b) => b.rating - a.rating);
  if (sortBy === 'discount')   filteredProducts.sort((a,b) => b.discount - a.discount);
  if (sortBy === 'reviews')    filteredProducts.sort((a,b) => b.reviews - a.reviews);
  if (sortBy === 'price-low')  filteredProducts.sort((a,b) => a.price - b.price);

  renderProducts(filteredProducts, 'product-grid');
  const info = document.getElementById('products-info');
  if (info) info.textContent = `${filteredProducts.length} product${filteredProducts.length !== 1 ? 's' : ''} match your selected criteria.`;
}

/* Register filter / search listeners */
['product-search','sort-select','price-range','filter-rating'].forEach(id => {
  const el = document.getElementById(id);
  if (el) el.addEventListener('input', applyFilters);
});
document.querySelectorAll('.filter-cat, .filter-brand').forEach(cb => cb.addEventListener('change', applyFilters));

/* ────────── AJAX Product Loader ────────── */
function loadAjaxProducts() {
  const container = document.getElementById('ajax-products');
  const status    = document.getElementById('ajax-status');
  const btn       = document.getElementById('ajax-load-btn');
  if (!container) return;
  if (status) status.innerHTML = '<div class="spinner"></div><div class="loading-text">Loading products via AJAX...</div>';
  if (btn) { btn.disabled = true; btn.textContent = '⏳ Loading...'; }

  $.ajax({
    url: 'data/products.json',
    method: 'GET',
    dataType: 'json',
    success: function(data) {
      if (status) status.innerHTML = `<div class="success-msg" style="margin-bottom:1rem;">✅ Successfully loaded ${data.length} products via AJAX!</div>`;
      renderProducts(data, 'ajax-products');
      if (btn) { btn.disabled = false; btn.textContent = '🔄 Reload (AJAX)'; }
    },
    error: function(xhr, status, err) {
      if (document.getElementById('ajax-status')) {
        document.getElementById('ajax-status').innerHTML =
          `<div class="error-msg" style="font-size:0.9rem; margin-bottom:1rem;">❌ Failed to load products. ${err || 'Check network connection.'} <button class="btn btn-danger btn-sm" id="ajax-retry" style="margin-left:1rem;">🔄 Retry</button></div>`;
        document.getElementById('ajax-retry')?.addEventListener('click', loadAjaxProducts);
      }
      if (btn) { btn.disabled = false; btn.textContent = '🔄 Load Products (AJAX)'; }
    }
  });
}

const ajaxBtn = document.getElementById('ajax-load-btn');
if (ajaxBtn) ajaxBtn.addEventListener('click', loadAjaxProducts);

/* ────────── Initial Render ────────── */
document.addEventListener('DOMContentLoaded', () => {
  updateCartBadge();
  updateWishlistBadge();

  /* Home page product grid */
  const homeGrid = document.getElementById('home-product-grid');
  if (homeGrid) {
    const featuredIds = ['P001', 'P002', 'P005', 'P010', 'P013', 'P014', 'P015', 'P021', 'P023', 'P025', 'P027', 'P031', 'P032', 'P040', 'P045', 'P046'];
    const getFeaturedHome = () => {
      const picks = featuredIds.map(id => PRODUCTS.find(p => p.id === id)).filter(Boolean);
      return picks.length >= 8 ? picks : PRODUCTS.slice(0, 16);
    };

    let currentHomeCat = 'all';
    const homeSearch = document.getElementById('home-search');

    const updateHomeGrid = () => {
      let list = [];
      if (currentHomeCat === 'all') {
        list = getFeaturedHome();
      } else {
        list = PRODUCTS.filter(p => p.category.toLowerCase() === currentHomeCat.toLowerCase());
      }

      const q = homeSearch ? homeSearch.value.trim().toLowerCase() : '';
      if (q) {
        list = PRODUCTS.filter(p =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
        );
      }

      renderProducts(list, 'home-product-grid');
      const info = document.getElementById('home-products-info');
      if (info) {
        if (q) {
          info.textContent = `${list.length} item${list.length !== 1 ? 's' : ''} found for "${homeSearch.value}"`;
        } else if (currentHomeCat !== 'all') {
          info.textContent = `Showing ${list.length} items in ${currentHomeCat}`;
        } else {
          info.textContent = `Showing ${list.length} top farm-fresh veggies, fruits & daily essentials (⚡ 15-Min Delivery)`;
        }
      }
    };

    updateHomeGrid();

    /* Category filter pills */
    const catFilterWrap = document.getElementById('home-cat-filter');
    if (catFilterWrap) {
      catFilterWrap.addEventListener('click', (e) => {
        const pill = e.target.closest('.cat-pill');
        if (!pill) return;
        catFilterWrap.querySelectorAll('.cat-pill').forEach(btn => btn.classList.remove('active'));
        pill.classList.add('active');
        currentHomeCat = pill.dataset.cat;
        if (homeSearch) homeSearch.value = '';
        updateHomeGrid();
      });
    }

    /* Category Department Cards click */
    document.querySelectorAll('.dept-card[data-cat]').forEach(card => {
      card.addEventListener('click', (e) => {
        e.preventDefault();
        const cat = card.dataset.cat;
        currentHomeCat = cat;
        if (catFilterWrap) {
          catFilterWrap.querySelectorAll('.cat-pill').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.cat.toLowerCase() === cat.toLowerCase());
          });
        }
        if (homeSearch) homeSearch.value = '';
        updateHomeGrid();
        const featSec = document.getElementById('featured-products');
        if (featSec) featSec.scrollIntoView({ behavior: 'smooth' });
      });
    });

    /* Home search */
    if (homeSearch) {
      homeSearch.addEventListener('input', updateHomeGrid);
    }

    /* Recommendation tabs */
    const trending = PRODUCTS.filter(p => p.badge === 'hot' || p.reviews > 2500).slice(0, 8);
    const budget   = [...PRODUCTS].sort((a,b) => a.price - b.price).slice(0, 8);
    const newest   = PRODUCTS.filter(p => p.badge === 'new').slice(0, 8);
    const toprated = [...PRODUCTS].sort((a,b) => b.rating - a.rating).slice(0, 8);
    renderProducts(trending, 'rec-trending');
    renderProducts(budget,   'rec-budget');
    renderProducts(newest,   'rec-new');
    renderProducts(toprated, 'rec-toprated');
  }

  /* Products page grid */
  const productGrid = document.getElementById('product-grid');
  if (productGrid) {
    renderProducts(PRODUCTS, 'product-grid');
    const info = document.getElementById('products-info');
    if (info) info.textContent = `${PRODUCTS.length} products match your selected criteria.`;
  }
});

