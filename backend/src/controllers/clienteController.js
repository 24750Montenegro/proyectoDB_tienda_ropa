const clienteModel = require('../models/clienteModel');

async function listar(req, res, next) {
  try {
    const q = req.query.q || '';
    const limite = req.query.limite ? Number(req.query.limite) : 12;
    if (!Number.isInteger(limite) || limite <= 0 || limite > 50) {
      return res.status(400).json({ error: 'limite debe ser entero entre 1 y 50' });
    }
    const clientes = await clienteModel.buscar({ q, limite });
    res.json(clientes);
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
    const cliente = await clienteModel.obtenerPorId(id);
    if (!cliente) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }
    res.json(cliente);
  } catch (err) {
    next(err);
  }
}

async function consumidorFinal(req, res, next) {
  try {
    const cliente = await clienteModel.obtenerConsumidorFinal();
    res.json(cliente);
  } catch (err) {
    next(err);
  }
}

module.exports = { listar, obtener, consumidorFinal };
