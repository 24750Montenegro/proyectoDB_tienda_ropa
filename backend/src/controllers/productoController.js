const productoModel = require('../models/productoModel');

async function listar(req, res, next) {
  try {
    const productos = await productoModel.listarTodos();
    res.json(productos);
  } catch (err) {
    next(err);
  }
}

module.exports = { listar };
