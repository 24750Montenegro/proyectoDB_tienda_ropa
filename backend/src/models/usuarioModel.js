const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// modelo de usuario
const Usuario = sequelize.define('Usuario', {
  id_usuario: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre_usuario: {
    type: DataTypes.STRING(60),
    allowNull: false,
    unique: true
  },
  password_hash: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  rol: {
    type: DataTypes.ENUM('ADMIN', 'VENDEDOR'), // placeholder mientras hacemos roles reales en la db
    allowNull: false,
    defaultValue: 'VENDEDOR'
  },
  id_empleado: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'usuario',
  timestamps: false
});




async function crear({ nombre_usuario, password_hash, rol, id_empleado }) {
  const nuevoUsuario = await Usuario.create({
    nombre_usuario,
    password_hash,
    rol: rol || 'VENDEDOR',
    id_empleado: id_empleado || null
  });
  
  const { password_hash: _, ...usuarioSinPas } = nuevoUsuario.toJSON();
  return usuarioSinPas; // Retornamos sin el campo de la contraseña real como lo hacía el pool
}

async function buscarPorNombre(nombre_usuario) {
  const query = `
    SELECT u.id_usuario, u.nombre_usuario, u.password_hash, u.rol, u.id_empleado,
           e.nombre || ' ' || e.apellido AS empleado,
           e.puesto,
           e.email AS empleado_email
      FROM usuario u
      LEFT JOIN empleado e ON e.id_empleado = u.id_empleado
     WHERE u.nombre_usuario = :nombreUsuario
  `;

  const [usuario] = await sequelize.query(query, {
    replacements: { nombreUsuario: nombre_usuario },
    type: sequelize.QueryTypes.SELECT
  });

  return usuario || null;
}

async function listarTodos() {
  const query = `
    SELECT u.id_usuario, u.nombre_usuario, u.rol, u.id_empleado, u.created_at,
           e.nombre || ' ' || e.apellido AS empleado,
           e.puesto
      FROM usuario u
      LEFT JOIN empleado e ON e.id_empleado = u.id_empleado
     ORDER BY u.created_at DESC
  `;

  const usuarios = await sequelize.query(query, {
    type: sequelize.QueryTypes.SELECT
  });

  return usuarios;
}

module.exports = { Usuario, crear, buscarPorNombre, listarTodos };