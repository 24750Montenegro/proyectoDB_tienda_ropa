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

module.exports = { listarTodos };
