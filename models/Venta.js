// models/Venta.js
// Clase Venta para el Sistema de Control de Ventas
// Encapsula la cabecera de una transacción comercial.

class Venta {
    static toMySQLDateTime(date = new Date()) {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        const hh = String(date.getHours()).padStart(2, '0');
        const mm = String(date.getMinutes()).padStart(2, '0');
        const ss = String(date.getSeconds()).padStart(2, '0');
        return `${y}-${m}-${d} ${hh}:${mm}:${ss}`;
    }

    /**
     * @param {number|null} id 
     * @param {string} fecha 
     * @param {number} cliente_id 
     * @param {number} total 
     * @param {string} metodo_pago 'Efectivo', 'Tarjeta', 'Transferencia'
     * @param {string} estado 'Completada', 'Pendiente', 'Cancelada'
     */
    constructor({ 
        id = null, 
        fecha,
        cliente_id, 
        total = 0, 
        metodo_pago = 'Efectivo', 
        estado = 'Completada' 
    }) {
        this.id = id;
        this.fecha = fecha ? String(fecha) : Venta.toMySQLDateTime(new Date());
        this.cliente_id = cliente_id;
        this.total = parseFloat(total);
        this.metodo_pago = metodo_pago;
        this.estado = estado;
    }

    /**
     * Valida la estructura básica de la venta.
     * @returns {boolean}
     */
    isValid() {
        return (
            this.cliente_id !== undefined && 
            !isNaN(this.total) && 
            this.total >= 0 && 
            ['Efectivo', 'Tarjeta', 'Transferencia'].includes(this.metodo_pago) &&
            ['Completada', 'Pendiente', 'Cancelada'].includes(this.estado)
        );
    }

    /**
     * Conversión a objeto plano.
     * @returns {Object}
     */
    toJSON() {
        return {
            id: this.id,
            fecha: this.fecha,
            cliente_id: this.cliente_id,
            total: this.total,
            metodo_pago: this.metodo_pago,
            estado: this.estado
        };
    }
}

module.exports = Venta;
