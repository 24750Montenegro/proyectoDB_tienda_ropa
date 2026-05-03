-- Referencia de consultas que ejecutara el backend desde la app web.

-- JOIN: detalle de ventas con cliente, empleado, producto y categoria
SELECT
  v.id_venta, v.fecha_venta,
  cl.nombre || ' ' || cl.apellido AS cliente,
  e.nombre  || ' ' || e.apellido  AS empleado,
  p.nombre AS producto, c.nombre AS categoria,
  dv.cantidad, dv.precio_unitario, dv.subtotal
FROM venta v
JOIN cliente cl       ON cl.id_cliente = v.id_cliente
JOIN empleado e       ON e.id_empleado = v.id_empleado
JOIN detalle_venta dv ON dv.id_venta = v.id_venta
JOIN producto p       ON p.id_producto = dv.id_producto
JOIN categoria c      ON c.id_categoria = p.id_categoria
ORDER BY v.fecha_venta DESC;

-- JOIN: compras con proveedor, empleado y productos recibidos
SELECT
  co.id_compra, co.fecha_compra, co.numero_factura,
  pr.nombre_empresa AS proveedor,
  e.nombre || ' ' || e.apellido AS empleado,
  p.nombre AS producto,
  dc.cantidad, dc.precio_unitario, dc.subtotal
FROM compra co
JOIN proveedor pr      ON pr.id_proveedor = co.id_proveedor
JOIN empleado e        ON e.id_empleado = co.id_empleado
JOIN detalle_compra dc ON dc.id_compra = co.id_compra
JOIN producto p        ON p.id_producto = dc.id_producto
ORDER BY co.fecha_compra DESC;

-- JOIN: historial de movimientos con producto y categoria
SELECT
  m.id_movimiento, m.fecha, m.tipo, m.cantidad, m.motivo, m.referencia_doc,
  p.nombre AS producto, c.nombre AS categoria
FROM movimiento_inventario m
JOIN producto p  ON p.id_producto = m.id_producto
JOIN categoria c ON c.id_categoria = p.id_categoria
ORDER BY m.fecha DESC;

-- Subquery IN: clientes que han comprado calzado
SELECT cl.id_cliente, cl.nombre, cl.apellido, cl.email
FROM cliente cl
WHERE cl.id_cliente IN (
  SELECT v.id_cliente
  FROM venta v
  JOIN detalle_venta dv ON dv.id_venta = v.id_venta
  JOIN producto p       ON p.id_producto = dv.id_producto
  JOIN categoria c      ON c.id_categoria = p.id_categoria
  WHERE c.nombre = 'Calzado'
);

-- Subquery correlacionada: productos sobre el promedio de su categoria
SELECT p.id_producto, p.nombre, p.precio_venta, c.nombre AS categoria
FROM producto p
JOIN categoria c ON c.id_categoria = p.id_categoria
WHERE p.precio_venta > (
  SELECT AVG(p2.precio_venta)
  FROM producto p2
  WHERE p2.id_categoria = p.id_categoria
);

-- Subquery EXISTS: empleados con al menos una venta
SELECT e.id_empleado, e.nombre, e.apellido, e.puesto
FROM empleado e
WHERE EXISTS (SELECT 1 FROM venta v WHERE v.id_empleado = e.id_empleado);

-- GROUP BY + HAVING: categorias con ingresos > 1000
SELECT
  c.nombre AS categoria,
  COUNT(DISTINCT v.id_venta) AS ventas,
  SUM(dv.cantidad)           AS unidades,
  SUM(dv.subtotal)           AS ingresos,
  AVG(dv.precio_unitario)    AS precio_promedio
FROM categoria c
JOIN producto p       ON p.id_categoria = c.id_categoria
JOIN detalle_venta dv ON dv.id_producto = p.id_producto
JOIN venta v          ON v.id_venta = dv.id_venta AND v.estado = 'PAGADA'
GROUP BY c.nombre
HAVING SUM(dv.subtotal) > 1000
ORDER BY ingresos DESC;

-- GROUP BY + HAVING: empleados con mas de 3 ventas
SELECT
  e.id_empleado,
  e.nombre || ' ' || e.apellido AS empleado,
  COUNT(v.id_venta) AS total_ventas,
  SUM(v.total)      AS monto_total
FROM empleado e
JOIN venta v ON v.id_empleado = e.id_empleado
GROUP BY e.id_empleado, e.nombre, e.apellido
HAVING COUNT(v.id_venta) > 3
ORDER BY monto_total DESC;

-- CTE: top 5 productos por ingresos con porcentaje de participacion
WITH ingresos_producto AS (
  SELECT p.id_producto, p.nombre, SUM(dv.subtotal) AS ingresos
  FROM producto p
  JOIN detalle_venta dv ON dv.id_producto = p.id_producto
  JOIN venta v          ON v.id_venta = dv.id_venta AND v.estado = 'PAGADA'
  GROUP BY p.id_producto, p.nombre
),
total_general AS (SELECT SUM(ingresos) AS total FROM ingresos_producto)
SELECT
  ip.id_producto, ip.nombre, ip.ingresos,
  ROUND((ip.ingresos / tg.total) * 100, 2) AS porcentaje
FROM ingresos_producto ip
CROSS JOIN total_general tg
ORDER BY ip.ingresos DESC
LIMIT 5;

-- Transaccion: el backend abre BEGIN, llama sp_registrar_venta y hace COMMIT
-- o ROLLBACK si el procedimiento lanza excepcion.
-- BEGIN;
--   CALL sp_registrar_venta(1, 2, 'TARJETA',
--     '[{"id_producto": 1, "cantidad": 2}]'::jsonb, NULL);
-- COMMIT;
