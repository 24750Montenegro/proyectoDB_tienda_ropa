const pool = require('../config/db');

async function buscar({ q = '', limite = 12 }) {
  const term = `%${q.trim()}%`;
  const { rows } = await pool.query(
    `SELECT id_cliente, dpi_nit, nombre, apellido, email, telefono, direccion
       FROM cliente
      WHERE $1 = '%%'
         OR dpi_nit ILIKE $1
         OR nombre ILIKE $1
         OR apellido ILIKE $1
         OR (nombre || ' ' || apellido) ILIKE $1
      ORDER BY
        CASE WHEN dpi_nit = 'CF' THEN 0 ELSE 1 END,
        apellido,
        nombre
      LIMIT $2`,
    [term, limite]
  );
  return rows;
}

async function obtenerPorId(id) {
  const { rows } = await pool.query(
    `SELECT id_cliente, dpi_nit, nombre, apellido, email, telefono, direccion
       FROM cliente
      WHERE id_cliente = $1`,
    [id]
  );
  return rows[0] || null;
}

async function obtenerConsumidorFinal() {
  const { rows } = await pool.query(
    `INSERT INTO cliente (dpi_nit, nombre, apellido, email, telefono, direccion)
     VALUES ('CF', 'Consumidor', 'Final', NULL, NULL, 'Venta sin datos fiscales')
     ON CONFLICT (dpi_nit) DO UPDATE
       SET nombre = EXCLUDED.nombre,
           apellido = EXCLUDED.apellido
     RETURNING id_cliente, dpi_nit, nombre, apellido, email, telefono, direccion`
  );
  return rows[0];
}

module.exports = { buscar, obtenerPorId, obtenerConsumidorFinal };
