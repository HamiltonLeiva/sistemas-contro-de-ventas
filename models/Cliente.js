// models/Cliente.js
// Clase Cliente para el Sistema de Control de Ventas
// Encapsula la información del cliente y validación de correo.

class Cliente {
    /**
     * @param {number|null} id 
     * @param {string} nombre 
     * @param {string} correo 
     * @param {string} telefono 
     * @param {string} direccion 
     */
    constructor({ id = null, nombre, correo = '', telefono = '', direccion = '' }) {
        this.id = id;
        this.nombre = (nombre || '').trim();
        this.correo = (correo || '').trim();
        this.telefono = (telefono || '').trim();
        this.direccion = (direccion || '').trim();
    }

    /**
     * Valida que los datos obligatorios estén presentes.
     * @returns {boolean}
     */
    isValid() {
        const nombreOk = typeof this.nombre === 'string' && this.nombre.trim() !== '';
        const correoOk = this.correo === '' || this.isValidEmail(this.correo);
        return nombreOk && correoOk;
    }

    /**
     * Valida el formato de un correo electrónico.
     * @param {string} email 
     * @returns {boolean}
     */
    isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    /**
     * Conversión a objeto plano para persistencia o respuesta API.
     * @returns {Object}
     */
    toJSON() {
        return {
            id: this.id,
            nombre: this.nombre,
            correo: this.correo,
            telefono: this.telefono,
            direccion: this.direccion
        };
    }
}

module.exports = Cliente;
