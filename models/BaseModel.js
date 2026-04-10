// models/BaseModel.js
// Clase base para operaciones CRUD comunes usando mysql2

class BaseModel {
  /**
   * @param {object} dbConnection - instancia de mysql2 connection
   * @param {string} tableName - nombre de la tabla en la BD
   */
  constructor(dbConnection, tableName) {
    this.db = dbConnection;
    this.table = tableName;
  }

  // Obtener todos los registros
  getAll() {
    return new Promise((resolve, reject) => {
      this.db.query(`SELECT * FROM ${this.table}`,
        (err, results) => err ? reject(err) : resolve(results)
      );
    });
  }

  // Obtener por id
  getById(id) {
    return new Promise((resolve, reject) => {
      this.db.query(`SELECT * FROM ${this.table} WHERE id = ?`, [id],
        (err, results) => err ? reject(err) : resolve(results[0])
      );
    });
  }

  // Crear registro (objeto plain)
  create(data) {
    return new Promise((resolve, reject) => {
      this.db.query(`INSERT INTO ${this.table} SET ?`, data,
        (err, result) => err ? reject(err) : resolve({ insertId: result.insertId })
      );
    });
  }

  // Actualizar registro
  update(id, data) {
    return new Promise((resolve, reject) => {
      this.db.query(`UPDATE ${this.table} SET ? WHERE id = ?`, [data, id],
        (err, result) => err ? reject(err) : resolve(result)
      );
    });
  }

  // Eliminar registro
  delete(id) {
    return new Promise((resolve, reject) => {
      this.db.query(`DELETE FROM ${this.table} WHERE id = ?`, [id],
        (err, result) => err ? reject(err) : resolve(result)
      );
    });
  }
}

module.exports = BaseModel;
