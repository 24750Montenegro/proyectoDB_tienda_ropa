const express = require('express');
const clienteController = require('../controllers/clienteController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.use(requireAuth);
router.get('/', clienteController.listar);
router.get('/consumidor-final', clienteController.consumidorFinal);
router.get('/:id', clienteController.obtener);
router.post('/', clienteController.crear);

module.exports = router;
