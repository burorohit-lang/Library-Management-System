const { test } = require('node:test');
const assert = require('node:assert/strict');
const { once } = require('node:events');
const app = require('../index');
const { hashPassword, verifyPassword, readToken, createToken } = require('../src/services/auth');

test('password hashes verify only the original password', async () => {
  const hash = await hashPassword('a secure password');
  assert.equal(await verifyPassword('a secure password', hash), true);
  assert.equal(await verifyPassword('a different password', hash), false);
});

test('signed tokens reject tampering and expire', () => {
  process.env.JWT_SECRET = 'test-secret-with-more-than-32-characters';
  const token = createToken({ id: 'user-id', email: 'admin@example.com', name: 'Admin', role: 'admin' });
  assert.equal(readToken(token).role, 'admin');
  assert.equal(readToken(`${token}x`), null);
});

test('health endpoint responds and book routes reject missing authentication', async (t) => {
  const server = app.listen(0);
  await once(server, 'listening');
  t.after(() => new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  }));
  const { port } = server.address();

  const health = await fetch(`http://127.0.0.1:${port}/api/health`);
  assert.equal(health.status, 200);
  assert.equal((await health.json()).status, 'ok');

  const books = await fetch(`http://127.0.0.1:${port}/api/books`);
  assert.equal(books.status, 401);
});
