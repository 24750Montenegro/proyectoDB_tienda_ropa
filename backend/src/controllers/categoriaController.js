const categoriaModel = require('../models/categoriaModel');

async function listar(req, res, next) {
  try {
    const categorias = await categoriaModel.listarTodas();
    res.json(categorias);
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
    const categoria = await categoriaModel.obtenerPorId(id);
    if (!categoria) {
      return res.status(404).json({ error: 'Categoria no encontrada' });
    }
    res.json(categoria);
  } catch (err) {
    next(err);
  }
}

module.exports = { listar, obtener };
