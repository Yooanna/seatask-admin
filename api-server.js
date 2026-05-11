// ========== API SERVER FOR NEWSLETTER SUBSCRIPTIONS ==========
const express = require('express');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
app.use(express.json());

// PostgreSQL connection
const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres123',
    database: process.env.DB_NAME || 'seatask_db',
});

// API endpoint to save newsletter subscription
app.post('/api/subscribe', async (req, res) => {
    const { email } = req.body;
    
    if (!email || !email.includes('@')) {
        return res.status(400).json({ success: false, message: 'Valid email is required' });
    }
    
    try {
        // Check if email already exists
        const checkResult = await pool.query(
            'SELECT email FROM newsletter_subscribers WHERE email = $1',
            [email]
        );
        
        if (checkResult.rows.length > 0) {
            return res.status(200).json({ success: false, message: 'Email already subscribed!' });
        }
        
        // Insert new subscriber
        await pool.query(
            `INSERT INTO newsletter_subscribers (email, status, subscribed_at) 
             VALUES ($1, 'active', NOW())`,
            [email]
        );
        
        res.json({ success: true, message: 'Successfully subscribed!' });
        
    } catch (error) {
        console.error('Error saving subscriber:', error);
        res.status(500).json({ success: false, message: 'Server error. Please try again.' });
    }
});

// API endpoint to get all subscribers (for admin)
app.get('/api/subscribers', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT email, subscribed_at, status FROM newsletter_subscribers ORDER BY subscribed_at DESC'
        );
        res.json({ success: true, subscribers: result.rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Start server
const PORT = process.env.API_PORT || 3002;
app.listen(PORT, () => {
    console.log(`✅ Newsletter API running on http://localhost:${PORT}`);
    console.log(`📧 Subscribe endpoint: POST http://localhost:${PORT}/api/subscribe`);
});