-- Procedimientos almacenados - Tienda de Ropa
-- Contienen la logica transaccional que el backend invoca con CALL.

-- Registra una venta de forma atomica:
--   1. Crea cabecera de venta
--   2. Inserta cada detalle, valida stock y descuenta inventario
--   3. Registra el movimiento de inventario por cada producto
--   4. Calcula y actualiza el total
-- Si algun paso falla (stock insuficiente, producto inexistente, etc.)
-- se lanza una excepcion y la transaccion del backend hace ROLLBACK.
CREATE OR REPLACE PROCEDURE sp_registrar_venta(
  p_id_cliente   INT,
  p_id_empleado  INT,
  p_metodo_pago  metodo_pago_enum,
  p_items        JSONB,
  INOUT p_id_venta INT DEFAULT NULL
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_item        JSONB;
  v_id_producto INT;
  v_cantidad    INT;
  v_precio      DECIMAL(10,2);
  v_stock       INT;
  v_total       DECIMAL(12,2) := 0;
BEGIN
  IF p_items IS NULL OR jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'La venta debe incluir al menos un producto';
  END IF;

  INSERT INTO venta (id_cliente, id_empleado, metodo_pago, total, estado)
  VALUES (p_id_cliente, p_id_empleado, p_metodo_pago, 0, 'PAGADA')
  RETURNING id_venta INTO p_id_venta;

  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_id_producto := (v_item->>'id_producto')::INT;
    v_cantidad    := (v_item->>'cantidad')::INT;

    IF v_cantidad IS NULL OR v_cantidad <= 0 THEN
      RAISE EXCEPTION 'Cantidad invalida para producto %', v_id_producto;
    END IF;

    SELECT precio_venta, stock_actual
      INTO v_precio, v_stock
      FROM producto
      WHERE id_producto = v_id_producto
      FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Producto % no existe', v_id_producto;
    END IF;

    IF v_stock < v_cantidad THEN
      RAISE EXCEPTION 'Stock insuficiente para producto % (disponible: %, requerido: %)',
        v_id_producto, v_stock, v_cantidad;
    END IF;

    INSERT INTO detalle_venta (id_venta, id_producto, cantidad, precio_unitario)
    VALUES (p_id_venta, v_id_producto, v_cantidad, v_precio);

    UPDATE producto
       SET stock_actual = stock_actual - v_cantidad
     WHERE id_producto = v_id_producto;

    INSERT INTO movimiento_inventario (id_producto, tipo, cantidad, motivo, referencia_doc)
    VALUES (v_id_producto, 'SALIDA', -v_cantidad, 'Venta a cliente', 'VENTA-' || p_id_venta);

    v_total := v_total + (v_precio * v_cantidad);
  END LOOP;

  UPDATE venta SET total = v_total WHERE id_venta = p_id_venta;
END;
$$;

-- Registra una recepcion de compra de forma atomica:
--   1. Crea cabecera de compra
--   2. Inserta cada detalle y suma stock al producto
--   3. Registra el movimiento de inventario tipo ENTRADA
CREATE OR REPLACE PROCEDURE sp_registrar_compra(
  p_id_proveedor   INT,
  p_id_empleado    INT,
  p_numero_factura VARCHAR,
  p_items          JSONB,
  INOUT p_id_compra INT DEFAULT NULL
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_item        JSONB;
  v_id_producto INT;
  v_cantidad    INT;
  v_precio      DECIMAL(10,2);
  v_total       DECIMAL(12,2) := 0;
BEGIN
  IF p_items IS NULL OR jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'La compra debe incluir al menos un producto';
  END IF;

  INSERT INTO compra (id_proveedor, id_empleado, numero_factura, total, estado)
  VALUES (p_id_proveedor, p_id_empleado, p_numero_factura, 0, 'RECIBIDA')
  RETURNING id_compra INTO p_id_compra;

  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_id_producto := (v_item->>'id_producto')::INT;
    v_cantidad    := (v_item->>'cantidad')::INT;
    v_precio      := (v_item->>'precio_unitario')::DECIMAL(10,2);

    IF v_cantidad IS NULL OR v_cantidad <= 0 THEN
      RAISE EXCEPTION 'Cantidad invalida para producto %', v_id_producto;
    END IF;

    IF v_precio IS NULL OR v_precio < 0 THEN
      RAISE EXCEPTION 'Precio invalido para producto %', v_id_producto;
    END IF;

    PERFORM 1 FROM producto WHERE id_producto = v_id_producto;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'Producto % no existe', v_id_producto;
    END IF;

    INSERT INTO detalle_compra (id_compra, id_producto, cantidad, precio_unitario)
    VALUES (p_id_compra, v_id_producto, v_cantidad, v_precio);

    UPDATE producto
       SET stock_actual = stock_actual + v_cantidad
     WHERE id_producto = v_id_producto;

    INSERT INTO movimiento_inventario (id_producto, tipo, cantidad, motivo, referencia_doc)
    VALUES (v_id_producto, 'ENTRADA', v_cantidad, 'Recepcion de compra', 'COMPRA-' || p_id_compra);

    v_total := v_total + (v_precio * v_cantidad);
  END LOOP;

  UPDATE compra SET total = v_total WHERE id_compra = p_id_compra;
END;
$$;
