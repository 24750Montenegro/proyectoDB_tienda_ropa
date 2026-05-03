const express = require('express');
const ventaController = require('../controllers/ventaController');

const router = express.Router();

router.post('/', ventaController.registrar);

module.exports = router;
