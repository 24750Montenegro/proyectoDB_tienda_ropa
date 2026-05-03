const pool = require('../config/db');

async function listarTodas() {
  const { rows } = await pool.query(
    'SELECT id_categoria, nombre, descripcion, updated_at FROM categoria ORDER BY nombre'
  );
  return rows;
}

module.exports = { listarTodas };
