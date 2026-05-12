// ========== POSTGRESQL DATABASE CONNECTION ==========
const { Pool } = require('pg');

// Create connection pool - reads from environment variables on Render
const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres123',
    database: process.env.DB_NAME || 'seatask_db',
    ssl: process.env.DB_HOST ? { rejectUnauthorized: false } : false, // Required for Render
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
});

// Test connection (but don't block startup)
pool.connect((err, client, release) => {
    if (err) {
        console.error('❌ PostgreSQL connection error:', err.message);
    } else {
        console.log('✅ Connected to PostgreSQL successfully!');
        release();
    }
});

module.exports = pool;