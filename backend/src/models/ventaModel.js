const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// Transaccion explicita manejada por Sequelize
async function registrar({ id_cliente, id_empleado, metodo_pago, items }) {
  const t = await sequelize.transaction();
  try {
    // Al usar execute/query directo para llamar al procedure, le pasamos la transaccion esta es la forma en Sequelize:
    await sequelize.query(
      'CALL sp_registrar_venta(:id_cliente, :id_empleado, :metodo_pago, :items::jsonb, NULL)',
      {
        replacements: { 
          id_cliente, 
          id_empleado, 
          metodo_pago, 
          items: JSON.stringify(items) 
        },
        transaction: t,
        type: sequelize.QueryTypes.RAW
      }
    );
    await t.commit();
    return true;
  } catch (err) {
    await t.rollback();
    throw err;
  }
}

async function listarTodas() {
  const query = `
    SELECT v.id_venta, v.fecha_venta, v.total, v.metodo_pago, v.estado,
            cl.id_cliente,
            cl.nombre || ' ' || cl.apellido AS cliente,
            e.id_empleado,
            e.nombre || ' ' || e.apellido AS empleado
       FROM venta v
       JOIN cliente cl  ON cl.id_cliente = v.id_cliente
       JOIN empleado e  ON e.id_empleado = v.id_empleado
       ORDER BY v.fecha_venta DESC
  `;
  return await sequelize.query(query, { type: sequelize.QueryTypes.SELECT });
}

async function obtenerPorId(id) {
  const queryCabecera = `
    SELECT v.id_venta, v.fecha_venta, v.total, v.metodo_pago, v.estado,
            cl.id_cliente,
            cl.nombre || ' ' || cl.apellido AS cliente,
            e.id_empleado,
            e.nombre || ' ' || e.apellido AS empleado
       FROM venta v
       JOIN cliente cl ON cl.id_cliente = v.id_cliente
       JOIN empleado e ON e.id_empleado = v.id_empleado
      WHERE v.id_venta = :id
  `;
  
  const cabecera = await sequelize.query(queryCabecera, {
    replacements: { id },
    type: sequelize.QueryTypes.SELECT
  });
  
  if (cabecera.length === 0) return null;

  const queryDetalle = `
    SELECT dv.id_detalle_venta, dv.id_producto, p.nombre AS producto,
            dv.cantidad, dv.precio_unitario, dv.subtotal
       FROM detalle_venta dv
       JOIN producto p ON p.id_producto = dv.id_producto
      WHERE dv.id_venta = :id
  `;
  
  const detalle = await sequelize.query(queryDetalle, {
    replacements: { id },
    type: sequelize.QueryTypes.SELECT
  });

  return { ...cabecera[0], detalle };
}

module.exports = { registrar, listarTodas, obtenerPorId };
