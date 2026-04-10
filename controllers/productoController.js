// controllers/productoController.js
const BaseModel = require('../models/BaseModel');
const Producto = require('../models/Producto');
const db = require('../db');

const productoModel = new BaseModel(db, 'productos');

module.exports = {
  // GET /api/productos
  async getAll(req, res) {
    try {
      const rows = await productoModel.getAll();
      res.json(rows);
    } catch (err) {
      console.error('Error getAll productos:', err);
      res.status(500).json({ error: 'Error interno' });
    }
  },

  // GET /api/productos/:id
  async getById(req, res) {
    try {
      const producto = await productoModel.getById(req.params.id);
      if (!producto) return res.status(404).json({ error: 'No encontrado' });
      res.json(producto);
    } catch (err) {
      console.error('Error getById producto:', err);
      res.status(500).json({ error: 'Error interno' });
    }
  },

  // POST /api/productos
  async create(req, res) {
    try {
      const prod = new Producto(req.body);
      if (!prod.isValid()) return res.status(400).json({ error: 'Datos inválidos' });
      const result = await productoModel.create(prod.toJSON());
      res.status(201).json({ id: result.insertId });
    } catch (err) {
      console.error('Error create producto:', err);
      res.status(500).json({ error: 'Error interno' });
    }
  },

  // PUT /api/productos/:id
  async update(req, res) {
    try {
      const prod = new Producto({ id: req.params.id, ...req.body });
      if (!prod.isValid()) return res.status(400).json({ error: 'Datos inválidos' });
      await productoModel.update(req.params.id, prod.toJSON());
      res.json({ message: 'Actualizado' });
    } catch (err) {
      console.error('Error update producto:', err);
      res.status(500).json({ error: 'Error interno' });
    }
  },

  // DELETE /api/productos/:id
  async delete(req, res) {
    try {
      await productoModel.delete(req.params.id);
      res.json({ message: 'Eliminado' });
    } catch (err) {
      console.error('Error delete producto:', err);
      res.status(500).json({ error: 'Error interno' });
    }
  }
};

