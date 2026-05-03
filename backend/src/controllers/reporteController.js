const reporteModel = require('../models/reporteModel');

async function productosBajoStock(req, res, next) {
  try {
    const datos = await reporteModel.productosBajoStock();
    res.json(datos);
  } catch (err) {
    next(err);
  }
}

async function topProductosVendidos(req, res, next) {
  try {
    const limite = req.query.limite ? Number(req.query.limite) : 10;
    if (!Number.isInteger(limite) || limite <= 0 || limite > 100) {
      return res.status(400).json({ error: 'limite debe ser entero entre 1 y 100' });
    }
    const datos = await reporteModel.topProductosVendidos(limite);
    res.json(datos);
  } catch (err) {
    next(err);
  }
}

async function clientesPorCategoria(req, res, next) {
  try {
    const categoria = (req.query.categoria || '').trim();
    if (!categoria) {
      return res.status(400).json({ error: 'parametro categoria es obligatorio' });
    }
    const datos = await reporteModel.clientesPorCategoria(categoria);
    res.json(datos);
  } catch (err) {
    next(err);
  }
}

async function productosSobrePromedioCategoria(req, res, next) {
  try {
    const datos = await reporteModel.productosSobrePromedioCategoria();
    res.json(datos);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  productosBajoStock,
  topProductosVendidos,
  clientesPorCategoria,
  productosSobrePromedioCategoria,
};
