const express = require('express');
const ventaController = require('../controllers/ventaController');
const { requireAuth, requireRol } = require('../middleware/auth');

const router = express.Router();

router.use(requireAuth);
router.get('/', requireRol('ADMIN', 'EMPLEADO', 'AUDITOR'), ventaController.listar);
router.get('/:id', requireRol('ADMIN', 'EMPLEADO', 'AUDITOR'), ventaController.obtener);
router.post('/', requireRol('ADMIN', 'EMPLEADO'), ventaController.registrar);
router.put('/:id/anular', requireRol('ADMIN', 'EMPLEADO'), ventaController.anular);

module.exports = router;
