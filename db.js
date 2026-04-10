const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.MYSQLHOST,        // ← Railway inyecta "mysql.railway.internal"
  port: Number(process.env.MYSQLPORT) || 3306,  // ← Railway inyecta "3306"
  user: process.env.MYSQLUSER,        // ← Railway inyecta "root"
  password: process.env.MYSQLPASSWORD, // ← Railway inyecta "YwpELDmyVhsJIiBaqjCGftVETzVopdkd"
  database: process.env.MYSQLDATABASE, // ← Railway inyecta "railway"
  charset: 'utf8mb4',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

pool.getConnection((err, connection) => {
  if (err) {
    console.error('❌ Error conectando a MySQL:', err.message);
    return;
  }
  console.log(`✅ Conectado a MySQL base ${connection.config.database}`);
  connection.release();
});

module.exports = pool;
