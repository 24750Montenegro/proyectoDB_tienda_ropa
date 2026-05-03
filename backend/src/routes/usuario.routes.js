const express = require('express');
const usuarioController = require('../controllers/usuarioController');
const { requireAuth, requireRol } = require('../middleware/auth');

const router = express.Router();

router.get('/', requireAuth, requireRol('ADMIN'), usuarioController.listar);
router.post('/', requireAuth, requireRol('ADMIN'), usuarioController.registrar);

module.exports = router;
