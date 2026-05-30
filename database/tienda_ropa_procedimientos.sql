-- Procedimientos transaccionales invocados desde el backend.
--
-- Notas sobre el control de transacciones en PL/pgSQL:
--
-- 1) PostgreSQL NO permite COMMIT/ROLLBACK dentro de un bloque que tiene una
--    clausula EXCEPTION (ese bloque abre una subtransaccion y daria el error
--    "cannot commit while a subtransaction is active"). Por eso el control de
--    transaccion (COMMIT/ROLLBACK explicitos) vive en el bloque externo, sin
--    manejador, y el manejo de excepciones se hace en bloques anidados que no
--    controlan la transaccion. Las validaciones que lanzan RAISE EXCEPTION sin
--    ROLLBACK explicito revierten igual: al propagarse al nivel superior (CALL)
--    la transaccion se aborta automaticamente.
--
-- 2) Un procedimiento SECURITY DEFINER (o con clausula SET, p. ej. search_path)
--    se ejecuta en contexto atomico y TAMPOCO puede usar COMMIT/ROLLBACK. Por
--    eso estos procedimientos son SECURITY INVOKER (corren con los privilegios
--    del rol que hace CALL). El backend hace SET ROLE al rol del usuario antes
--    de invocarlos, de modo que los GRANT por tabla y EXECUTE definidos en
--    tienda_ropa_usuarios.sql se evaluan realmente en el DBMS.

-- 1. Registrar venta con transaccion explicita interna y manejo de excepciones
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

  -- Manejo de excepciones: bloque anidado que traduce una violacion de llave
  -- foranea (cliente o empleado inexistente) en un mensaje claro. No controla
  -- la transaccion porque eso solo se permite en el bloque externo.
  BEGIN
    INSERT INTO venta (id_cliente, id_empleado, metodo_pago, total, estado)
    VALUES (p_id_cliente, p_id_empleado, p_metodo_pago, 0, 'PAGADA')
    RETURNING id_venta INTO p_id_venta;
  EXCEPTION
    WHEN foreign_key_violation THEN
      RAISE EXCEPTION 'Cliente % o empleado % no es valido', p_id_cliente, p_id_empleado;
  END;

  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_id_producto := (v_item->>'id_producto')::INT;
    v_cantidad    := (v_item->>'cantidad')::INT;

    IF v_cantidad IS NULL OR v_cantidad <= 0 THEN
      ROLLBACK;
      RAISE EXCEPTION 'Cantidad invalida para producto %', v_id_producto;
    END IF;

    -- Bloqueo de fila para evitar carrera de stock
    SELECT precio_venta, stock_actual
      INTO v_precio, v_stock
      FROM producto
      WHERE id_producto = v_id_producto
      FOR UPDATE;

    IF NOT FOUND THEN
      ROLLBACK;
      RAISE EXCEPTION 'Producto % no existe', v_id_producto;
    END IF;

    IF v_stock < v_cantidad THEN
      -- Transaccion explicita con ROLLBACK: revierte la venta ya insertada
      ROLLBACK;
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

  -- Confirmacion explicita de la transaccion
  COMMIT;
END;
$$;

-- 2. Registrar compra de mercancia a proveedor
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
      ROLLBACK;
      RAISE EXCEPTION 'Cantidad invalida para producto %', v_id_producto;
    END IF;

    IF v_precio IS NULL OR v_precio < 0 THEN
      ROLLBACK;
      RAISE EXCEPTION 'Precio invalido para producto %', v_id_producto;
    END IF;

    PERFORM 1 FROM producto WHERE id_producto = v_id_producto;
    IF NOT FOUND THEN
      ROLLBACK;
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
  COMMIT;
END;
$$;

-- 3. Anular una venta y revertir stock
CREATE OR REPLACE PROCEDURE sp_anular_venta(
  p_id_venta INT
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_estado VARCHAR;
  v_registro RECORD;
BEGIN
  SELECT estado INTO v_estado FROM venta WHERE id_venta = p_id_venta;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'La venta % no existe.', p_id_venta;
  END IF;

  IF v_estado = 'ANULADA' THEN
    RAISE EXCEPTION 'La venta ya se encuentra anulada.';
  END IF;

  UPDATE venta SET estado = 'ANULADA' WHERE id_venta = p_id_venta;

  FOR v_registro IN SELECT id_producto, cantidad FROM detalle_venta WHERE id_venta = p_id_venta
  LOOP
    UPDATE producto SET stock_actual = stock_actual + v_registro.cantidad WHERE id_producto = v_registro.id_producto;

    INSERT INTO movimiento_inventario (id_producto, tipo, cantidad, motivo, referencia_doc)
    VALUES (v_registro.id_producto, 'ENTRADA', v_registro.cantidad, 'Anulacion de venta', 'VENTA-' || p_id_venta);
  END LOOP;

  COMMIT;
END;
$$;

-- 4. Actualizar masivamente precios de una categoria (parametro de salida INOUT)
CREATE OR REPLACE PROCEDURE sp_actualizar_precios_masivos(
  p_id_categoria INT,
  p_porcentaje DECIMAL,
  INOUT p_filas_afectadas INT DEFAULT NULL
)
LANGUAGE plpgsql
AS $$
BEGIN
  IF p_porcentaje < -90 THEN
    RAISE EXCEPTION 'No se puede disminuir el precio mas del 90%% de una vez';
  END IF;

  UPDATE producto
  SET precio_venta = precio_venta * (1 + (p_porcentaje / 100))
  WHERE id_categoria = p_id_categoria;

  GET DIAGNOSTICS p_filas_afectadas = ROW_COUNT;

  COMMIT;
END;
$$;

-- 5. Registrar nuevo cliente (SP basico con transaccion y parametro de salida)
CREATE OR REPLACE PROCEDURE sp_registrar_cliente(
  p_dpi_nit VARCHAR,
  p_nombre VARCHAR,
  p_apellido VARCHAR,
  p_email VARCHAR,
  p_telefono VARCHAR,
  p_direccion VARCHAR,
  INOUT p_id_cliente INT DEFAULT NULL
)
LANGUAGE plpgsql
AS $$
BEGIN
  IF p_nombre IS NULL OR p_apellido IS NULL THEN
    RAISE EXCEPTION 'El nombre y apellido son obligatorios';
  END IF;

  INSERT INTO cliente (dpi_nit, nombre, apellido, email, telefono, direccion)
  VALUES (p_dpi_nit, p_nombre, p_apellido, p_email, p_telefono, p_direccion)
  RETURNING id_cliente INTO p_id_cliente;

  COMMIT;
END;
$$;

-- 6. Actualizar stock de manera directa (por auditoria o correccion)
CREATE OR REPLACE PROCEDURE sp_ajustar_stock(
  p_id_producto INT,
  p_nuevo_stock INT
)
LANGUAGE plpgsql
AS $$
BEGIN
  IF p_nuevo_stock < 0 THEN
    RAISE EXCEPTION 'El stock no puede ser negativo';
  END IF;

  UPDATE producto SET stock_actual = p_nuevo_stock WHERE id_producto = p_id_producto;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Producto % no existe', p_id_producto;
  END IF;

  INSERT INTO movimiento_inventario (id_producto, tipo, cantidad, motivo, referencia_doc)
  VALUES (p_id_producto, 'ENTRADA', p_nuevo_stock, 'Ajuste de inventario manual', 'AJUSTE');

  COMMIT;
END;
$$;
