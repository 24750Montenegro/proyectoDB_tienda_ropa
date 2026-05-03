const express = require('express');
const usuarioController = require('../controllers/usuarioController');
const { requireAuth, requireRol } = require('../middleware/auth');

const router = express.Router();

router.post('/', requireAuth, requireRol('ADMIN'), usuarioController.registrar);

module.exports = router;
