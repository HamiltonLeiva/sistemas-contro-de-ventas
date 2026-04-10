// models/Producto.js
// Clase Producto para el Sistema de Control de Ventas
// Representa la entidad de productos con lógica de validación básica.

class Producto {
    /**
     * @param {number|null} id 
     * @param {string} nombre 
     * @param {string} descripcion 
     * @param {string} categoria 
     * @param {number} precio 
     * @param {number} stock 
     */
    constructor({ id = null, nombre, descripcion = '', categoria = '', precio, stock }) {
        this.id = id;
        this.nombre = (nombre || '').trim();
        this.descripcion = (descripcion || '').trim();
        this.categoria = (categoria || '').trim();
        this.precio = parseFloat(precio);
        this.stock = parseInt(stock);
    }

    /**
     * Valida que los campos obligatorios estén presentes y sean válidos.
     * @returns {boolean}
     */
    isValid() {
        const nombreOk = typeof this.nombre === 'string' && this.nombre.trim() !== '';
        const precioOk = !isNaN(this.precio) && this.precio >= 0;
        const stockOk = Number.isInteger(this.stock) && this.stock >= 0;
        return nombreOk && precioOk && stockOk;
    }

    /**
     * Convierte la instancia a un objeto plano para persistencia o respuesta API.
     * @returns {Object}
     */
    toJSON() {
        return {
            id: this.id,
            nombre: this.nombre,
            descripcion: this.descripcion,
            categoria: this.categoria,
            precio: this.precio,
            stock: this.stock
        };
    }
}

module.exports = Producto;
