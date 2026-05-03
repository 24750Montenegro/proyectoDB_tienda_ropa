# Proyecto 2 - WearGT

Aplicacion web para gestionar inventario, ventas y reportes de una tienda de ropa. Incluye base de datos PostgreSQL, backend Express y frontend React, todo levantado con Docker Compose.

## Requisitos

- Docker y Docker Compose
- Git

## Levantar el proyecto

```bash
cp .env.example .env
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
├── backend/                       # API REST Express
├── frontend/                      # SPA React con Vite
├── docker-compose.yml
├── tienda_ropa.sql                # DDL e indices
├── tienda_ropa_datos.sql          # Datos de prueba
├── tienda_ropa_vistas.sql         # Vistas para reportes
├── tienda_ropa_procedimientos.sql # Procedimientos transaccionales
├── tienda_ropa_usuarios.sql       # Usuarios seed
└── .env.example
```

## Funcionalidades

- Login/logout con JWT.
- Rutas protegidas en productos, categorias, ventas, reportes y usuarios.
- CRUD completo de productos y categorias.
- Registro de ventas con transaccion explicita en backend (`BEGIN`, `COMMIT`, `ROLLBACK`).
- Reportes visibles en la UI con JOIN, subqueries, GROUP BY, HAVING, CTE y VIEW.
- Exportacion CSV desde reportes.
- Modo claro y oscuro.

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
