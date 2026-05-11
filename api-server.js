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

// Root endpoint - so https://seatask-api.onrender.com/ works
app.get('/', (req, res) => {
    res.json({
        name: 'SeaTask Newsletter API',
        version: '1.0.0',
        endpoints: {
            health: '/api/health',
            subscribe: 'POST /api/subscribe',
            subscribers: 'GET /api/subscribers',
            count: 'GET /api/subscribers/count'
        }
    });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString(), message: 'API is running!' });
});

// Test endpoint
app.get('/api/test', (req, res) => {
    res.json({ success: true, message: 'Test endpoint working' });
});

// API endpoint to save newsletter subscription
app.post('/api/subscribe', async (req, res) => {
    const { email } = req.body;
    
    console.log('📧 Subscribe request received for:', email);
    
    if (!email || !email.includes('@')) {
        return res.status(400).json({ success: false, message: 'Valid email is required' });
    }
    
    try {
        // For now, return success without database (testing)
        // Once database is connected, we'll save to PostgreSQL
        res.json({ success: true, message: '✅ Thanks for subscribing! (Test mode - will save to database soon)' });
        
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, message: 'Server error. Please try again later.' });
    }
});

// Get subscribers endpoint (test version)
app.get('/api/subscribers', (req, res) => {
    res.json({ 
        success: true, 
        message: 'Database connection pending. Will show subscribers once PostgreSQL is connected.',
        subscribers: []
    });
});

// Simple ping endpoint
app.get('/ping', (req, res) => {
    res.send('pong');
});

// Start server - Render provides PORT environment variable
const PORT = process.env.PORT || 3002;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Newsletter API running on port ${PORT}`);
    console.log(`📧 Health check: GET /api/health`);
    console.log(`📧 Subscribe: POST /api/subscribe`);
    console.log(`📧 Subscribers: GET /api/subscribers`);
});