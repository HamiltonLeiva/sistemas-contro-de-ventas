# Sistema de Control de Ventas

Aplicacion web para gestionar ventas, clientes y productos con dashboard de metricas y control de stock en tiempo real.

## Tabla de contenido

- [Resumen](#resumen)
- [Tecnologias](#tecnologias)
- [Arquitectura del proyecto](#arquitectura-del-proyecto)
- [Requisitos previos](#requisitos-previos)
- [Instalacion](#instalacion)
- [Variables de entorno](#variables-de-entorno)
- [Ejecucion local](#ejecucion-local)
- [Scripts disponibles](#scripts-disponibles)
- [API REST](#api-rest)
- [Flujo transaccional de ventas](#flujo-transaccional-de-ventas)
- [Pruebas y QA](#pruebas-y-qa)
- [Troubleshooting](#troubleshooting)
- [Despliegue en Railway](#despliegue-en-railway)
- [Roadmap sugerido](#roadmap-sugerido)
- [Autor y licencia](#autor-y-licencia)

## Resumen

Este proyecto implementa un sistema de ventas con:

- CRUD de clientes
- CRUD de productos
- Registro de ventas con detalle de productos
- Validacion de stock antes de confirmar venta
- Actualizacion de inventario dentro de transaccion SQL
- Dashboard con:
  - ingresos totales
  - total de ventas
  - total de productos
  - total de clientes
  - ventas por dia
  - distribucion por metodo de pago

La interfaz web se sirve desde la carpeta `public/` y consume la API bajo rutas `/api/*`.

## Tecnologias

Backend:

- Node.js
- Express 5
- mysql2
- body-parser
- cors
- compression
- dotenv

Frontend:

- HTML5
- CSS3
- JavaScript (vanilla)
- Chart.js

Testing:

- node:test
- supertest
- Playwright

## Arquitectura del proyecto

```text
.
├── controllers/
│   ├── clienteController.js
│   ├── herramientaController.js
│   ├── productoController.js
│   └── ventaController.js
├── models/
│   ├── BaseModel.js
│   ├── Cliente.js
│   ├── DetalleVenta.js
│   ├── Producto.js
│   └── Venta.js
├── public/
│   ├── app.js
│   ├── index.html
│   └── styles.css
├── tests/
│   ├── api.integration.test.js
│   └── e2e/
│       └── app.e2e.spec.js
├── db.js
├── server.js
├── playwright.config.js
└── QA_CHECKLIST_PREDEPLOY.md
```

## Requisitos previos

- Node.js 18 o superior
- npm 9 o superior
- MySQL 8 o superior
- Base de datos creada (por defecto: `control_ventas_db`)

## Instalacion

1. Clonar el repositorio.
2. Instalar dependencias:

```bash
npm install
```

3. Configurar variables de entorno (ver seccion siguiente).
4. Crear tablas en MySQL (`clientes`, `productos`, `ventas`, `detalle_venta`) con sus llaves foraneas.

## Variables de entorno

Crear un archivo `.env` en la raiz del proyecto:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=control_ventas_db
CORS_ORIGIN=http://localhost:3000
```

Notas:

- `CORS_ORIGIN` acepta una o multiples URLs separadas por coma.
- Si `CORS_ORIGIN` no se define, CORS quedara bloqueado por defecto.
- La conexion MySQL soporta estas variantes de variables:
  - `MYSQL_URL` o `DATABASE_URL` o `DATABASE_PRIVATE_URL`
  - o bien `MYSQLHOST/MYSQLPORT/MYSQLUSER/MYSQLPASSWORD/MYSQLDATABASE`
  - o bien `DB_HOST/DB_PORT/DB_USER/DB_PASSWORD/DB_NAME`

## Ejecucion local

```bash
npm start
```

Servidor local:

- App web: `http://localhost:3000`
- API base: `http://localhost:3000/api`

## Scripts disponibles

```bash
npm start         # inicia servidor express
npm test          # ejecuta pruebas de API (alias de test:api)
npm run test:api  # pruebas de integracion con node:test + supertest
npm run test:e2e  # pruebas end-to-end con Playwright
npm run qa:full   # test:api + test:e2e
```

## API REST

### Clientes

- `GET /api/clientes`
- `GET /api/clientes/:id`
- `POST /api/clientes`
- `PUT /api/clientes/:id`
- `DELETE /api/clientes/:id`

Ejemplo de body para crear cliente:

```json
{
  "nombre": "Juan Perez",
  "correo": "juan@example.com",
  "telefono": "8888-8888",
  "direccion": "Managua"
}
```

### Productos

- `GET /api/productos`
- `GET /api/productos/:id`
- `POST /api/productos`
- `PUT /api/productos/:id`
- `DELETE /api/productos/:id`

Ejemplo de body para crear producto:

```json
{
  "nombre": "Teclado Mecanico",
  "descripcion": "Switches brown",
  "categoria": "Perifericos",
  "precio": 89.99,
  "stock": 30
}
```

### Ventas

- `GET /api/ventas`
- `GET /api/ventas/:id`
- `POST /api/ventas`

Ejemplo de body para crear venta:

```json
{
  "cliente_id": 1,
  "metodo_pago": "Efectivo",
  "estado": "Completada",
  "detalles": [
    { "producto_id": 2, "cantidad": 1 },
    { "producto_id": 3, "cantidad": 2 }
  ]
}
```

Respuesta esperada (201):

```json
{
  "id": 123,
  "total": 199.97
}
```

### Dashboard / Estadisticas

- `GET /api/stats/summary`
- `GET /api/stats/sales-by-day`
- `GET /api/stats/payment-breakdown`

## Flujo transaccional de ventas

En `POST /api/ventas` el sistema ejecuta una transaccion SQL para garantizar consistencia:

1. Bloquea filas de productos involucrados (`FOR UPDATE`).
2. Valida stock disponible por producto.
3. Calcula total de la venta.
4. Inserta cabecera en `ventas`.
5. Inserta lineas en `detalle_venta`.
6. Descuenta stock en `productos`.
7. Si falla cualquier paso, realiza `ROLLBACK`.

## Pruebas y QA

Pruebas API:

```bash
npm run test:api
```

Pruebas E2E:

```bash
npm run test:e2e
```

Checklist de predeploy:

- Revisar `QA_CHECKLIST_PREDEPLOY.md`

## Troubleshooting

### Error 500 en `POST /api/ventas`

Validar:

- `cliente_id` existente
- `detalles` no vacio
- `producto_id` validos
- `cantidad > 0`
- stock suficiente
- conexion a MySQL activa

### Mensaje `Web Data Assistant load: "tma_vars"`

Ese mensaje suele venir de extensiones del navegador y no del sistema.

### Error `GET /favicon.ico 404`

No afecta la logica del sistema. Si se desea, agregar `public/favicon.ico`.

## Despliegue en Railway

1. Crear dos servicios en el mismo proyecto Railway:
  - MySQL
  - Aplicacion Node.js (este repositorio)
2. En la app Node, configurar variables de entorno:
  - `PORT=8080` (o el puerto que Railway inyecte)
  - `CORS_ORIGIN=https://TU_DOMINIO_PUBLICO.railway.app`
3. Vincular credenciales de MySQL a la app usando una de estas estrategias:
  - Referenciar `MYSQL_URL` desde el servicio MySQL
  - o exponer `MYSQLHOST`, `MYSQLPORT`, `MYSQLUSER`, `MYSQLPASSWORD`, `MYSQLDATABASE`
4. Verificar en logs de deploy:
  - `Servidor corriendo en http://localhost:PUERTO`
  - `Conectado a MySQL base ...`

Si aparece `Error conectando a MySQL`, revisar:

- Que la app y MySQL esten en el mismo proyecto/environment de Railway.
- Que las variables en la app no esten vacias.
- Que no estes usando `localhost` como host en Railway (debe ser host interno del servicio MySQL o URL inyectada).

## Roadmap sugerido

- Autenticacion y roles (admin/cajero)
- Reportes exportables (CSV/PDF)
- Historial de movimientos de inventario
- Paginacion y filtros avanzados
- Docker para entorno local y despliegue

## Autor y licencia

Autor: HamiltonLeiva

Licencia: ISC
