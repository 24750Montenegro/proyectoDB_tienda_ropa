const pool = require('../config/db');

async function listarTodos() {
  const { rows } = await pool.query(
    `SELECT p.id_producto, p.id_categoria, c.nombre AS categoria,
            p.nombre, p.descripcion, p.talla, p.color, p.marca, p.genero,
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
    id_categoria, nombre, descripcion, talla, color, marca, genero,
    precio_venta, precio_costo, stock_actual, stock_minimo,
  } = datos;
  const { rows } = await pool.query(
    `INSERT INTO producto (
       id_categoria, nombre, descripcion, talla, color, marca, genero,
       precio_venta, precio_costo, stock_actual, stock_minimo
     ) VALUES ($1,$2,$3,$4,$5,$6,COALESCE($7::genero_enum,'UNISEX'),$8,$9,COALESCE($10,0),COALESCE($11,0))
     RETURNING id_producto, id_categoria, nombre, descripcion, talla, color, marca,
               genero, precio_venta, precio_costo, stock_actual, stock_minimo, updated_at`,
    [
      id_categoria, nombre, descripcion ?? null, talla ?? null, color ?? null,
      marca ?? null, genero ?? null, precio_venta, precio_costo,
      stock_actual ?? null, stock_minimo ?? null,
    ]
  );
  return rows[0];
}

module.exports = { listarTodos, obtenerPorId, crear };
