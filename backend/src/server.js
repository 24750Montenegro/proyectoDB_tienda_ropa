require('dotenv').config();
const app = require('./app');
const pool = require('./config/db');

const PORT = process.env.BACKEND_PORT || 3000;

async function start() {
  try {
    await pool.query('SELECT 1');
    console.log('Conexion a base de datos verificada');
    app.listen(PORT, () => {
      console.log(`Backend escuchando en puerto ${PORT}`);
    });
  } catch (err) {
    console.error('No se pudo conectar a la base de datos:', err.message);
    process.exit(1);
  }
}

start();
