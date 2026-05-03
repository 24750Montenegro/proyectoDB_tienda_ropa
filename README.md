# Proyecto 2 — Tienda de Ropa

Base de datos PostgreSQL para una tienda de ropa, contenedorizada con Docker.

## Estructura

```
.
├── docker-compose.yml
├── tienda_ropa.sql                  # DDL + indices
├── tienda_ropa_datos.sql            # Datos de prueba
├── tienda_ropa_vistas.sql           # Vistas para reportes y UI
├── tienda_ropa_procedimientos.sql   # Procedimientos transaccionales
├── tienda_ropa_consultas.sql        # Consultas de referencia (no se carga)
├── .env.example
└── .env                             # No se versiona
```

Al levantar el contenedor por primera vez, PostgreSQL ejecuta en orden:
`01_schema.sql`, `02_datos.sql`, `03_vistas.sql`, `04_procedimientos.sql`.
El archivo `tienda_ropa_consultas.sql` es solo referencia para el backend.

## Levantar la base

```bash
cp .env.example .env
docker compose up -d
```

La primera vez, PostgreSQL ejecuta `tienda_ropa.sql` y `tienda_ropa_datos.sql` automáticamente.

## Conectarse

```bash
docker compose exec db psql -U proy2 -d tienda_ropa
```

Contraseña: `secret`.

## Reiniciar desde cero

```bash
docker compose down -v
docker compose up -d
```

## Credenciales

| Variable      | Valor         |
|---------------|---------------|
| `DB_USER`     | `proy2`       |
| `DB_PASSWORD` | `secret`      |
| `DB_NAME`     | `tienda_ropa` |
| `DB_PORT`     | `5432`        |
