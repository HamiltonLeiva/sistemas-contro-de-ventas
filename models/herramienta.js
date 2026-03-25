class Herramienta {
    constructor(id, nombre, precio, marca, stock) {
        this.id = id;
        this.nombre = nombre;
        this.precio = precio;
        this.marca = marca;
        this.stock = stock;
    }

 // Método para validar que los datos sean correctos
  isValid() {
    return this.nombre && this.precio !== undefined && this.stock !== undefined;
  }

    // Método para convertir a objeto plano (útil para respuestas JSON)
  toJSON() {
    return {
      id: this.id,
      nombre: this.nombre,
      precio: this.precio,
      marca: this.marca,
      stock: this.stock
    };
  }
}

module.exports = Herramienta;
