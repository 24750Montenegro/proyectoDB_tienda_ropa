-- Vistas - Tienda de Ropa
-- Alimentan reportes y pantallas de la UI desde el backend.

-- Productos en o por debajo del stock minimo
CREATE OR REPLACE VIEW v_productos_bajo_stock AS
SELECT
  p.id_producto,
  p.nombre              AS producto,
  c.nombre              AS categoria,
  p.talla,
  p.color,
  p.stock_actual,
  p.stock_minimo,
  (p.stock_minimo - p.stock_actual) AS faltante
FROM producto p
JOIN categoria c ON c.id_categoria = p.id_categoria
WHERE p.stock_actual <= p.stock_minimo;

-- Detalle plano de ventas para reporte y exportacion
CREATE OR REPLACE VIEW v_ventas_detalle_completo AS
SELECT
  v.id_venta,
  v.fecha_venta,
  v.metodo_pago,
  v.estado,
  v.total                              AS total_venta,
  cl.id_cliente,
  cl.nombre || ' ' || cl.apellido      AS cliente,
  e.id_empleado,
  e.nombre || ' ' || e.apellido        AS empleado,
  dv.id_producto,
  p.nombre                             AS producto,
  cat.nombre                           AS categoria,
  dv.cantidad,
  dv.precio_unitario,
  dv.subtotal
FROM venta v
JOIN cliente cl     ON cl.id_cliente = v.id_cliente
JOIN empleado e     ON e.id_empleado = v.id_empleado
JOIN detalle_venta dv ON dv.id_venta = v.id_venta
JOIN producto p     ON p.id_producto = dv.id_producto
JOIN categoria cat  ON cat.id_categoria = p.id_categoria;

-- Resumen de ventas por dia
CREATE OR REPLACE VIEW v_resumen_ventas_diarias AS
SELECT
  DATE(v.fecha_venta)            AS dia,
  COUNT(*)                       AS cantidad_ventas,
  SUM(v.total)                   AS total_dia,
  AVG(v.total)                   AS ticket_promedio
FROM venta v
WHERE v.estado = 'PAGADA'
GROUP BY DATE(v.fecha_venta);

-- Top productos vendidos por cantidad e ingresos
CREATE OR REPLACE VIEW v_top_productos_vendidos AS
SELECT
  p.id_producto,
  p.nombre                       AS producto,
  c.nombre                       AS categoria,
  SUM(dv.cantidad)               AS unidades_vendidas,
  SUM(dv.subtotal)               AS ingresos_totales
FROM detalle_venta dv
JOIN venta v       ON v.id_venta = dv.id_venta AND v.estado = 'PAGADA'
JOIN producto p    ON p.id_producto = dv.id_producto
JOIN categoria c   ON c.id_categoria = p.id_categoria
GROUP BY p.id_producto, p.nombre, c.nombre;

-- Ingresos agrupados por categoria
CREATE OR REPLACE VIEW v_ventas_por_categoria AS
SELECT
  c.id_categoria,
  c.nombre                       AS categoria,
  COUNT(DISTINCT v.id_venta)     AS ventas,
  SUM(dv.cantidad)               AS unidades,
  SUM(dv.subtotal)               AS ingresos
FROM categoria c
JOIN producto p       ON p.id_categoria = c.id_categoria
JOIN detalle_venta dv ON dv.id_producto = p.id_producto
JOIN venta v          ON v.id_venta = dv.id_venta AND v.estado = 'PAGADA'
GROUP BY c.id_categoria, c.nombre;

-- Valor monetario del inventario actual a costo y a venta
CREATE OR REPLACE VIEW v_inventario_valorizado AS
SELECT
  c.nombre                                    AS categoria,
  COUNT(p.id_producto)                        AS productos,
  SUM(p.stock_actual)                         AS unidades_en_stock,
  SUM(p.stock_actual * p.precio_costo)        AS valor_costo,
  SUM(p.stock_actual * p.precio_venta)        AS valor_venta
FROM producto p
JOIN categoria c ON c.id_categoria = p.id_categoria
GROUP BY c.nombre;
