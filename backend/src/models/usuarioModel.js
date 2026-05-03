const pool = require('../config/db');

async function crear({ nombre_usuario, password_hash, rol, id_empleado }) {
  const { rows } = await pool.query(
    `INSERT INTO usuario (nombre_usuario, password_hash, rol, id_empleado)
     VALUES ($1, $2, COALESCE($3::rol_enum, 'VENDEDOR'), $4)
     RETURNING id_usuario, nombre_usuario, rol, id_empleado, created_at`,
    [nombre_usuario, password_hash, rol ?? null, id_empleado ?? null]
  );
  return rows[0];
}

async function buscarPorNombre(nombre_usuario) {
  const { rows } = await pool.query(
    `SELECT id_usuario, nombre_usuario, password_hash, rol, id_empleado
       FROM usuario WHERE nombre_usuario = $1`,
    [nombre_usuario]
  );
  return rows[0] || null;
}

module.exports = { crear, buscarPorNombre };
