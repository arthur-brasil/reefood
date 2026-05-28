require('dotenv').config();
const { Pool } = require('pg');

console.log('URL:', process.env.DATABASE_URL);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

pool.query('SELECT 1')
  .then(() => console.log('✅ Conectou!'))
  .catch((e) => console.log('❌ Erro:', e.message));