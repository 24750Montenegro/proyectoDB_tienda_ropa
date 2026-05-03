const express = require('express');
const productoController = require('../controllers/productoController');

const router = express.Router();

router.get('/', productoController.listar);
router.get('/:id', productoController.obtener);

module.exports = router;
