const test = require('node:test');
const assert = require('node:assert/strict');
const { createServer } = require('../server');

test('health endpoint returns service status', async () => {
  const server = createServer();
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  try {
    const response = await makeRequest(server, '/health');
    assert.equal(response.statusCode, 200);
    assert.deepEqual(JSON.parse(response.body), { status: 'ok', service: 'buylappysales' });
  } finally {
    await closeServer(server);
  }
});

test('products API returns seed data and accepts new products', async () => {
  const server = createServer();
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  try {
    const initial = await makeRequest(server, '/api/products');
    assert.equal(initial.statusCode, 200);
    const payload = JSON.parse(initial.body);
    assert.ok(Array.isArray(payload.products));
    assert.ok(payload.products.length > 0);

    const created = await makeRequest(server, '/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Portable SSD',
        price: 7999,
        description: 'Fast external storage',
        category: 'Electronics',
        image: 'data:image/png;base64,abc123'
      })
    });

    assert.equal(created.statusCode, 201);
    const createdBody = JSON.parse(created.body);
    assert.equal(createdBody.product.name, 'Portable SSD');

    const refreshed = await makeRequest(server, '/api/products');
    const refreshedBody = JSON.parse(refreshed.body);
    assert.ok(refreshedBody.products.some((item) => item.name === 'Portable SSD'));
  } finally {
    await closeServer(server);
  }
});

function makeRequest(server, path, options = {}) {
  const address = server.address();
  const port = address && address.port ? address.port : 0;

  return new Promise((resolve, reject) => {
    const req = require('http').request({
      hostname: '127.0.0.1',
      port,
      path,
      method: options.method || 'GET',
      headers: options.headers || {}
    }, (res) => {
      let body = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        resolve({ statusCode: res.statusCode, body });
      });
    });

    req.on('error', reject);
    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
}

function closeServer(server) {
  return new Promise((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error);
        return;
      }
      resolve();
    });
  });
}
