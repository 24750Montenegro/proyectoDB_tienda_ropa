-- Tabla de usuarios para autenticacion (bcrypt + JWT en el backend).

CREATE TYPE rol_enum AS ENUM ('ADMIN', 'EMPLEADO', 'PROVEEDOR', 'AUDITOR', 'CLIENTE');

CREATE TABLE usuario (
  id_usuario INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nombre_usuario VARCHAR(60) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  rol rol_enum NOT NULL DEFAULT 'CLIENTE',
  id_empleado INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_usuario_empleado
    FOREIGN KEY (id_empleado) REFERENCES empleado(id_empleado)
    ON UPDATE CASCADE ON DELETE SET NULL
);

CREATE INDEX idx_usuario_nombre ON usuario(nombre_usuario);

-- contraseñas predeterminadas para los 5 roles generadas con bcrypt
INSERT INTO usuario (nombre_usuario, password_hash, rol, id_empleado) VALUES
  ('admin', '$2b$10$7Y56cVHop2ZSwICDlpUYfOl9QwQXbYS.wzz2nV32g8TJ3Nvy427sG', 'ADMIN', 1),
  ('empleado1', '$2b$10$p0CRniFo5Wc2gII2.0QvGeW8.zQJogqJhy.QMS2mvcaRPp7aKfhvS', 'EMPLEADO', 2),
  ('proveedor1', '$2b$10$6x0nhzpJU31eMQISHhjV2eP/ZzARk0TOAP29NaYegP6snjpQ1gpVC', 'PROVEEDOR', NULL),
  ('auditor1', '$2b$10$1zPRGaMfHs4LVjocFMxQMOlqbYUPfkUApZMsDVm47vCkviMEPjXEW', 'AUDITOR', NULL),
  ('cliente1', '$2b$10$8.xYvM0pc4IuEEFIGf2NZe0anwOENQkS9rESkW.bGobcT/qJLZHvK', 'CLIENTE', NULL);



-- =========================================================================
-- CREACION DE ROLES EN EL DBMS

REVOKE EXECUTE ON ALL PROCEDURES IN SCHEMA public FROM PUBLIC;

-- 1. Rol ADMIN - Acceso total
CREATE ROLE db_admin NOLOGIN;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO db_admin;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO db_admin;
GRANT EXECUTE ON ALL PROCEDURES IN SCHEMA public TO db_admin;

-- 2. Rol EMPLEADO - Operacion de punto de venta.
-- Los procedimientos son SECURITY INVOKER, por lo que el rol necesita los
-- privilegios de las tablas que tocan sus SPs (no solo EXECUTE).
CREATE ROLE db_empleado NOLOGIN;
GRANT SELECT ON categoria,
                v_productos_bajo_stock, v_ventas_detalle_completo,
                v_resumen_ventas_diarias, v_top_productos_vendidos,
                v_ventas_por_categoria
  TO db_empleado;
-- Privilegios de escritura acotados a lo que ejecutan sus SPs:
GRANT SELECT, INSERT, UPDATE ON venta         TO db_empleado;  -- registrar / anular
GRANT SELECT, INSERT          ON detalle_venta TO db_empleado;  -- registrar / leer al anular
GRANT INSERT                  ON movimiento_inventario TO db_empleado;
GRANT SELECT, UPDATE          ON producto      TO db_empleado;  -- bloqueo FOR UPDATE + stock
GRANT SELECT, INSERT          ON cliente       TO db_empleado;  -- registrar cliente
GRANT EXECUTE ON PROCEDURE
    sp_registrar_venta(INT, INT, metodo_pago_enum, JSONB, INT),
    sp_anular_venta(INT),
    sp_registrar_cliente(VARCHAR, VARCHAR, VARCHAR, VARCHAR, VARCHAR, VARCHAR, INT)
  TO db_empleado;

-- 3. Rol PROVEEDOR - Lectura de catalogo/compras; recepcion via SP (SECURITY INVOKER)
CREATE ROLE db_proveedor NOLOGIN;
GRANT SELECT                  ON categoria     TO db_proveedor;
GRANT SELECT, INSERT, UPDATE  ON compra        TO db_proveedor;
GRANT SELECT, INSERT          ON detalle_compra TO db_proveedor;
GRANT SELECT, UPDATE          ON producto      TO db_proveedor;  -- ingreso de stock
GRANT INSERT                  ON movimiento_inventario TO db_proveedor;
GRANT EXECUTE ON PROCEDURE
    sp_registrar_compra(INT, INT, VARCHAR, JSONB, INT)
  TO db_proveedor;

-- 4. Rol AUDITOR - Solo lectura global (tablas + vistas de reporte)
CREATE ROLE db_auditor NOLOGIN;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO db_auditor;
REVOKE SELECT ON usuario FROM db_auditor;

-- 5. Rol CLIENTE - Minimo acceso, solo ve catalogo
CREATE ROLE db_cliente NOLOGIN;
GRANT SELECT ON producto, categoria TO db_cliente;


