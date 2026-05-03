const express = require('express');
const categoriaController = require('../controllers/categoriaController');

const router = express.Router();

router.get('/', categoriaController.listar);
router.get('/:id', categoriaController.obtener);

module.exports = router;
