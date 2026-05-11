// test-db.js - Test PostgreSQL connection
const pool = require('./database');

async function testConnection() {
    try {
        const result = await pool.query('SELECT NOW() as current_time, COUNT(*) as product_count FROM products');
        console.log('✅ Database connected!');
        console.log('Current time:', result.rows[0].current_time);
        console.log('Number of products:', result.rows[0].product_count);
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        pool.end();
    }
}

testConnection();