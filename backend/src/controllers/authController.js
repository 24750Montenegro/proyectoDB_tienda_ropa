const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const usuarioModel = require('../models/usuarioModel');

function firmarToken(usuario) {
  const payload = {
    id_usuario: usuario.id_usuario,
    nombre_usuario: usuario.nombre_usuario,
    rol: usuario.rol,
    id_empleado: usuario.id_empleado,
    empleado: usuario.empleado,
    puesto: usuario.puesto,
  };
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '8h',
  });
}

async function login(req, res, next) {
  try {
    const { nombre_usuario, password } = req.body;
    if (!nombre_usuario || !password) {
      return res.status(400).json({ error: 'nombre_usuario y password son obligatorios' });
    }
    const usuario = await usuarioModel.buscarPorNombre(nombre_usuario);
    // Mensaje generico para no revelar si el usuario existe
    if (!usuario) {
      return res.status(401).json({ error: 'Credenciales invalidas' });
    }
    const ok = await bcrypt.compare(password, usuario.password_hash);
    if (!ok) {
      return res.status(401).json({ error: 'Credenciales invalidas' });
    }
    const token = firmarToken(usuario);
    res.json({
      token,
      usuario: {
        id_usuario: usuario.id_usuario,
        nombre_usuario: usuario.nombre_usuario,
        rol: usuario.rol,
        id_empleado: usuario.id_empleado,
        empleado: usuario.empleado,
        puesto: usuario.puesto,
        empleado_email: usuario.empleado_email,
      },
    });
  } catch (err) {
    next(err);
  }
}

// Con JWT el logout real es del lado del cliente (descartar el token)
async function logout(req, res) {
  res.json({ ok: true });
}

function me(req, res) {
  res.json(req.usuario);
}

module.exports = { login, logout, me };
