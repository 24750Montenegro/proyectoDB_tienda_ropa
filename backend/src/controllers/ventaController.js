const ventaModel = require('../models/ventaModel');

const METODOS_PAGO = ['EFECTIVO', 'TARJETA', 'TRANSFERENCIA', 'QR'];

function validarPayload(body) {
  const errores = [];
  if (!Number.isInteger(body.id_cliente) || body.id_cliente <= 0) {
    errores.push('id_cliente debe ser un entero positivo');
  }
  if (!Number.isInteger(body.id_empleado) || body.id_empleado <= 0) {
    errores.push('id_empleado debe ser un entero positivo');
  }
  if (!METODOS_PAGO.includes(body.metodo_pago)) {
    errores.push(`metodo_pago debe ser uno de: ${METODOS_PAGO.join(', ')}`);
  }
  if (!Array.isArray(body.items) || body.items.length === 0) {
    errores.push('items debe ser un arreglo no vacio');
  } else {
    body.items.forEach((it, i) => {
      if (!Number.isInteger(it.id_producto) || it.id_producto <= 0) {
        errores.push(`items[${i}].id_producto invalido`);
      }
      if (!Number.isInteger(it.cantidad) || it.cantidad <= 0) {
        errores.push(`items[${i}].cantidad debe ser entero > 0`);
      }
    });
  }
  return errores;
}

async function registrar(req, res, next) {
  try {
    const errores = validarPayload(req.body);
    if (errores.length > 0) {
      return res.status(400).json({ error: errores.join('; ') });
    }
    const id_venta = await ventaModel.registrar(req.body);
    res.status(201).json({ id_venta });
  } catch (err) {
    if (err.code === 'P0001') {
      return res.status(409).json({ error: err.message });
    }
    if (err.code === '23503') {
      return res.status(409).json({ error: 'Cliente o empleado no existe' });
    }
    next(err);
  }
}

async function listar(req, res, next) {
  try {
    const ventas = await ventaModel.listarTodas();
    res.json(ventas);
  } catch (err) {
    next(err);
  }
}

module.exports = { registrar, listar };
