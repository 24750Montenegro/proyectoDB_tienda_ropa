const reporteModel = require('../models/reporteModel');

async function productosBajoStock(req, res, next) {
  try {
    const datos = await reporteModel.productosBajoStock();
    res.json(datos);
  } catch (err) {
    next(err);
  }
}

module.exports = { productosBajoStock };
