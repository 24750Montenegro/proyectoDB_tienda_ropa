const express = require('express');
const reporteController = require('../controllers/reporteController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.use(requireAuth);
router.get('/productos-bajo-stock', reporteController.productosBajoStock);
router.get('/top-productos', reporteController.topProductosVendidos);
router.get('/clientes-por-categoria', reporteController.clientesPorCategoria);
router.get('/productos-sobre-promedio', reporteController.productosSobrePromedioCategoria);
router.get('/ingresos-por-categoria', reporteController.ingresosPorCategoria);
router.get('/top-productos-participacion', reporteController.topProductosConParticipacion);

module.exports = router;
