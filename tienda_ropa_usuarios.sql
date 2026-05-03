-- Tabla de usuarios para autenticacion (bcrypt + JWT en el backend).

CREATE TYPE rol_enum AS ENUM ('ADMIN', 'VENDEDOR');

CREATE TABLE usuario (
  id_usuario INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nombre_usuario VARCHAR(60) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  rol rol_enum NOT NULL DEFAULT 'VENDEDOR',
  id_empleado INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_usuario_empleado
    FOREIGN KEY (id_empleado) REFERENCES empleado(id_empleado)
    ON UPDATE CASCADE ON DELETE SET NULL
);

CREATE INDEX idx_usuario_nombre ON usuario(nombre_usuario);

-- Usuarios seed: admin/admin123 y vendedor/vendedor123 (hashes bcrypt cost=10)
INSERT INTO usuario (nombre_usuario, password_hash, rol, id_empleado) VALUES
  ('admin',    '$2b$10$nOuxgc79OrR3HBiqADOzV.jCvs2ESx93M/ur9GhbjrMhKGXjFRGiK', 'ADMIN',    1),
  ('vendedor', '$2b$10$iRAA13WUNEcR3d59o7Rc8eBH/nMoLlMuTGmFZyzF29nMeLNpVyLh2', 'VENDEDOR', 2);
