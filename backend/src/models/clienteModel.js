const { DataTypes, Op } = require('sequelize');
const sequelize = require('../config/db');

// Definición del modelo de cliente
const Cliente = sequelize.define('Cliente', {
  id_cliente: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  dpi_nit: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  apellido: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  telefono: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  direccion: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  fecha_registro: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: true,
  } 
}, {
  tableName: 'cliente',
  timestamps: false
});

async function buscar({ q = '', limite = 12 }) {
  const term = `%${q.trim()}%`;
  
  const query = `
    SELECT id_cliente, dpi_nit, nombre, apellido, email, telefono, direccion
      FROM cliente
     WHERE :term = '%%'
        OR dpi_nit ILIKE :term
        OR nombre ILIKE :term
        OR apellido ILIKE :term
        OR (nombre || ' ' || apellido) ILIKE :term
     ORDER BY
       CASE WHEN dpi_nit = 'CF' THEN 0 ELSE 1 END,
       apellido,
       nombre
     LIMIT :limite
  `;

  const result = await sequelize.query(query, {
    replacements: { term, limite },
    type: sequelize.QueryTypes.SELECT
  });
  
  return result;
}

async function obtenerPorId(id) {
  return await Cliente.findByPk(id, {
    attributes: ['id_cliente', 'dpi_nit', 'nombre', 'apellido', 'email', 'telefono', 'direccion']
  });
}

async function crear({ dpi_nit, nombre, apellido, email, telefono, direccion }) {
  // ORM estricto
  const nuevoCliente = await Cliente.create({
    dpi_nit,
    nombre,
    apellido,
    email: email || null,
    telefono: telefono || null,
    direccion: direccion || null
  });
  
  // Retornamos sin los timestamps extra 
  const { fecha_registro, updated_at, ...clienteData } = nuevoCliente.toJSON();
  return clienteData;
}

async function obtenerConsumidorFinal() {
  // findOrCreate es un atajo nativo de Sequelize para lograr tu "ON CONFLICT DO UPDATE"
  const [cliente, created] = await Cliente.findOrCreate({
    where: { dpi_nit: 'CF' },
    defaults: {
      nombre: 'Consumidor',
      apellido: 'Final',
      email: null,
      telefono: null,
      direccion: 'Venta sin datos fiscales'
    }
  });

  if (!created && (cliente.nombre !== 'Consumidor' || cliente.apellido !== 'Final')) {
    await cliente.update({ nombre: 'Consumidor', apellido: 'Final' });
  }

  const { fecha_registro, updated_at, ...clienteData } = cliente.toJSON();
  return clienteData;
}

module.exports = { Cliente, buscar, obtenerPorId, crear, obtenerConsumidorFinal };