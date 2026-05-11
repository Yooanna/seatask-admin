// ========== POSTGRESQL DATABASE CONNECTION ==========
const { Pool } = require('pg');
require('dotenv').config();

// Create connection pool
const pool = new Pool({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'postgres123',
    database: 'seatask_db',
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

// Test connection
pool.connect((err, client, release) => {
    if (err) {
        console.error('❌ PostgreSQL connection error:', err.message);
    } else {
        console.log('✅ Connected to PostgreSQL successfully!');
        release();
    }
});

module.exports = pool;