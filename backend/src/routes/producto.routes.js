const express = require('express');
const productoController = require('../controllers/productoController');
const { requireAuth, requireRol } = require('../middleware/auth');

const router = express.Router();

router.use(requireAuth);
router.get('/', productoController.listar);
router.get('/:id', productoController.obtener);
router.post('/', requireRol('ADMIN', 'EMPLEADO'), productoController.crear);
router.put('/:id', requireRol('ADMIN', 'EMPLEADO'), productoController.actualizar);
router.put('/:id/stock', requireRol('ADMIN'), productoController.ajustarStock);
router.delete('/:id', requireRol('ADMIN', 'EMPLEADO'), productoController.eliminar);

module.exports = router;
