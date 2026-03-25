// server.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const herramientaController = require('./controllers/herramientaController');

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Rutas
app.get('/herramientas', herramientaController.getAll);
app.post('/herramientas', herramientaController.create);
app.put('/herramientas/:id', herramientaController.update);
app.delete('/herramientas/:id', herramientaController.remove);

// Iniciar servidor
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});

module.exports = app;