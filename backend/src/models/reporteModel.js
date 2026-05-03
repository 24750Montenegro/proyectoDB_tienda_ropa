const pool = require('../config/db');

async function productosBajoStock() {
  const { rows } = await pool.query('SELECT * FROM v_productos_bajo_stock ORDER BY faltante DESC');
  return rows;
}

async function topProductosVendidos(limite = 10) {
  const { rows } = await pool.query(
    'SELECT * FROM v_top_productos_vendidos ORDER BY ingresos_totales DESC LIMIT $1',
    [limite]
  );
  return rows;
}

module.exports = { productosBajoStock, topProductosVendidos };
