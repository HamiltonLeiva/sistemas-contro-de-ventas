// models/DetalleVenta.js
// Clase DetalleVenta para el Sistema de Control de Ventas
// Representa cada una de las líneas de una venta.

class DetalleVenta {
    /**
     * @param {number|null} id 
     * @param {number} venta_id 
     * @param {number} producto_id 
     * @param {number} cantidad 
     * @param {number} subtotal 
     */
    constructor({ id = null, venta_id, producto_id, cantidad, subtotal = 0 }) {
        this.id = id;
        this.venta_id = venta_id;
        this.producto_id = producto_id;
        this.cantidad = parseInt(cantidad);
        this.subtotal = parseFloat(subtotal);
    }

    /**
     * Valida que los datos sean correctos.
     * @returns {boolean}
     */
    isValid() {
        return (
            this.venta_id !== undefined && 
            this.producto_id !== undefined && 
            !isNaN(this.cantidad) && 
            this.cantidad > 0 && 
            !isNaN(this.subtotal)
        );
    }

    /**
     * Conversión a objeto plano.
     * @returns {Object}
     */
    toJSON() {
        return {
            id: this.id,
            venta_id: this.venta_id,
            producto_id: this.producto_id,
            cantidad: this.cantidad,
            subtotal: this.subtotal
        };
    }
}

module.exports = DetalleVenta;
