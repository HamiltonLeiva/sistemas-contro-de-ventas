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

module.exports = pool;
