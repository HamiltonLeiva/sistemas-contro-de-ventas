// server.js
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const compression = require('compression');
const herramientaController = require('./controllers/herramientaController');
const clienteController = require('./controllers/clienteController');
const productoController = require('./controllers/productoController');
const ventaController = require('./controllers/ventaController');

const app = express();

app.disable('x-powered-by');
const allowedOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);

app.use(cors(allowedOrigins.length > 0 ? { origin: allowedOrigins } : { origin: false }));
app.use(compression());
app.use(bodyParser.json());
app.use(express.static('public', {
  etag: true,
  maxAge: '5m',
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache');
      return;
    }
    res.setHeader('Cache-Control', 'public, max-age=300');
  }
}));

// --- RUTAS ---

// Herramientas (Modulo descriptivo)
app.get('/herramientas', herramientaController.getAll);
app.post('/herramientas', herramientaController.create);
app.put('/herramientas/:id', herramientaController.update);
app.delete('/herramientas/:id', herramientaController.remove);

// Clientes
app.get('/api/clientes', clienteController.getAll);
app.get('/api/clientes/:id', clienteController.getById);
app.post('/api/clientes', clienteController.create);
app.put('/api/clientes/:id', clienteController.update);
app.delete('/api/clientes/:id', clienteController.delete);

// Productos
app.get('/api/productos', productoController.getAll);
app.get('/api/productos/:id', productoController.getById);
app.post('/api/productos', productoController.create);
app.put('/api/productos/:id', productoController.update);
app.delete('/api/productos/:id', productoController.delete);

// Ventas (L�gica transaccional)
app.get('/api/ventas', ventaController.getAll);
app.get('/api/ventas/:id', ventaController.getById);
app.post('/api/ventas', ventaController.create);

// Dashboards / m�tricas
app.get('/api/stats/summary', ventaController.getSummary);
app.get('/api/stats/sales-by-day', ventaController.getSalesByDay);
app.get('/api/stats/payment-breakdown', ventaController.getPaymentBreakdown);

// Middleware de errores
app.use((err, req, res, next) => {
  console.error('Error no controlado:', err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
  });
}

module.exports = app;
