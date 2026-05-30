const sequelize = require('./db');
const { getDbRol } = require('./dbRoleContext');

// Sustituye los parametros nombrados (:nombre) por literales SQL escapados,
// igual que hace Sequelize con `replacements`. El lookbehind (?<!:) evita
// confundir un parametro con un cast de tipo (p. ej. :items::jsonb).
function inlinarParametros(sql, replacements = {}) {
  return sql.replace(/(?<!:):(\w+)/g, (_match, nombre) => {
    if (!(nombre in replacements)) {
      throw new Error(`Falta el parametro :${nombre} para el stored procedure`);
    }
    const valor = replacements[nombre];
    if (valor === null || valor === undefined) {
      return 'NULL';
    }
    return sequelize.escape(valor);
  });
}

// Ejecuta un stored procedure bajo el rol nativo de PostgreSQL del usuario
// autenticado. Cada SP maneja su propia transaccion (COMMIT/ROLLBACK), por eso
// NO se envuelve en una transaccion de Sequelize (Postgres prohibe el control
// de transacciones dentro de un bloque de transaccion ya abierto).
//
// Se fija una unica conexion del pool para correr de forma consistente:
//   SET ROLE <rol>  ->  CALL ...  ->  RESET ROLE
// Asi los GRANT/REVOKE definidos en el DBMS se evaluan realmente (el usuario de
// conexion es superusuario, pero al hacer SET ROLE a un rol no-superusuario sus
// privilegios quedan limitados a los de ese rol).
async function ejecutarProcedimiento(sql, replacements = {}) {
  const dbRol = getDbRol();
  const conn = await sequelize.connectionManager.getConnection({ type: 'write' });
  try {
    if (dbRol) {
      await conn.query(`SET ROLE "${dbRol}"`);
    }
    return await conn.query(inlinarParametros(sql, replacements));
  } catch (err) {
    // Normaliza el error del cliente pg para que los controladores lo manejen
    // igual que un error de Sequelize (responden 409 con el mensaje del SP).
    const e = new Error(err.message);
    e.name = 'SequelizeDatabaseError';
    e.code = err.code; // P0001 (RAISE EXCEPTION), 42501 (permiso denegado), etc.
    e.original = err;
    e.parent = err;
    throw e;
  } finally {
    try {
      if (dbRol) {
        await conn.query('RESET ROLE');
      }
    } catch (_) {
      // La conexion se libera de todos modos; el siguiente uso fija su propio rol.
    }
    sequelize.connectionManager.releaseConnection(conn);
  }
}

module.exports = { ejecutarProcedimiento };
