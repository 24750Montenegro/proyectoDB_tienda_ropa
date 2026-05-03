const pool = require('../config/db');

async function productosBajoStock() {
  const { rows } = await pool.query('SELECT * FROM v_productos_bajo_stock ORDER BY faltante DESC');
  return rows;
}

module.exports = { productosBajoStock };
