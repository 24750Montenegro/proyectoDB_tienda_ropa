const pool = require('../config/db');

async function listarTodas() {
  const { rows } = await pool.query(
    'SELECT id_categoria, nombre, descripcion, updated_at FROM categoria ORDER BY nombre'
  );
  return rows;
}

async function obtenerPorId(id) {
  const { rows } = await pool.query(
    'SELECT id_categoria, nombre, descripcion, updated_at FROM categoria WHERE id_categoria = $1',
    [id]
  );
  return rows[0] || null;
}

module.exports = { listarTodas, obtenerPorId };
