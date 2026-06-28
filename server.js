const http = require('http');
const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';
const PUBLIC_DIR = __dirname;
const DB_PATH = path.join(__dirname, 'orders.db');

const OWNER_NAME = 'Rahul Dash';
const OWNER_PHONE = '8328892646';
const OWNER_EMAIL = 'theprogrammer503@gmail.com';
const OWNER_UPI_NUMBER = '9938764309';

let products = [
  {
    id: 'sample-1',
    name: 'Smartwatch Pro',
    price: 6999,
    description: 'Elegant fitness tracker with AMOLED display.',
    category: 'Electronics',
    badge: 'Trending',
    image: 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500"><rect width="800" height="500" fill="#eef5ff"/><rect x="220" y="120" width="360" height="260" rx="28" fill="white" stroke="#1f6fff" stroke-width="10"/><rect x="296" y="168" width="208" height="140" rx="24" fill="#dbeeff"/><circle cx="400" cy="240" r="46" fill="#1f6fff"/><path d="M354 240h92" stroke="white" stroke-width="12" stroke-linecap="round"/><path d="M400 194v92" stroke="white" stroke-width="12" stroke-linecap="round"/></svg>')
  },
  {
    id: 'sample-2',
    name: 'Noise Cancelling Headphones',
    price: 4999,
    description: 'Immersive sound for work and travel.',
    category: 'Electronics',
    badge: 'Quick sale',
    image: 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500"><rect width="800" height="500" fill="#f5f9ff"/><rect x="220" y="180" width="360" height="140" rx="70" fill="#ffffff" stroke="#1f6fff" stroke-width="10"/><rect x="280" y="210" width="120" height="88" rx="40" fill="#dbeeff"/><rect x="400" y="210" width="120" height="88" rx="40" fill="#dbeeff"/><rect x="268" y="160" width="264" height="40" rx="20" fill="#1f6fff"/></svg>')
  },
  {
    id: 'sample-3',
    name: 'Campus Backpack',
    price: 2499,
    description: 'Minimal and spacious for daily campus life.',
    category: 'Study essentials',
    badge: 'Campus favorite',
    image: 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500"><rect width="800" height="500" fill="#f6fbff"/><rect x="220" y="140" width="360" height="220" rx="36" fill="#ffffff" stroke="#1f6fff" stroke-width="10"/><rect x="268" y="112" width="264" height="58" rx="24" fill="#dbeeff"/><rect x="292" y="200" width="216" height="92" rx="20" fill="#eef6ff"/></svg>')
  }
];

const categories = ['Electronics', 'Study essentials', 'Books & notes', 'Hostel essentials', 'Clothing & sports'];

const db = new Database(DB_PATH);
db.exec(`
  CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    customerName TEXT NOT NULL,
    customerPhone TEXT NOT NULL,
    customerAddress TEXT NOT NULL,
    items TEXT NOT NULL,
    totalAmount REAL NOT NULL,
    createdAt TEXT NOT NULL,
    ownerName TEXT NOT NULL,
    ownerPhone TEXT NOT NULL,
    ownerEmail TEXT NOT NULL
  )
`);

function loadOrders() {
  return db.prepare('SELECT * FROM orders ORDER BY createdAt DESC').all().map((row) => ({
    ...row,
    items: JSON.parse(row.items)
  }));
}

function saveOrder(order) {
  db.prepare(`
    INSERT INTO orders (id, customerName, customerPhone, customerAddress, items, totalAmount, createdAt, ownerName, ownerPhone, ownerEmail)
    VALUES (@id, @customerName, @customerPhone, @customerAddress, @items, @totalAmount, @createdAt, @ownerName, @ownerPhone, @ownerEmail)
  `).run({
    ...order,
    items: JSON.stringify(order.items)
  });
}

let orders = loadOrders();

function createServer() {
  return http.createServer((req, res) => {
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

    if (req.method === 'GET' && url.pathname === '/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok', service: 'buylappysales' }));
      return;
    }

    if (req.method === 'GET' && url.pathname === '/api/products') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ products }));
      return;
    }

    if (req.method === 'GET' && url.pathname === '/api/categories') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ categories }));
      return;
    }

    if (req.method === 'GET' && url.pathname === '/api/orders') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ orders }));
      return;
    }

    if (req.method === 'POST' && url.pathname === '/api/orders') {
      let body = '';
      req.on('data', (chunk) => {
        body += chunk;
      });
      req.on('end', () => {
        try {
          const payload = JSON.parse(body || '{}');
          const order = {
            id: `order-${Date.now()}`,
            customerName: payload.customerName || 'Anonymous',
            customerPhone: payload.customerPhone || '',
            customerAddress: payload.customerAddress || '',
            items: Array.isArray(payload.items) ? payload.items : [],
            totalAmount: Number(payload.totalAmount) || 0,
            createdAt: new Date().toISOString(),
            ownerName: OWNER_NAME,
            ownerPhone: OWNER_PHONE,
            ownerEmail: OWNER_EMAIL
          };
          saveOrder(order);
          orders = loadOrders();
          res.writeHead(201, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ order }));
        } catch (error) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Invalid JSON body' }));
        }
      });
      return;
    }

    if (req.method === 'GET' && url.pathname === '/api/payment') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        paymentHint: 'Pay via UPI to the seller number on the checkout screen.',
        upiNumber: OWNER_UPI_NUMBER,
        ownerName: OWNER_NAME,
        ownerPhone: OWNER_PHONE,
        ownerEmail: OWNER_EMAIL
      }));
      return;
    }

    if (req.method === 'POST' && url.pathname === '/api/products') {
      let body = '';
      req.on('data', (chunk) => {
        body += chunk;
      });
      req.on('end', () => {
        try {
          const payload = JSON.parse(body || '{}');
          const product = {
            id: `product-${Date.now()}`,
            name: payload.name || 'Untitled product',
            price: Number(payload.price) || 0,
            description: payload.description || '',
            category: payload.category || 'Electronics',
            badge: payload.badge || 'Fresh listing',
            image: payload.image || ''
          };
          products = [product, ...products];
          res.writeHead(201, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ product }));
        } catch (error) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Invalid JSON body' }));
        }
      });
      return;
    }

    const filePath = path.join(PUBLIC_DIR, url.pathname === '/' ? 'index.html' : url.pathname);
    const ext = path.extname(filePath);

    fs.readFile(filePath, (error, content) => {
      if (error) {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Not found');
        return;
      }

      const contentType = {
        '.html': 'text/html; charset=utf-8',
        '.css': 'text/css; charset=utf-8',
        '.js': 'application/javascript; charset=utf-8',
        '.json': 'application/json; charset=utf-8',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.svg': 'image/svg+xml'
      }[ext] || 'application/octet-stream';

      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    });
  });
}

if (require.main === module) {
  const server = createServer();
  server.listen(PORT, HOST, () => {
    console.log(`Buylappysales service running on http://${HOST}:${PORT}`);
  });
}

module.exports = { createServer, PORT };
