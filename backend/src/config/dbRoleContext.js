const { AsyncLocalStorage } = require('async_hooks');

// Almacenamiento por request para propagar el rol del DBMS hasta la capa de datos
// sin tener que pasarlo como parametro por cada controlador/modelo.
const storage = new AsyncLocalStorage();

// Mapeo del rol de aplicacion (el del JWT) al rol nativo creado en PostgreSQL.
// Los nombres deben coincidir con los CREATE ROLE de database/tienda_ropa_usuarios.sql.
const ROL_APP_A_DBMS = {
  ADMIN: 'db_admin',
  EMPLEADO: 'db_empleado',
  PROVEEDOR: 'db_proveedor',
  AUDITOR: 'db_auditor',
  CLIENTE: 'db_cliente',
};

// Ejecuta fn dentro de un contexto que recuerda el rol de BD del usuario autenticado.
function runWithDbRol(rolApp, fn) {
  const dbRol = ROL_APP_A_DBMS[rolApp] || null;
  return storage.run({ dbRol }, fn);
}

// Devuelve el rol nativo de PostgreSQL del request actual (o null fuera de un request).
function getDbRol() {
  const store = storage.getStore();
  return store ? store.dbRol : null;
}

module.exports = { runWithDbRol, getDbRol, ROL_APP_A_DBMS };
