// ========== API SERVER FOR NEWSLETTER SUBSCRIPTIONS ==========
const express = require('express');
const { Pool } = require('pg');
const path = require('path');  // ADD THIS LINE
require('dotenv').config();

const app = express();
app.use(express.json());

// Enable CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

// ========== ADD THIS STATIC FILE SERVING SECTION ==========
// Serve static files (HTML, CSS, JS) from current directory
app.use(express.static(__dirname));

// Handle root route - serve index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Handle product-detail.html
app.get('/product-detail.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'product-detail.html'));
});

// Handle admin route
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});
// ========== END OF STATIC FILE SERVING SECTION ==========

// PostgreSQL connection for Render - WITH SSL properly configured
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
});

// Test database connection on startup
pool.connect((err, client, release) => {
    if (err) {
        console.error('❌ Database connection error:', err.message);
    } else {
        console.log('✅ Connected to PostgreSQL successfully!');
        release();
        
        // Create table if not exists
        createTable();
    }
});

// Root endpoint (API info)
app.get('/api-info', (req, res) => {
    res.json({
        name: 'SeaTask Newsletter API',
        version: '1.0.0',
        status: 'running',
        endpoints: {
            health: 'GET /api/health',
            subscribe: 'POST /api/subscribe',
            subscribers: 'GET /api/subscribers',
            count: 'GET /api/subscribers/count'
        }
    });
});

// Health check endpoint
app.get('/api/health', async (req, res) => {
    let dbStatus = 'unknown';
    try {
        const result = await pool.query('SELECT NOW()');
        dbStatus = 'connected';
        res.json({ 
            status: 'ok', 
            time: new Date().toISOString(), 
            database: dbStatus,
            version: '1.0.0'
        });
    } catch (err) {
        dbStatus = 'disconnected';
        res.status(500).json({ 
            status: 'error', 
            database: dbStatus, 
            error: err.message 
        });
    }
});

// API endpoint to save newsletter subscription
app.post('/api/subscribe', async (req, res) => {
    const { email } = req.body;
    
    console.log('📧 Subscribe request received for:', email);
    
    if (!email || !email.includes('@')) {
        return res.status(400).json({ success: false, message: 'Valid email is required' });
    }
    
    try {
        // First, check if table exists and what columns are available
        const tableCheck = await pool.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'newsletter_subscribers'
        `);
        
        const existingColumns = tableCheck.rows.map(row => row.column_name);
        console.log('Existing columns:', existingColumns);
        
        // Check if email already exists
        const checkResult = await pool.query(
            'SELECT email FROM newsletter_subscribers WHERE email = $1',
            [email.toLowerCase()]
        );
        
        if (checkResult.rows.length > 0) {
            return res.status(200).json({ success: false, message: 'This email is already subscribed!' });
        }
        
        // Build dynamic INSERT based on existing columns
        let insertQuery = 'INSERT INTO newsletter_subscribers (email';
        let values = [email.toLowerCase()];
        let valuePlaceholders = '$1';
        let paramCount = 2;
        
        // Add status if column exists
        if (existingColumns.includes('status')) {
            insertQuery += ', status';
            values.push('active');
            valuePlaceholders += `, $${paramCount}`;
            paramCount++;
        }
        
        // Add subscribed_at if column exists
        if (existingColumns.includes('subscribed_at')) {
            insertQuery += ', subscribed_at';
            values.push(new Date().toISOString());
            valuePlaceholders += `, $${paramCount}`;
            paramCount++;
        }
        
        insertQuery += ') VALUES (' + valuePlaceholders + ')';
        
        console.log('Insert query:', insertQuery);
        
        await pool.query(insertQuery, values);
        
        console.log(`📧 New subscriber saved: ${email}`);
        res.json({ success: true, message: '✅ Thanks for subscribing! Check your inbox for updates.' });
        
    } catch (error) {
        console.error('Error saving subscriber:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error: ' + error.message,
            details: error.detail || 'Please check database schema'
        });
    }
});

// Get all subscribers
app.get('/api/subscribers', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT email, subscribed_at, status FROM newsletter_subscribers ORDER BY subscribed_at DESC'
        );
        res.json({ success: true, count: result.rows.length, subscribers: result.rows });
    } catch (error) {
        console.error('Error fetching subscribers:', error);
        res.status(500).json({ success: false, message: error.message, subscribers: [] });
    }
});

// Get subscriber count
app.get('/api/subscribers/count', async (req, res) => {
    try {
        const result = await pool.query('SELECT COUNT(*) as count FROM newsletter_subscribers WHERE status = $1', ['active']);
        res.json({ success: true, count: parseInt(result.rows[0].count) });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Ping endpoint
app.get('/ping', (req, res) => {
    res.send('pong');
});

// Auto-create table on startup
async function createTable() {
    try {
        // Check if table exists
        const tableCheck = await pool.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'newsletter_subscribers'
            )
        `);
        
        if (!tableCheck.rows[0].exists) {
            console.log('Creating newsletter_subscribers table...');
            await pool.query(`
                CREATE TABLE newsletter_subscribers (
                    id SERIAL PRIMARY KEY,
                    email VARCHAR(255) UNIQUE NOT NULL,
                    status VARCHAR(50) DEFAULT 'active',
                    subscribed_at TIMESTAMP DEFAULT NOW()
                )
            `);
            console.log('✅ Table created successfully');
        } else {
            console.log('✅ Table already exists');
            
            // Check and add missing columns
            const columns = await pool.query(`
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'newsletter_subscribers'
            `);
            
            const colNames = columns.rows.map(r => r.column_name);
            
            if (!colNames.includes('subscribed_at')) {
                await pool.query('ALTER TABLE newsletter_subscribers ADD COLUMN subscribed_at TIMESTAMP DEFAULT NOW()');
                console.log('✅ Added subscribed_at column');
            }
            if (!colNames.includes('status')) {
                await pool.query("ALTER TABLE newsletter_subscribers ADD COLUMN status VARCHAR(50) DEFAULT 'active'");
                console.log('✅ Added status column');
            }
        }
    } catch (err) {
        console.error('❌ Table creation error:', err.message);
    }
}

// Start server
const PORT = process.env.PORT || 3002;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Newsletter API running on port ${PORT}`);
    console.log(`📧 Health check: GET /api/health`);
    console.log(`📧 Subscribe: POST /api/subscribe`);
    console.log(`📧 Subscribers: GET /api/subscribers`);
    console.log(`🌐 Website: http://localhost:${PORT}/`);
});