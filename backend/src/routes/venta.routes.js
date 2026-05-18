const express = require('express');
const ventaController = require('../controllers/ventaController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.use(requireAuth);
router.get('/', ventaController.listar);
router.get('/:id', ventaController.obtener);
router.post('/', ventaController.registrar);
router.put('/:id/anular', ventaController.anular);

module.exports = router;
