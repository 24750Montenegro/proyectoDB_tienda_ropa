const express = require('express');
const ventaController = require('../controllers/ventaController');

const router = express.Router();

router.get('/', ventaController.listar);
router.get('/:id', ventaController.obtener);
router.post('/', ventaController.registrar);

module.exports = router;
