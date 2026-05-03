const express = require('express');
const categoriaRoutes = require('./categoria.routes');
const productoRoutes = require('./producto.routes');
const ventaRoutes = require('./venta.routes');
const reporteRoutes = require('./reporte.routes');

const router = express.Router();

router.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

router.use('/categorias', categoriaRoutes);
router.use('/productos', productoRoutes);
router.use('/ventas', ventaRoutes);
router.use('/reportes', reporteRoutes);

module.exports = router;
