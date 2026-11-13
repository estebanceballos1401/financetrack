
import pool from './db.js';

try {
  const result = await pool.query('SELECT NOW()');

  console.log('Conexión exitosa con PostgreSQL');
  console.log('Fecha y hora del servidor:', result.rows[0].now);
} catch (error) {
  console.error('Error al conectar con PostgreSQL:', error.message);
} finally {
  await pool.end();
}
