const express = require('express');
const clienteController = require('../controllers/clienteController');
const { requireAuth, requireRol } = require('../middleware/auth');

const router = express.Router();

router.use(requireAuth);
router.get('/', requireRol('ADMIN', 'EMPLEADO', 'AUDITOR'), clienteController.listar);
router.get('/consumidor-final', requireRol('ADMIN', 'EMPLEADO'), clienteController.consumidorFinal);
router.get('/:id', requireRol('ADMIN', 'EMPLEADO', 'AUDITOR'), clienteController.obtener);
router.post('/', requireRol('ADMIN', 'EMPLEADO'), clienteController.crear);

module.exports = router;
