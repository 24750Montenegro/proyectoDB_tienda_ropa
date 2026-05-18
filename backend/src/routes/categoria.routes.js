const express = require('express');
const categoriaController = require('../controllers/categoriaController');
const { requireAuth, requireRol } = require('../middleware/auth');

const router = express.Router();

router.use(requireAuth);
router.get('/', categoriaController.listar);
router.get('/:id', categoriaController.obtener);
router.post('/', requireRol('ADMIN', 'EMPLEADO'), categoriaController.crear);
router.put('/:id', requireRol('ADMIN', 'EMPLEADO'), categoriaController.actualizar);
router.put('/:id/precios', requireRol('ADMIN'), categoriaController.actualizarPrecios);
router.delete('/:id', requireRol('ADMIN', 'EMPLEADO'), categoriaController.eliminar);

module.exports = router;
