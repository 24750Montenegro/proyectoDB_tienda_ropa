const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// Definición del modelo de categoría
const Categoria = sequelize.define('Categoria', {
  id_categoria: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  descripcion: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: true,
  }
}, {
  tableName: 'categoria',
  timestamps: false
});

async function listarTodas() {
  return await Categoria.findAll({
    order: [['nombre', 'ASC']]
  });
}

async function obtenerPorId(id) {
  return await Categoria.findByPk(id);
}

async function crear({ nombre, descripcion }) {
  return await Categoria.create({ nombre, descripcion });
}

async function actualizar(id, { nombre, descripcion }) {
  const categoria = await Categoria.findByPk(id);
  if (!categoria) {
    return null;
  }

  await categoria.update({ nombre, descripcion, updated_at: new Date() });
  return categoria;
}

async function eliminar(id) {
  const categoriaEliminada = await Categoria.destroy({ where: { id_categoria: id } });
  return categoriaEliminada > 0; // Devuelve true si se eliminó, false si no se encontró
}

module.exports = { Categoria, listarTodas, obtenerPorId, crear, actualizar, eliminar };
