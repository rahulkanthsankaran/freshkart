/**
 * FreshKart - Local Full-Stack Node.js & Express REST API Server
 * Uses the unified API router in /api/index.js and serves static frontend assets.
 */

const express = require('express');
const path = require('path');
const apiApp = require('../api/index');

const PORT = process.env.PORT || 5000;

// Serve frontend static assets for local standalone running
apiApp.use(express.static(path.join(__dirname, '..')));

// Serve index.html for root
apiApp.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// Start Server
apiApp.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`🛍️  FreshKart Full-Stack Server running on port ${PORT}`);
  console.log(`🌐  Local URL: http://localhost:${PORT}`);
  console.log(`📡  REST API:  http://localhost:${PORT}/api/products`);
  console.log(`🚀  Vercel Serverless Ready (/api/index.js)`);
  console.log(`===============================================`);
});
