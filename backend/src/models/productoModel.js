const pool = require('../config/db');

async function listarTodos() {
  const { rows } = await pool.query(
    `SELECT p.id_producto, p.id_categoria, c.nombre AS categoria,
            p.nombre, p.descripcion, p.talla, p.color, p.marca, p.genero,
            p.imagen_url,
            p.precio_venta, p.precio_costo, p.stock_actual, p.stock_minimo,
            p.updated_at
       FROM producto p
       JOIN categoria c ON c.id_categoria = p.id_categoria
       ORDER BY p.nombre`
  );
  return rows;
}

async function obtenerPorId(id) {
  const { rows } = await pool.query(
    `SELECT p.id_producto, p.id_categoria, c.nombre AS categoria,
            p.nombre, p.descripcion, p.talla, p.color, p.marca, p.genero,
            p.imagen_url,
            p.precio_venta, p.precio_costo, p.stock_actual, p.stock_minimo,
            p.updated_at
       FROM producto p
       JOIN categoria c ON c.id_categoria = p.id_categoria
       WHERE p.id_producto = $1`,
    [id]
  );
  return rows[0] || null;
}

async function crear(datos) {
  const {
    id_categoria, nombre, descripcion, talla, color, marca, imagen_url, genero,
    precio_venta, precio_costo, stock_actual, stock_minimo,
  } = datos;
  const { rows } = await pool.query(
    `INSERT INTO producto (
       id_categoria, nombre, descripcion, talla, color, marca, imagen_url, genero,
       precio_venta, precio_costo, stock_actual, stock_minimo
     ) VALUES ($1,$2,$3,$4,$5,$6,$7,COALESCE($8::genero_enum,'UNISEX'),$9,$10,COALESCE($11,0),COALESCE($12,0))
     RETURNING id_producto, id_categoria, nombre, descripcion, talla, color, marca, imagen_url,
               genero, precio_venta, precio_costo, stock_actual, stock_minimo, updated_at`,
    [
      id_categoria, nombre, descripcion ?? null, talla ?? null, color ?? null,
      marca ?? null, imagen_url || null, genero ?? null, precio_venta, precio_costo,
      stock_actual ?? null, stock_minimo ?? null,
    ]
  );
  return rows[0];
}

async function actualizar(id, datos) {
  const {
    id_categoria, nombre, descripcion, talla, color, marca, imagen_url, genero,
    precio_venta, precio_costo, stock_actual, stock_minimo,
  } = datos;
  const { rows } = await pool.query(
    `UPDATE producto SET
       id_categoria = $1,
       nombre       = $2,
       descripcion  = $3,
       talla        = $4,
       color        = $5,
       marca        = $6,
       imagen_url   = $7,
       genero       = $8::genero_enum,
       precio_venta = $9,
       precio_costo = $10,
       stock_actual = $11,
       stock_minimo = $12,
       updated_at   = CURRENT_TIMESTAMP
     WHERE id_producto = $13
     RETURNING id_producto, id_categoria, nombre, descripcion, talla, color, marca, imagen_url,
               genero, precio_venta, precio_costo, stock_actual, stock_minimo, updated_at`,
    [
      id_categoria, nombre, descripcion ?? null, talla ?? null, color ?? null,
      marca ?? null, imagen_url || null, genero ?? 'UNISEX', precio_venta, precio_costo,
      stock_actual ?? 0, stock_minimo ?? 0, id,
    ]
  );
  return rows[0] || null;
}

async function eliminar(id) {
  const { rowCount } = await pool.query(
    'DELETE FROM producto WHERE id_producto = $1',
    [id]
  );
  return rowCount > 0;
}

module.exports = { listarTodos, obtenerPorId, crear, actualizar, eliminar };
