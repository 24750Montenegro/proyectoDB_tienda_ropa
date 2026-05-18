const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const { Categoria } = require('./categoriaModel'); 

// Definición del modelo Sequelize
const Producto = sequelize.define('Producto', {
  id_producto: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  id_categoria: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  nombre: {
    type: DataTypes.STRING(120),
    allowNull: false
  },
  descripcion: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  talla: {
    type: DataTypes.STRING(10),
    allowNull: true
  },
  color: {
    type: DataTypes.STRING(30),
    allowNull: true
  },
  marca: {
    type: DataTypes.STRING(60),
    allowNull: true
  },
  imagen_url: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  genero: {
    type: DataTypes.ENUM('M', 'F', 'UNISEX', 'NINO', 'NINA'),
    allowNull: false,
    defaultValue: 'UNISEX'
  },
  precio_venta: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  precio_costo: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  stock_actual: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  stock_minimo: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'producto',
  timestamps: false
});

// Definir la relacion para que Sequelize haga el JOIN (producto - categoria)
Producto.belongsTo(Categoria, { foreignKey: 'id_categoria', as: 'CategoriaObj' });


async function listarTodos() {
  const productos = await Producto.findAll({
    include: [{
      model: Categoria,
      as: 'CategoriaObj',
      attributes: ['nombre']
    }],
    order: [['nombre', 'ASC']]
  });

  // Mapeamos para que la estructura de salida coincida exactamente con lo que espera el controlador
  return productos.map(p => ({
    ...p.toJSON(),
    categoria: p.CategoriaObj ? p.CategoriaObj.nombre : null,
    CategoriaObj: undefined // lo limpiamos
  }));
}

async function obtenerPorId(id) {
  const producto = await Producto.findByPk(id, {
    include: [{
      model: Categoria,
      as: 'CategoriaObj',
      attributes: ['nombre']
    }]
  });
  
  if (!producto) return null;
  const pData = producto.toJSON();
  pData.categoria = pData.CategoriaObj ? pData.CategoriaObj.nombre : null;
  delete pData.CategoriaObj;
  
  return pData;
}

async function crear(datos) {
  const {
    id_categoria, nombre, descripcion, talla, color, marca, imagen_url, genero,
    precio_venta, precio_costo, stock_actual, stock_minimo
  } = datos;

  const nuevoProd = await Producto.create({
    id_categoria, 
    nombre, 
    descripcion: descripcion ?? null, 
    talla: talla ?? null, 
    color: color ?? null, 
    marca: marca ?? null, 
    imagen_url: imagen_url || null, 
    genero: genero ?? 'UNISEX', 
    precio_venta, 
    precio_costo, 
    stock_actual: stock_actual ?? 0, 
    stock_minimo: stock_minimo ?? 0
  });

  return nuevoProd.toJSON();
}

async function actualizar(id, datos) {
  const producto = await Producto.findByPk(id);
  if (!producto) return null;

  const {
    id_categoria, nombre, descripcion, talla, color, marca, imagen_url, genero,
    precio_venta, precio_costo, stock_actual, stock_minimo
  } = datos;

  await producto.update({
    id_categoria, 
    nombre, 
    descripcion: descripcion ?? null, 
    talla: talla ?? null, 
    color: color ?? null, 
    marca: marca ?? null, 
    imagen_url: imagen_url || null, 
    genero: genero ?? 'UNISEX', 
    precio_venta, 
    precio_costo, 
    stock_actual: stock_actual ?? 0, 
    stock_minimo: stock_minimo ?? 0
  });

  return producto.toJSON();
}

async function eliminar(id) {
  const destructedRows = await Producto.destroy({
    where: { id_producto: id }
  });
  return destructedRows > 0;
}

module.exports = { Producto, listarTodos, obtenerPorId, crear, actualizar, eliminar };