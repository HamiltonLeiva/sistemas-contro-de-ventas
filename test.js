const mysql = require('mysql2');
const conn = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'ferreteria_db'
});

conn.connect(err => {
  if (err) console.error('❌ Error:', err);
  else console.log('✅ Conexión OK');
  conn.end();
});