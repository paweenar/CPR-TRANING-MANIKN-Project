
const { pool } = require('./config/db');
require('dotenv').config();

async function testConnection() {
  try {
    const client = await pool.connect();
    console.log('Successfully connected to PostgreSQL');
    const res = await client.query('SELECT NOW()');
    console.log('Database time:', res.rows[0].now);
    client.release();
    process.exit(0);
  } catch (err) {
    console.error('Connection error', err.stack);
    process.exit(1);
  }
}

testConnection();
