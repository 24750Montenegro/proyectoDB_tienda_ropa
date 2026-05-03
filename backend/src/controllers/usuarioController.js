const bcrypt = require('bcrypt');
const usuarioModel = require('../models/usuarioModel');

const ROLES = ['ADMIN', 'VENDEDOR'];
// cost=10 da buen balance entre seguridad y rendimiento
const SALT_ROUNDS = 10;

async function registrar(req, res, next) {
  try {
    const { nombre_usuario, password, rol, id_empleado } = req.body;
    if (!nombre_usuario || typeof nombre_usuario !== 'string' || nombre_usuario.trim() === '') {
      return res.status(400).json({ error: 'nombre_usuario es obligatorio' });
    }
    if (!password || typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ error: 'password debe tener al menos 6 caracteres' });
    }
    if (rol !== undefined && !ROLES.includes(rol)) {
      return res.status(400).json({ error: `rol debe ser uno de: ${ROLES.join(', ')}` });
    }
    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);
    const usuario = await usuarioModel.crear({
      nombre_usuario: nombre_usuario.trim(),
      password_hash,
      rol,
      id_empleado: id_empleado ?? null,
    });
    res.status(201).json(usuario);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'El nombre de usuario ya esta en uso' });
    }
    if (err.code === '23503') {
      return res.status(409).json({ error: 'El empleado indicado no existe' });
    }
    next(err);
  }
}

module.exports = { registrar };
