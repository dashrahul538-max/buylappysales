const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';
const PUBLIC_DIR = __dirname;

let products = [
  {
    id: 'sample-1',
    name: 'Smartwatch Pro',
    price: 6999,
    description: 'Elegant fitness tracker with AMOLED display.',
    category: 'Electronics',
    image: 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500"><rect width="800" height="500" fill="#eef5ff"/><rect x="220" y="120" width="360" height="260" rx="28" fill="white" stroke="#1f6fff" stroke-width="10"/><rect x="296" y="168" width="208" height="140" rx="24" fill="#dbeeff"/><circle cx="400" cy="240" r="46" fill="#1f6fff"/><path d="M354 240h92" stroke="white" stroke-width="12" stroke-linecap="round"/><path d="M400 194v92" stroke="white" stroke-width="12" stroke-linecap="round"/></svg>')
  },
  {
    id: 'sample-2',
    name: 'Noise Cancelling Headphones',
    price: 4999,
    description: 'Immersive sound for work and travel.',
    category: 'Electronics',
    image: 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500"><rect width="800" height="500" fill="#f5f9ff"/><rect x="220" y="180" width="360" height="140" rx="70" fill="#ffffff" stroke="#1f6fff" stroke-width="10"/><rect x="280" y="210" width="120" height="88" rx="40" fill="#dbeeff"/><rect x="400" y="210" width="120" height="88" rx="40" fill="#dbeeff"/><rect x="268" y="160" width="264" height="40" rx="20" fill="#1f6fff"/></svg>')
  }
];

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
