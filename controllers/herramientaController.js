// controllers/herramientaController.js

const db = require('../db');
const Herramienta = require('../models/herramienta');

// Obtener todas las herramientas
const getAll = (req, res) => {
  db.query('SELECT * FROM herramientas', (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Error en el servidor' });
    }
    // Convertimos cada fila a un objeto Herramienta
    const herramientas = results.map(row => new  Herramienta(row.id, row.nombre, row.precio, row.marca, row.stock));
    res.json(herramientas.map(h => h.toJSON()));
  });
};

// Crear una nueva herramienta
const create = (req, res) => {
  const { nombre, precio, marca, stock } = req.body;
  const nueva = new Herramienta(null, nombre, precio, marca, stock);
  
  if (!nueva.isValid()) {
    return res.status(400).json({ error: 'Datos incompletos' });
  }

  const sql = 'INSERT INTO herramientas (nombre, precio, marca, stock) VALUES (?, ?, ?, ?)';
  db.query(sql, [nueva.nombre, nueva.precio, nueva.marca, nueva.stock], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Error al insertar' });
    }
    // Asignamos el ID generado y devolvemos el objeto completo
    nueva.id = result.insertId;
    res.status(201).json(nueva.toJSON());
  });
};

// Actualizar una herramienta
const update = (req, res) => {
  const { id } = req.params;
  const { nombre, precio, marca, stock } = req.body;
  const herramienta = new Herramienta(id, nombre, precio, marca, stock);
  
  if (!herramienta.isValid()) {
    return res.status(400).json({ error: 'Datos incompletos' });
  }

  const sql = 'UPDATE herramientas SET nombre=?, precio=?, marca=?, stock=? WHERE id=?';
  db.query(sql, [herramienta.nombre, herramienta.precio, herramienta.marca, herramienta.stock, id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Error al actualizar' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Herramienta no encontrada' });
    }
    res.json({ message: 'Herramienta actualizada', herramienta: herramienta.toJSON() });
  });
};

// Eliminar una herramienta
const remove = (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM herramientas WHERE id=?';
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Error al eliminar' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Herramienta no encontrada' });
    }
    res.json({ message: 'Herramienta eliminada' });
  });
};

module.exports = { getAll, create, update, remove };