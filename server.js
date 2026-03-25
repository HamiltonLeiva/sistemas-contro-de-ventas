const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./db');

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// OBTENER todas las herramientas
app.get('/herramientas', (req, res) => {
  db.query('SELECT * FROM herramientas', (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error en el servidor');
    }
    res.json(results);
  });
});

// CREAR una nueva herramienta
app.post('/herramientas', (req, res) => {
  const { nombre, precio, marca, stock } = req.body;
  const sql = 'INSERT INTO herramientas (nombre, precio, marca, stock) VALUES (?, ?, ?, ?)';
  db.query(sql, [nombre, precio, marca, stock], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error al insertar');
    }
    res.status(201).json({ id: result.insertId, ...req.body });
  });
});

// ACTUALIZAR una herramienta
app.put('/herramientas/:id', (req, res) => {
  const { id } = req.params;
  const { nombre, precio, marca, stock } = req.body;
  const sql = 'UPDATE herramientas SET nombre=?, precio=?, marca=?, stock=? WHERE id=?';
  db.query(sql, [nombre, precio, marca, stock, id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error al actualizar');
    }
    if (result.affectedRows === 0) {
      return res.status(404).send('Herramienta no encontrada');
    }
    res.json({ message: 'Herramienta actualizada' });
  });
});

// ELIMINAR una herramienta
app.delete('/herramientas/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM herramientas WHERE id=?';
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error al eliminar');
    }
    if (result.affectedRows === 0) {
      return res.status(404).send('Herramienta no encontrada');
    }
    res.json({ message: 'Herramienta eliminada' });
  });
});

// INICIAR SERVIDOR
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});