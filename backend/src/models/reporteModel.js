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

async function clientesPorCategoria(nombreCategoria) {
  const { rows } = await pool.query(
    `SELECT cl.id_cliente, cl.nombre, cl.apellido, cl.email, cl.telefono
       FROM cliente cl
      WHERE cl.id_cliente IN (
        SELECT v.id_cliente
          FROM venta v
          JOIN detalle_venta dv ON dv.id_venta = v.id_venta
          JOIN producto p       ON p.id_producto = dv.id_producto
          JOIN categoria c      ON c.id_categoria = p.id_categoria
         WHERE c.nombre = $1
      )
      ORDER BY cl.apellido, cl.nombre`,
    [nombreCategoria]
  );
  return rows;
}

async function productosSobrePromedioCategoria() {
  const { rows } = await pool.query(
    `SELECT p.id_producto, p.nombre, p.precio_venta, c.nombre AS categoria
       FROM producto p
       JOIN categoria c ON c.id_categoria = p.id_categoria
      WHERE p.precio_venta > (
        SELECT AVG(p2.precio_venta)
          FROM producto p2
         WHERE p2.id_categoria = p.id_categoria
      )
      ORDER BY c.nombre, p.precio_venta DESC`
  );
  return rows;
}

module.exports = {
  productosBajoStock,
  topProductosVendidos,
  clientesPorCategoria,
  productosSobrePromedioCategoria,
};
