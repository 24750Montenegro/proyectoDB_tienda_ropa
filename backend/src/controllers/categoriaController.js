const categoriaModel = require('../models/categoriaModel');

async function listar(req, res, next) {
  try {
    const categorias = await categoriaModel.listarTodas();
    res.json(categorias);
  } catch (err) {
    next(err);
  }
}

module.exports = { listar };
