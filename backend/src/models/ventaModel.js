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

module.exports = { registrar };
