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

async function ingresosPorCategoria(umbral) {
  const { rows } = await pool.query(
    `SELECT c.nombre AS categoria,
            COUNT(DISTINCT v.id_venta) AS ventas,
            SUM(dv.cantidad)           AS unidades,
            SUM(dv.subtotal)           AS ingresos,
            AVG(dv.precio_unitario)    AS precio_promedio
       FROM categoria c
       JOIN producto p       ON p.id_categoria = c.id_categoria
       JOIN detalle_venta dv ON dv.id_producto = p.id_producto
       JOIN venta v          ON v.id_venta = dv.id_venta AND v.estado = 'PAGADA'
      GROUP BY c.nombre
     HAVING SUM(dv.subtotal) > $1
      ORDER BY ingresos DESC`,
    [umbral]
  );
  return rows;
}

async function topProductosConParticipacion(limite = 5) {
  const { rows } = await pool.query(
    `WITH ingresos_producto AS (
       SELECT p.id_producto, p.nombre, SUM(dv.subtotal) AS ingresos
         FROM producto p
         JOIN detalle_venta dv ON dv.id_producto = p.id_producto
         JOIN venta v          ON v.id_venta = dv.id_venta AND v.estado = 'PAGADA'
        GROUP BY p.id_producto, p.nombre
     ),
     total_general AS (SELECT SUM(ingresos) AS total FROM ingresos_producto)
     SELECT ip.id_producto, ip.nombre, ip.ingresos,
            ROUND((ip.ingresos / tg.total) * 100, 2) AS porcentaje
       FROM ingresos_producto ip
       CROSS JOIN total_general tg
      ORDER BY ip.ingresos DESC
      LIMIT $1`,
    [limite]
  );
  return rows;
}

module.exports = {
  productosBajoStock,
  topProductosVendidos,
  clientesPorCategoria,
  productosSobrePromedioCategoria,
  ingresosPorCategoria,
  topProductosConParticipacion,
};
