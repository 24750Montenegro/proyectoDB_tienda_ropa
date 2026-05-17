# Proyecto 2 - WearGT

Aplicacion web para gestionar inventario, ventas y reportes de una tienda de ropa. Incluye base de datos PostgreSQL, backend Express y frontend React, todo levantado con Docker Compose.

## Requisitos

- Docker y Docker Compose
- Git

## Levantar el proyecto

Linux / macOS:

```bash
cp .env.example .env
docker compose up
```

Windows (PowerShell):

```powershell
Copy-Item .env.example .env
docker compose up
```

Windows (CMD):

```cmd
copy .env.example .env
docker compose up
```

Servicios:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3000/api`
- PostgreSQL: `localhost:5432`

Usuarios seed creados automaticamente al levantar Docker por primera vez:

| Usuario | Contrasena | Rol |
|---------|------------|-----|
| `admin` | `admin123` | `ADMIN` |
| `vendedor` | `vendedor123` | `VENDEDOR` |

## Variables importantes

Las credenciales de base de datos son fijas para la calificacion:

| Variable | Valor |
|----------|-------|
| `DB_USER` | `proy2` |
| `DB_PASSWORD` | `secret` |
| `DB_NAME` | `tienda_ropa` |
| `DB_PORT` | `5432` |

## Estructura

```text
.
|-- backend/        # API REST Express
|-- database/       # Scripts SQL de esquema, datos, vistas y procedimientos
|-- docs/           # Documento de diseno (ER, modelo relacional, normalizacion)
|-- frontend/       # SPA React con Vite
|-- docker-compose.yml
|-- .env.example
|-- .gitignore
`-- README.md
```

El documento `docs/proyecto2_avances.pdf` contiene el diagrama entidad-relacion en notacion Chen, el diagrama relacional real y el proceso de normalizacion 1FN -> 2FN -> 3FN con su justificacion.

## Modulos de la aplicacion

La SPA esta dividida en `Productos`, `Categorias`, `Clientes`, `Usuarios`, `Ventas` y `Reportes` (acceso desde el menu lateral despues del login).

- **Productos** y **Categorias** exponen el CRUD completo (alta, edicion, eliminacion y listado) contra `/api/productos` y `/api/categorias`. Las pantallas viven en `frontend/src/pages/ProductsPage.jsx` y `CategoriesPage.jsx`.
- **Ventas** abre el formulario de registro y el listado de ventas. Al confirmar una venta el frontend hace `POST /api/ventas`, el backend abre una transaccion (`BEGIN`), invoca el procedimiento `sp_registrar_venta` y, segun el resultado, ejecuta `COMMIT` o `ROLLBACK`. La transaccion vive en `backend/src/models/ventaModel.js`. El procedimiento dispara `RAISE EXCEPTION` cuando el stock es insuficiente o cuando un producto no existe, lo que provoca el rollback y un mensaje de error visible en la UI. El detalle de cada venta (`/ventas/:id`) se arma con un join entre `venta`, `cliente`, `empleado`, `detalle_venta` y `producto`.
- **Reportes** concentra todas las consultas SQL exigidas. Cada opcion del selector dispara un endpoint y permite descargar el resultado como CSV.

## Documentación de la API REST (CRUD)

Toda la comunicación entre el frontend y el backend se realiza exclusivamente en formato JSON. Se requiere enviar el token JWT en el header `Authorization: Bearer <token>` para los endpoints protegidos.

### Productos (`/api/productos`)
- `GET /api/productos`: Retorna la lista de todos los productos.
- `GET /api/productos/:id`: Retorna el detalle de un producto específico.
- `POST /api/productos`: Crea un nuevo producto.
  - **Body (JSON)**: `{"nombre": "Camiseta", "descripcion": "Talla M", "precio": 150.00, "stock": 50, "categoria_id": 1}`
- `PUT /api/productos/:id`: Actualiza un producto existente.
  - **Body (JSON)**: `{"nombre": "Camiseta", "precio": 160.00, "stock": 45}`
- `DELETE /api/productos/:id`: Elimina un producto.

### Categorías (`/api/categorias`)
- `GET /api/categorias`: Retorna todas las categorías activas.
- `POST /api/categorias`: Crea una nueva categoría.
  - **Body (JSON)**: `{"nombre": "Deportes", "descripcion": "Ropa deportiva deportiva"}`
- `PUT /api/categorias/:id`: Actualiza una categoría.
- `DELETE /api/categorias/:id`: Elimina una categoría de la base de datos.

### Clientes (`/api/clientes`)
- `GET /api/clientes`: Retorna la lista de todos los clientes.
- `GET /api/clientes/:id`: Obtiene el detalle de un cliente específico.
- `POST /api/clientes`: Registra un nuevo cliente en el sistema.
  - **Body (JSON)**: `{"nombre": "Juan", "apellido": "Pérez", "email": "juan.perez@email.com", "telefono": "12345678"}`
- `PUT /api/clientes/:id`: Actualiza la información de un cliente.
- `DELETE /api/clientes/:id`: Elimina un cliente.

### Usuarios (`/api/usuarios`)
- `GET /api/usuarios`: Retorna todos los usuarios del sistema.
- `POST /api/usuarios`: Crea un nuevo usuario.
  - **Body (JSON)**: `{"nombre": "Admin", "username": "admin2", "password": "password123", "rol": "ADMIN"}`
- `PUT /api/usuarios/:id`: Actualiza datos de un usuario.
- `DELETE /api/usuarios/:id`: Elimina o inactiva un usuario del sistema.

### Ventas (`/api/ventas`)
- `GET /api/ventas`: Retorna el listado del historial de ventas.
- `GET /api/ventas/:id`: Retorna una venta específica junto con el detalle de productos comprados.
- `POST /api/ventas`: Registra una nueva venta ejecutando la transacción a nivel de base de datos (`sp_registrar_venta`).
  - **Body (JSON)**: `{"cliente_id": 1, "empleado_id": 2, "detalles": [{"producto_id": 3, "cantidad": 2, "precio_unitario": 150.00}]}`

### Autenticación (`/api/auth`)
- `POST /api/auth/login`: Autentica a un usuario y devuelve un token JWT.
  - **Body (JSON)**: `{"username": "admin", "password": "admin123"}`

## Reportes y consultas SQL

Estos endpoints viven en `backend/src/controllers/reporteController.js` y `backend/src/models/reporteModel.js`. Todos se consumen desde la pagina `Reportes` (`frontend/src/pages/ReportsPage.jsx`).

- `GET /api/reportes/top-productos` lee la vista `v_top_productos_vendidos`, que combina `detalle_venta`, `venta`, `producto` y `categoria` con agregaciones por producto. Se muestra en la opcion "Top productos vendidos".
- `GET /api/reportes/productos-bajo-stock` lee la vista `v_productos_bajo_stock` (join entre `producto` y `categoria` filtrado por stock). Se muestra en la opcion "Productos bajo stock".
- `GET /api/reportes/clientes-por-categoria?categoria=Calzado` usa una subquery `IN` que recorre `venta`, `detalle_venta`, `producto` y `categoria` para filtrar los clientes que han comprado en esa categoria. Es la opcion "Clientes por categoria".
- `GET /api/reportes/productos-sobre-promedio` usa una subquery correlacionada que compara cada producto con el promedio de su propia categoria. Es la opcion "Productos sobre promedio".
- `GET /api/reportes/ingresos-por-categoria?umbral=1000` agrupa con `GROUP BY` y filtra con `HAVING SUM(...) > umbral` sobre el join de `categoria`, `producto`, `detalle_venta` y `venta`. Es la opcion "Ingresos por categoria".
- `GET /api/reportes/top-productos-participacion?limite=5` esta construido con un CTE (`WITH ingresos_producto AS ... , total_general AS ...`) y calcula el porcentaje de participacion de cada producto sobre el total. Es la opcion "Participacion por producto".

Las definiciones de las vistas estan en `database/tienda_ropa_vistas.sql` y los indices con su justificacion estan al final de `database/tienda_ropa.sql` (`idx_producto_categoria`, `idx_venta_fecha`, `idx_producto_stock`, `idx_mov_producto_fecha`, `idx_venta_cliente`).

## Manejo de errores y exportacion

Los errores de la API se centralizan en `backend/src/middleware/errorHandler.js` y se renderizan en la UI con el componente `Notice` (`frontend/src/components/Notice.jsx`), que aparece tanto en validaciones de formulario como en respuestas fallidas del backend. Cada reporte tiene un boton "Exportar CSV" implementado en `frontend/src/components/CsvButton.jsx`.

## Autenticacion

El login se realiza desde `LoginPage.jsx` contra `POST /api/auth/login`. El backend firma un JWT con `JWT_SECRET` y el frontend lo guarda para anexarlo en cada peticion. Todas las rutas, excepto `/api/auth/login`, estan protegidas por el middleware `requireAuth` y por `ProtectedRoute.jsx` en el frontend.

## Comandos utiles

Conectarse a la base:

```bash
docker compose exec db psql -U proy2 -d tienda_ropa
```

Reiniciar desde cero:

```bash
docker compose down -v
docker compose up
```

Ejecutar frontend local:

```bash
cd frontend
npm install
npm run dev
```

Ejecutar backend local:

```bash
cd backend
npm install
npm run dev
```
