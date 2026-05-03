const express = require('express');
const categoriaController = require('../controllers/categoriaController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.use(requireAuth);
router.get('/', categoriaController.listar);
router.get('/:id', categoriaController.obtener);
router.post('/', categoriaController.crear);
router.put('/:id', categoriaController.actualizar);
router.delete('/:id', categoriaController.eliminar);

module.exports = router;
