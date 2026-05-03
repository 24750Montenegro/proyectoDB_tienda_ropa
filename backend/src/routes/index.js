const express = require('express');
const categoriaRoutes = require('./categoria.routes');

const router = express.Router();

router.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

router.use('/categorias', categoriaRoutes);

module.exports = router;
