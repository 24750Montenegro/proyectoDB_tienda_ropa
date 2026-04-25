-- Tienda de Ropa — Esquema normalizado (3FN)
-- Dialecto: PostgreSQL

-- TIPOS ENUMERADOS (ENUM)
CREATE TYPE genero_enum AS ENUM ('M', 'F', 'UNISEX', 'NINO', 'NINA');
CREATE TYPE metodo_pago_enum AS ENUM ('EFECTIVO', 'TARJETA', 'TRANSFERENCIA', 'QR');
CREATE TYPE estado_venta_enum AS ENUM ('PAGADA', 'PENDIENTE', 'ANULADA', 'DEVUELTA');
CREATE TYPE estado_compra_enum AS ENUM ('RECIBIDA', 'PENDIENTE', 'ANULADA');
CREATE TYPE tipo_movimiento_enum AS ENUM ('ENTRADA', 'SALIDA', 'AJUSTE', 'DEVOLUCION', 'MERMA');

-- CATEGORIA
CREATE TABLE categoria (
  id_categoria INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nombre VARCHAR(60) NOT NULL UNIQUE,
  descripcion VARCHAR(255),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- PROVEEDOR
CREATE TABLE proveedor (
  id_proveedor INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nombre_empresa VARCHAR(120) NOT NULL,
  contacto_nombre VARCHAR(120),
  telefono VARCHAR(20),
  email VARCHAR(120),
  direccion VARCHAR(255),
  ruc_nit VARCHAR(30) NOT NULL UNIQUE,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- CLIENTE
CREATE TABLE cliente (
  id_cliente INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  dni_nit VARCHAR(30) NOT NULL UNIQUE,
  nombre VARCHAR(80) NOT NULL,
  apellido VARCHAR(80) NOT NULL,
  email VARCHAR(120) UNIQUE,
  telefono VARCHAR(20),
  direccion VARCHAR(255),
  fecha_registro DATE NOT NULL DEFAULT CURRENT_DATE,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- EMPLEADO
CREATE TABLE empleado (
  id_empleado INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  dni VARCHAR(30) NOT NULL UNIQUE,
  nombre VARCHAR(80) NOT NULL,
  apellido VARCHAR(80) NOT NULL,
  email VARCHAR(120) UNIQUE,
  telefono VARCHAR(20),
  puesto VARCHAR(50) NOT NULL,
  salario DECIMAL(10,2) NOT NULL CHECK (salario >= 0),
  fecha_contratacion DATE NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- PRODUCTO (FK de categoria)
CREATE TABLE producto (
  id_producto INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  id_categoria INT NOT NULL,
  nombre VARCHAR(120) NOT NULL,
  descripcion VARCHAR(255),
  talla VARCHAR(10),
  color VARCHAR(30),
  marca VARCHAR(60),
  genero genero_enum NOT NULL DEFAULT 'UNISEX',
  precio_venta DECIMAL(10,2) NOT NULL CHECK (precio_venta >= 0),
  precio_costo DECIMAL(10,2) NOT NULL CHECK (precio_costo >= 0),
  stock_actual INT NOT NULL DEFAULT 0 CHECK (stock_actual >= 0),
  stock_minimo INT NOT NULL DEFAULT 0 CHECK (stock_minimo >= 0),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_producto_categoria
    FOREIGN KEY (id_categoria) REFERENCES categoria(id_categoria)
    ON UPDATE CASCADE ON DELETE RESTRICT
);

-- VENTA (FK de cliente y empleado)
CREATE TABLE venta (
  id_venta INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  id_cliente INT NOT NULL,
  id_empleado INT NOT NULL,
  fecha_venta TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  total DECIMAL(12,2) NOT NULL DEFAULT 0 CHECK (total >= 0),
  metodo_pago metodo_pago_enum NOT NULL,
  estado estado_venta_enum NOT NULL DEFAULT 'PAGADA',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_venta_cliente
    FOREIGN KEY (id_cliente) REFERENCES cliente(id_cliente)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_venta_empleado
    FOREIGN KEY (id_empleado) REFERENCES empleado(id_empleado)
    ON UPDATE CASCADE ON DELETE RESTRICT
);

-- COMPRA (FK de proveedor y empleado)
CREATE TABLE compra (
  id_compra INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  id_proveedor INT NOT NULL,
  id_empleado INT NOT NULL,
  fecha_compra TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  total DECIMAL(12,2) NOT NULL DEFAULT 0 CHECK (total >= 0),
  numero_factura VARCHAR(40) NOT NULL UNIQUE,
  estado estado_compra_enum NOT NULL DEFAULT 'RECIBIDA',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_compra_proveedor
    FOREIGN KEY (id_proveedor) REFERENCES proveedor(id_proveedor)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_compra_empleado
    FOREIGN KEY (id_empleado) REFERENCES empleado(id_empleado)
    ON UPDATE CASCADE ON DELETE RESTRICT
);

-- DETALLE_VENTA (tabla intermedia venta y producto)
CREATE TABLE detalle_venta (
  id_detalle_venta INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  id_venta INT NOT NULL,
  id_producto INT NOT NULL,
  cantidad INT NOT NULL CHECK (cantidad > 0),
  precio_unitario DECIMAL(10,2) NOT NULL CHECK (precio_unitario >= 0),
  subtotal DECIMAL(12,2) GENERATED ALWAYS AS (cantidad * precio_unitario) STORED,
  CONSTRAINT uk_detalle_venta UNIQUE (id_venta, id_producto),
  CONSTRAINT fk_detv_venta
    FOREIGN KEY (id_venta) REFERENCES venta(id_venta)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_detv_producto
    FOREIGN KEY (id_producto) REFERENCES producto(id_producto)
    ON UPDATE CASCADE ON DELETE RESTRICT
);

-- DETALLE_COMPRA (tabla intermedia compra y producto)
CREATE TABLE detalle_compra (
  id_detalle_compra INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  id_compra INT NOT NULL,
  id_producto INT NOT NULL,
  cantidad INT NOT NULL CHECK (cantidad > 0),
  precio_unitario DECIMAL(10,2) NOT NULL CHECK (precio_unitario >= 0),
  subtotal DECIMAL(12,2) GENERATED ALWAYS AS (cantidad * precio_unitario) STORED,
  CONSTRAINT uk_detalle_compra UNIQUE (id_compra, id_producto),
  CONSTRAINT fk_detc_compra
    FOREIGN KEY (id_compra) REFERENCES compra(id_compra)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_detc_producto
    FOREIGN KEY (id_producto) REFERENCES producto(id_producto)
    ON UPDATE CASCADE ON DELETE RESTRICT
);

-- MOVIMIENTO_INVENTARIO (auditoría del stock)
CREATE TABLE movimiento_inventario (
  id_movimiento INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  id_producto INT NOT NULL,
  tipo tipo_movimiento_enum NOT NULL,
  cantidad INT NOT NULL CHECK (cantidad <> 0),
  fecha TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  motivo VARCHAR(120),
  referencia_doc VARCHAR(60),
  CONSTRAINT fk_mov_producto
    FOREIGN KEY (id_producto) REFERENCES producto(id_producto)
    ON UPDATE CASCADE ON DELETE RESTRICT
);

-- ÍNDICES Y SUS JUSTIFICACIONES

-- Justificación: En un e-commerce o punto de venta, la acción más común es "Ver catálogo por categoría".
-- Este índice acelera consultas tipo: SELECT * FROM producto WHERE id_categoria = X;
CREATE INDEX idx_producto_categoria ON producto(id_categoria);

-- Justificación: Los administradores revisan constantemente reportes de ventas diarias, semanales o mensuales.
-- Este índice acelera consultas tipo: SELECT * FROM venta WHERE fecha_venta BETWEEN 'X' AND 'Y';
CREATE INDEX idx_venta_fecha ON venta(fecha_venta);

-- Justificación: El sistema probablemente tiene una alerta de inventario.
-- Este índice acelera la búsqueda de productos a punto de agotarse: SELECT * FROM producto WHERE stock_actual <= stock_minimo;
CREATE INDEX idx_producto_stock ON producto(stock_actual, stock_minimo);

-- Justificación: Si hay una discrepancia de stock, necesitarás ver la historia del producto ordenada por fecha.
-- Este índice acelera consultas tipo: SELECT * FROM movimiento_inventario WHERE id_producto = X ORDER BY fecha DESC;
CREATE INDEX idx_mov_producto_fecha ON movimiento_inventario(id_producto, fecha);

-- Justificación: Cuando un cliente inicia sesión o llama a soporte, se necesita cargar su historial de pedidos rápidamente.
-- Este índice acelera consultas tipo: SELECT * FROM venta WHERE id_cliente = X;
CREATE INDEX idx_venta_cliente ON venta(id_cliente);