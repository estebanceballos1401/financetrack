
import pg from 'pg';
import dotenv from 'dotenv';

// Cargar las variables de entorno
dotenv.config();

// Obtener Pool de PostgreSQL
const { Pool } = pg;

// Configurar la conexión
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT),
});

// Exportar la conexión
export default pool;
