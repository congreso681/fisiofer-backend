const { Pool } = require('pg');

// ─── PostgreSQL Pool ──────────────────────────────────────────────
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/fisiocenter',
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
});

pool.on('error', (err) => {
  console.error('❌ Error en pool de PostgreSQL:', err);
});

pool.on('connect', () => {
  console.log('✅ Conexión a PostgreSQL establecida');
});

module.exports = { pool };
