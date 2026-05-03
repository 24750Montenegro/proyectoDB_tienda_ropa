const productoModel = require('../models/productoModel');

async function listar(req, res, next) {
  try {
    const productos = await productoModel.listarTodos();
    res.json(productos);
  } catch (err) {
    next(err);
  }
}

async function obtener(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: 'ID invalido' });
    }
    const producto = await productoModel.obtenerPorId(id);
    if (!producto) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json(producto);
  } catch (err) {
    next(err);
  }
}

const GENEROS = ['M', 'F', 'UNISEX', 'NINO', 'NINA'];

function validarPayload(body) {
  const errores = [];
  if (!Number.isInteger(body.id_categoria) || body.id_categoria <= 0) {
    errores.push('id_categoria debe ser un entero positivo');
  }
  if (!body.nombre || typeof body.nombre !== 'string' || body.nombre.trim() === '') {
    errores.push('nombre es obligatorio');
  }
  if (typeof body.precio_venta !== 'number' || body.precio_venta < 0) {
    errores.push('precio_venta debe ser un numero >= 0');
  }
  if (typeof body.precio_costo !== 'number' || body.precio_costo < 0) {
    errores.push('precio_costo debe ser un numero >= 0');
  }
  if (body.genero !== undefined && !GENEROS.includes(body.genero)) {
    errores.push(`genero debe ser uno de: ${GENEROS.join(', ')}`);
  }
  if (body.stock_actual !== undefined && (!Number.isInteger(body.stock_actual) || body.stock_actual < 0)) {
    errores.push('stock_actual debe ser un entero >= 0');
  }
  if (body.stock_minimo !== undefined && (!Number.isInteger(body.stock_minimo) || body.stock_minimo < 0)) {
    errores.push('stock_minimo debe ser un entero >= 0');
  }
  return errores;
}

async function crear(req, res, next) {
  try {
    const errores = validarPayload(req.body);
    if (errores.length > 0) {
      return res.status(400).json({ error: errores.join('; ') });
    }
    const producto = await productoModel.crear({
      ...req.body,
      nombre: req.body.nombre.trim(),
    });
    res.status(201).json(producto);
  } catch (err) {
    // 23503 = foreign_key_violation (id_categoria invalido)
    if (err.code === '23503') {
      return res.status(409).json({ error: 'La categoria indicada no existe' });
    }
    next(err);
  }
}

async function actualizar(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: 'ID invalido' });
    }
    const errores = validarPayload(req.body);
    if (errores.length > 0) {
      return res.status(400).json({ error: errores.join('; ') });
    }
    const producto = await productoModel.actualizar(id, {
      ...req.body,
      nombre: req.body.nombre.trim(),
    });
    if (!producto) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json(producto);
  } catch (err) {
    if (err.code === '23503') {
      return res.status(409).json({ error: 'La categoria indicada no existe' });
    }
    next(err);
  }
}

async function eliminar(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: 'ID invalido' });
    }
    const eliminado = await productoModel.eliminar(id);
    if (!eliminado) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.status(204).send();
  } catch (err) {
    if (err.code === '23503') {
      return res.status(409).json({
        error: 'No se puede eliminar: el producto tiene ventas, compras o movimientos asociados',
      });
    }
    next(err);
  }
}

module.exports = { listar, obtener, crear, actualizar, eliminar };
