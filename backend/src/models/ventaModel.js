const pool = require('../config/db');

async function registrar({ id_cliente, id_empleado, metodo_pago, items }) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows } = await client.query(
      'CALL sp_registrar_venta($1, $2, $3, $4::jsonb, NULL)',
      [id_cliente, id_empleado, metodo_pago, JSON.stringify(items)]
    );
    await client.query('COMMIT');
    return rows[0].p_id_venta;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function listarTodas() {
  const { rows } = await pool.query(
    `SELECT v.id_venta, v.fecha_venta, v.total, v.metodo_pago, v.estado,
            cl.id_cliente,
            cl.nombre || ' ' || cl.apellido AS cliente,
            e.id_empleado,
            e.nombre || ' ' || e.apellido AS empleado
       FROM venta v
       JOIN cliente cl  ON cl.id_cliente = v.id_cliente
       JOIN empleado e  ON e.id_empleado = v.id_empleado
       ORDER BY v.fecha_venta DESC`
  );
  return rows;
}

module.exports = { registrar, listarTodas };
