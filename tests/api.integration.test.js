const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const app = require('../server');
const db = require('../db');

const api = request(app);

test.after(async () => {
  await new Promise((resolve, reject) => {
    db.end((err) => (err ? reject(err) : resolve()));
  });
});

test('GET / serves the main app', async () => {
  const res = await api.get('/');
  assert.equal(res.status, 200);
  assert.match(res.text, /Control de Ventas/i);
});

test('GET /api/productos returns a JSON array', async () => {
  const res = await api.get('/api/productos');
  assert.equal(res.status, 200);
  assert.equal(res.type, 'application/json');
  assert.ok(Array.isArray(res.body));
});

test('POST /api/clientes validates required nombre', async () => {
  const res = await api
    .post('/api/clientes')
    .send({ nombre: '', correo: 'qa@example.com' });

  assert.equal(res.status, 400);
  assert.equal(res.type, 'application/json');
  assert.ok(res.body.error);
});

test('POST /api/ventas rejects empty detalles', async () => {
  const res = await api
    .post('/api/ventas')
    .send({ cliente_id: 1, metodo_pago: 'Efectivo', estado: 'Completada', detalles: [] });

  assert.equal(res.status, 400);
  assert.equal(res.type, 'application/json');
  assert.match(String(res.body.error || ''), /agregar al menos un producto/i);
});
