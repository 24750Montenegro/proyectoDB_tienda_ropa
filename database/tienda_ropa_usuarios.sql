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
-- CREACIÓN DE 5 ROLES EN EL DBMS 

-- 1. Rol ADMIN - Acceso total
CREATE ROLE db_admin NOLOGIN;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO db_admin;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO db_admin;

-- 2. Rol EMPLEADO - Puede ver y modificar clientes, ventas, productos, pero NO borrar
CREATE ROLE db_empleado NOLOGIN;
GRANT SELECT, INSERT, UPDATE ON cliente, venta, producto, categoria TO db_empleado;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO db_empleado;

-- 3. Rol PROVEEDOR - Solo interactúa con productos y compras (lectura y actualización parcial)
CREATE ROLE db_proveedor NOLOGIN;
GRANT SELECT ON categoria, producto, compra TO db_proveedor;
GRANT UPDATE (stock_actual) ON producto TO db_proveedor;

-- 4. Rol AUDITOR - Acceso de solo lectura global para poder generar reportes
CREATE ROLE db_auditor NOLOGIN;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO db_auditor;

-- 5. Rol CLIENTE - Mínimo acceso, solo ve productos
CREATE ROLE db_cliente NOLOGIN;
GRANT SELECT ON producto, categoria TO db_cliente;


