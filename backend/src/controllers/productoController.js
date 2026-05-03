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

module.exports = { listar, obtener };
