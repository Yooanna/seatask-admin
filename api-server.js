// ========== API SERVER FOR NEWSLETTER SUBSCRIPTIONS ==========
const express = require('express');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
app.use(express.json());

// Enable CORS for your frontend
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

// PostgreSQL connection for Render
const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
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
    }
});

// Root endpoint
app.get('/', (req, res) => {
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
        await pool.query('SELECT NOW()');
        dbStatus = 'connected';
    } catch (err) {
        dbStatus = 'disconnected';
    }
    
    res.json({ 
        status: 'ok', 
        time: new Date().toISOString(), 
        database: dbStatus,
        message: 'API is running!'
    });
});

// API endpoint to save newsletter subscription
app.post('/api/subscribe', async (req, res) => {
    const { email } = req.body;
    
    console.log('📧 Subscribe request received for:', email);
    
    if (!email || !email.includes('@')) {
        return res.status(400).json({ success: false, message: 'Valid email is required' });
    }
    
    try {
        // Check if email already exists
        const checkResult = await pool.query(
            'SELECT email FROM newsletter_subscribers WHERE email = $1',
            [email.toLowerCase()]
        );
        
        if (checkResult.rows.length > 0) {
            return res.status(200).json({ success: false, message: 'This email is already subscribed!' });
        }
        
        // Insert new subscriber (without 'source' column)
        await pool.query(
            `INSERT INTO newsletter_subscribers (email, status, subscribed_at, user_id) 
             VALUES ($1, 'active', NOW(), $2)`,
            [email.toLowerCase(), '']
        );
        
        console.log(`📧 New subscriber saved: ${email}`);
        res.json({ success: true, message: '✅ Thanks for subscribing! Check your inbox for updates.' });
        
    } catch (error) {
        console.error('Error saving subscriber:', error);
        res.status(500).json({ success: false, message: 'Server error. Please try again later.' });
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

// Start server
const PORT = process.env.PORT || 3002;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Newsletter API running on port ${PORT}`);
    console.log(`📧 Health check: GET /api/health`);
    console.log(`📧 Subscribe: POST /api/subscribe`);
    console.log(`📧 Subscribers: GET /api/subscribers`);
});