const express = require('express');
const reporteController = require('../controllers/reporteController');

const router = express.Router();

router.get('/productos-bajo-stock', reporteController.productosBajoStock);
router.get('/top-productos', reporteController.topProductosVendidos);

module.exports = router;
