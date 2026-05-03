const express = require('express');
const reporteController = require('../controllers/reporteController');

const router = express.Router();

router.get('/productos-bajo-stock', reporteController.productosBajoStock);
router.get('/top-productos', reporteController.topProductosVendidos);
router.get('/clientes-por-categoria', reporteController.clientesPorCategoria);
router.get('/productos-sobre-promedio', reporteController.productosSobrePromedioCategoria);
router.get('/ingresos-por-categoria', reporteController.ingresosPorCategoria);

module.exports = router;
