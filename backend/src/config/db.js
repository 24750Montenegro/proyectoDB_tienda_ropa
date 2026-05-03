const { Pool } = require('pg');

const pool = new Pool({
  // 'db' es el nombre del servicio en docker-compose
  host: process.env.DB_HOST || 'db',
  port: process.env.DB_PORT_INTERNAL || 5432,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  max: 10,
});

pool.on('error', (err) => {
  console.error('Error inesperado en cliente del pool', err);
});

module.exports = pool;
