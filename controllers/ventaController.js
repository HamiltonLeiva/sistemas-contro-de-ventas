// controllers/ventaController.js
const db = require('../db');
const Venta = require('../models/Venta');
const DetalleVenta = require('../models/DetalleVenta');

module.exports = {
  // GET /api/ventas
  async getAll(req, res) {
    try {
      const [rows] = await db.promise().query(`
        SELECT v.*, c.nombre as cliente_nombre 
        FROM ventas v 
        LEFT JOIN clientes c ON v.cliente_id = c.id
        ORDER BY v.fecha DESC
      `);
      res.json(rows);
    } catch (err) {
      console.error('Error getAll ventas:', err);
      res.status(500).json({ error: 'Error al obtener ventas' });
    }
  },

  // GET /api/ventas/:id
  async getById(req, res) {
    try {
      const [venta] = await db.promise().query('SELECT * FROM ventas WHERE id = ?', [req.params.id]);
      if (venta.length === 0) return res.status(404).json({ error: 'Venta no encontrada' });

      const [detalles] = await db.promise().query(`
        SELECT d.*, p.nombre as producto_nombre 
        FROM detalle_venta d
        JOIN productos p ON d.producto_id = p.id
        WHERE d.venta_id = ?
      `, [req.params.id]);

      res.json({ ...venta[0], detalles });
    } catch (err) {
      console.error('Error getById venta:', err);
      res.status(500).json({ error: 'Error al obtener la venta' });
    }
  },

  // POST /api/ventas
  async create(req, res) {
    let connection;
    try {
      connection = await db.promise().getConnection();
      await connection.beginTransaction();

      const { cliente_id, metodo_pago = 'Efectivo', estado = 'Completada', detalles = [] } = req.body;
      if (!Array.isArray(detalles) || detalles.length === 0) {
        throw new Error('Debe agregar al menos un producto a la venta');
      }

      const cantidadesPorProducto = new Map();
      for (const item of detalles) {
        const productoId = Number(item.producto_id);
        const cantidad = Number.parseInt(item.cantidad, 10);
        if (!Number.isInteger(productoId) || productoId <= 0) {
          throw new Error('Producto inválido en el detalle de venta');
        }
        if (!Number.isInteger(cantidad) || cantidad <= 0) {
          throw new Error('Cantidad inválida en el detalle de venta');
        }
        cantidadesPorProducto.set(productoId, (cantidadesPorProducto.get(productoId) || 0) + cantidad);
      }

      // 1. Calcular total y validar stock
      let totalVenta = 0;
      const detallesProcesados = [];

      for (const [productoId, cantidadTotal] of cantidadesPorProducto.entries()) {
        const [prodRows] = await connection.query('SELECT * FROM productos WHERE id = ? FOR UPDATE', [productoId]);
        if (prodRows.length === 0) throw new Error(`Producto ${productoId} no existe`);
        const producto = prodRows[0];
        if (producto.stock < cantidadTotal) {
          throw new Error(`Stock insuficiente para ${producto.nombre}. Disponible: ${producto.stock}`);
        }

        const subtotal = producto.precio * cantidadTotal;
        totalVenta += subtotal;

        detallesProcesados.push({
          producto_id: productoId,
          cantidad: cantidadTotal,
          subtotal: subtotal
        });
      }

      // 2. Crear cabecera de venta
      const nuevaVenta = new Venta({
        cliente_id,
        total: totalVenta,
        metodo_pago,
        estado
      });

      if (!nuevaVenta.isValid()) {
        throw new Error('Datos de venta inv�lidos');
      }

      const [ventaResult] = await connection.query('INSERT INTO ventas SET ?', nuevaVenta.toJSON());
      const ventaId = ventaResult.insertId;

      // 3. Crear detalles y actualizar stock
      for (const det of detallesProcesados) {
        const lineaDetalle = new DetalleVenta({
          venta_id: ventaId,
          producto_id: det.producto_id,
          cantidad: det.cantidad,
          subtotal: det.subtotal
        });

        await connection.query('INSERT INTO detalle_venta SET ?', lineaDetalle.toJSON());
        await connection.query('UPDATE productos SET stock = stock - ? WHERE id = ?', [det.cantidad, det.producto_id]);
      }

      await connection.commit();
      res.status(201).json({ id: ventaId, total: totalVenta });

    } catch (err) {
      if (connection) {
        try {
          await connection.rollback();
        } catch (rollbackErr) {
          console.error('Error al revertir transacción:', rollbackErr.message);
        }
      }
      console.error('Error en transacci�n de venta:', err.message);
      const isValidationError = /Debe agregar al menos un producto|no existe|Stock insuficiente|Datos de venta/i.test(err.message);
      res.status(isValidationError ? 400 : 500).json({ error: err.message });
    } finally {
      if (connection) connection.release();
    }
  },

  // KPIs resumidos para dashboard
  async getSummary(req, res) {
    try {
      const [[totals]] = await db.promise().query(`
        SELECT 
          (SELECT IFNULL(SUM(total),0) FROM ventas) AS ingresos_totales,
          (SELECT COUNT(*) FROM ventas) AS total_ventas,
          (SELECT COUNT(*) FROM productos) AS total_productos,
          (SELECT COUNT(*) FROM clientes) AS total_clientes
      `);
      res.json(totals);
    } catch (err) {
      console.error('Error summary:', err);
      res.status(500).json({ error: 'Error al obtener resumen' });
    }
  },

  // Ventas por d�a (�ltimos 14 d�as)
  async getSalesByDay(req, res) {
    try {
      const [rows] = await db.promise().query(`
        SELECT DATE(fecha) AS fecha, SUM(total) AS total
        FROM ventas
        WHERE fecha >= DATE_SUB(CURDATE(), INTERVAL 14 DAY)
        GROUP BY DATE(fecha)
        ORDER BY fecha ASC
      `);
      res.json(rows);
    } catch (err) {
      console.error('Error sales by day:', err);
      res.status(500).json({ error: 'Error al obtener ventas por d�a' });
    }
  },

  // Distribuci�n por m�todo de pago
  async getPaymentBreakdown(req, res) {
    try {
      const [rows] = await db.promise().query(`
        SELECT metodo_pago, COUNT(*) AS cantidad, SUM(total) AS total
        FROM ventas
        GROUP BY metodo_pago
      `);
      res.json(rows);
    } catch (err) {
      console.error('Error payment breakdown:', err);
      res.status(500).json({ error: 'Error al obtener m�todos de pago' });
    }
  }
};
