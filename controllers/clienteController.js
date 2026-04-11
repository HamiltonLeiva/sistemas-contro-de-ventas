// controllers/clienteController.js
const BaseModel = require('../models/BaseModel');
const Cliente = require('../models/Cliente');
const db = require('../db');

const clienteModel = new BaseModel(db, 'clientes');

module.exports = {
  // GET /api/clientes
  async getAll(req, res) {
    try {
      const rows = await clienteModel.getAll();
      res.json(rows);
    } catch (err) {
      console.error('Error getAll clientes:', err);
      res.status(500).json({ error: 'Error interno' });
    }
  },

  // GET /api/clientes/:id
  async getById(req, res) {
    try {
      const cliente = await clienteModel.getById(req.params.id);
      if (!cliente) return res.status(404).json({ error: 'No encontrado' });
      res.json(cliente);
    } catch (err) {
      console.error('Error getById cliente:', err);
      res.status(500).json({ error: 'Error interno' });
    }
  },

  // POST /api/clientes
  async create(req, res) {
    try {
      const cli = new Cliente(req.body);
      if (!cli.isValid()) return res.status(400).json({ error: 'Datos invalidos' });
      const result = await clienteModel.create(cli.toJSON());
      res.status(201).json({ id: result.insertId });
    } catch (err) {
      console.error('Error create cliente:', err);
      res.status(500).json({ error: 'Error interno' });
    }
  },

  // PUT /api/clientes/:id
  async update(req, res) {
    try {
      const cli = new Cliente({ id: req.params.id, ...req.body });
      if (!cli.isValid()) return res.status(400).json({ error: 'Datos invalidos' });
      await clienteModel.update(req.params.id, cli.toJSON());
      res.json({ message: 'Actualizado' });
    } catch (err) {
      console.error('Error update cliente:', err);
      res.status(500).json({ error: 'Error interno' });
    }
  },

  // DELETE /api/clientes/:id
  async delete(req, res) {
    try {
      await clienteModel.delete(req.params.id);
      res.json({ message: 'Eliminado' });
    } catch (err) {
      console.error('Error delete cliente:', err);
      res.status(500).json({ error: 'Error interno' });
    }
  }
};

