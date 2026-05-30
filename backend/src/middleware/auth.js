const jwt = require('jsonwebtoken');
const { runWithDbRol } = require('../config/dbRoleContext');

// Verifica el header Authorization: Bearer <token> y deja req.usuario disponible.
// Ademas abre un contexto con el rol nativo del DBMS para que las llamadas a
// stored procedures se ejecuten bajo ese rol (SET ROLE) y se evaluen los GRANT.
function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const [esquema, token] = header.split(' ');
  if (esquema !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }
  try {
    req.usuario = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return res.status(401).json({ error: 'Token invalido o expirado' });
  }
  return runWithDbRol(req.usuario.rol, () => next());
}

// Restringe el acceso a roles especificos (usar despues de requireAuth)
function requireRol(...roles) {
  return (req, res, next) => {
    if (!req.usuario || !roles.includes(req.usuario.rol)) {
      return res.status(403).json({ error: 'No autorizado' });
    }
    next();
  };
}

module.exports = { requireAuth, requireRol };
