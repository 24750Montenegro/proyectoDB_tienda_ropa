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

-- Usuarios seed (hashes bcrypt cost=10, todos son secret o el nombre del rol+123)
-- contraseñas (todas bcrypt "secret"): $2b$10$C8.EwD/B1.zH1x/oA2X68.rV6P.A5U47B95F/O/x8yX0T2S4A3b0q
INSERT INTO usuario (nombre_usuario, password_hash, rol, id_empleado) VALUES
  ('admin', '$2b$10$nOuxgc79OrR3HBiqADOzV.jCvs2ESx93M/ur9GhbjrMhKGXjFRGiK', 'ADMIN', 1),
  ('empleado1', '$2b$10$nOuxgc79OrR3HBiqADOzV.jCvs2ESx93M/ur9GhbjrMhKGXjFRGiK', 'EMPLEADO', 2),
  ('proveedor1', '$2b$10$nOuxgc79OrR3HBiqADOzV.jCvs2ESx93M/ur9GhbjrMhKGXjFRGiK', 'PROVEEDOR', NULL),
  ('auditor1', '$2b$10$nOuxgc79OrR3HBiqADOzV.jCvs2ESx93M/ur9GhbjrMhKGXjFRGiK', 'AUDITOR', NULL),
  ('cliente1', '$2b$10$nOuxgc79OrR3HBiqADOzV.jCvs2ESx93M/ur9GhbjrMhKGXjFRGiK', 'CLIENTE', NULL);

-- =========================================================================
-- CREACIÓN DE 5 ROLES EN EL DBMS (Requerimiento de Rúbrica - Proyecto 3)
-- =========================================================================

-- 1. Rol ADMIN (Base de datos) -> Acceso total
CREATE ROLE db_admin NOLOGIN;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO db_admin;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO db_admin;

-- 2. Rol EMPLEADO -> Puede ver y modificar clientes, ventas, productos, pero NO borrar
CREATE ROLE db_empleado NOLOGIN;
GRANT SELECT, INSERT, UPDATE ON cliente, venta, producto, categoria TO db_empleado;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO db_empleado;

-- 3. Rol PROVEEDOR -> Solo interactúa con productos y compras (lectura y actualización parcial)
CREATE ROLE db_proveedor NOLOGIN;
GRANT SELECT ON categoria, producto, compra TO db_proveedor;
GRANT UPDATE (stock_actual) ON producto TO db_proveedor;

-- 4. Rol AUDITOR -> Acceso de solo lectura global para poder generar reportes
CREATE ROLE db_auditor NOLOGIN;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO db_auditor;

-- 5. Rol CLIENTE -> Mínimo acceso, solo ve productos
CREATE ROLE db_cliente NOLOGIN;
GRANT SELECT ON producto, categoria TO db_cliente;

-- NOTA: El usuario "proy3" (configurado en docker-compose / .env) será el propietario 
-- de la base de datos o el administrador general que asignará/usará estos roles.

