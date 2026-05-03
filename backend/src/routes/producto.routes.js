const express = require('express');
const productoController = require('../controllers/productoController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.use(requireAuth);
router.get('/', productoController.listar);
router.get('/:id', productoController.obtener);
router.post('/', productoController.crear);
router.put('/:id', productoController.actualizar);
router.delete('/:id', productoController.eliminar);

module.exports = router;
