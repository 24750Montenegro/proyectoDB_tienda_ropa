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

async function crear({ nombre, descripcion }) {
  const { rows } = await pool.query(
    `INSERT INTO categoria (nombre, descripcion)
     VALUES ($1, $2)
     RETURNING id_categoria, nombre, descripcion, updated_at`,
    [nombre, descripcion ?? null]
  );
  return rows[0];
}

module.exports = { listarTodas, obtenerPorId, crear };
