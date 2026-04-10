const mysql = require('mysql2');
require('dotenv').config();

const connectionUri =
  process.env.MYSQL_URL ||
  process.env.DATABASE_URL ||
  process.env.DATABASE_PRIVATE_URL ||
  '';

const poolConfig = connectionUri
  ? connectionUri
  : {
      host: process.env.MYSQLHOST || process.env.DB_HOST || 'localhost',
      port: Number(process.env.MYSQLPORT || process.env.DB_PORT || 3306),
      user: process.env.MYSQLUSER || process.env.DB_USER || 'root',
      password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD || '',
      database: process.env.MYSQLDATABASE || process.env.DB_NAME || 'control_ventas_db',
      charset: 'utf8mb4',
      waitForConnections: true,
      connectionLimit: Number(process.env.DB_POOL_LIMIT || 10),
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0
    };

const pool = mysql.createPool(poolConfig);

async function initializeSchema() {
  const connection = await pool.promise().getConnection();

  try {
    await connection.query(`
      CREATE TABLE IF NOT EXISTS clientes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(150) NOT NULL,
        correo VARCHAR(150) DEFAULT '',
        telefono VARCHAR(50) DEFAULT '',
        direccion VARCHAR(255) DEFAULT ''
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS productos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(150) NOT NULL,
        descripcion TEXT,
        categoria VARCHAR(100) DEFAULT '',
        precio DECIMAL(10,2) NOT NULL DEFAULT 0,
        stock INT NOT NULL DEFAULT 0
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS ventas (
        id INT AUTO_INCREMENT PRIMARY KEY,
        fecha DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        cliente_id INT NOT NULL,
        total DECIMAL(10,2) NOT NULL DEFAULT 0,
        metodo_pago VARCHAR(50) NOT NULL DEFAULT 'Efectivo',
        estado VARCHAR(50) NOT NULL DEFAULT 'Completada',
        INDEX idx_ventas_fecha (fecha),
        INDEX idx_ventas_cliente_id (cliente_id),
        CONSTRAINT fk_ventas_clientes
          FOREIGN KEY (cliente_id) REFERENCES clientes(id)
          ON UPDATE CASCADE
          ON DELETE RESTRICT
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS detalle_venta (
        id INT AUTO_INCREMENT PRIMARY KEY,
        venta_id INT NOT NULL,
        producto_id INT NOT NULL,
        cantidad INT NOT NULL,
        subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
        INDEX idx_detalle_venta_venta_id (venta_id),
        INDEX idx_detalle_venta_producto_id (producto_id),
        CONSTRAINT fk_detalle_venta_ventas
          FOREIGN KEY (venta_id) REFERENCES ventas(id)
          ON UPDATE CASCADE
          ON DELETE CASCADE,
        CONSTRAINT fk_detalle_venta_productos
          FOREIGN KEY (producto_id) REFERENCES productos(id)
          ON UPDATE CASCADE
          ON DELETE RESTRICT
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
  } finally {
    connection.release();
  }
}

const readyPromise = initializeSchema()
  .then(() => {
    console.log('✅ Esquema de base de datos verificado');
  })
  .catch((err) => {
    console.error('❌ Error inicializando el esquema de la base de datos:', {
      code: err.code,
      message: err.message
    });
    throw err;
  });

pool.getConnection((err, connection) => {
  if (err) {
    console.error('❌ Error conectando a MySQL:', {
      code: err.code,
      message: err.message,
      host: process.env.MYSQLHOST || process.env.DB_HOST || 'localhost',
      port: Number(process.env.MYSQLPORT || process.env.DB_PORT || 3306),
      database: process.env.MYSQLDATABASE || process.env.DB_NAME || 'control_ventas_db'
    });
    return;
  }
  console.log(`✅ Conectado a MySQL base ${connection.config.database}`);
  connection.release();
});

pool.readyPromise = readyPromise;

module.exports = pool;
