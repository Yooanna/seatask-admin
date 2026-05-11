// ========== WEEKLY NEWSLETTER SERVICE ==========
const nodemailer = require('nodemailer');
const cron = require('node-cron');
const { Pool } = require('pg');
require('dotenv').config();

// Database connection
const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres123',
    database: process.env.DB_NAME || 'seatask_db',
});

// Email setup
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    },
});

// Get all active subscribers
async function getSubscribers() {
    try {
        const result = await pool.query(
            'SELECT email FROM newsletter_subscribers WHERE status = $1',
            ['active']
        );
        return result.rows;
    } catch (error) {
        console.error('Error getting subscribers:', error.message);
        return [];
    }
}

// Get latest products
async function getLatestProducts() {
    try {
        const result = await pool.query(
            `SELECT id, name, price, image_url, rating 
             FROM products 
             ORDER BY id DESC 
             LIMIT 8`
        );
        return result.rows;
    } catch (error) {
        console.error('Error getting products:', error.message);
        return [];
    }
}

// Generate email HTML
function generateEmailHTML(products) {
    if (!products || products.length === 0) {
        return `
            <div style="text-align: center; padding: 40px;">
                <h2>No new products this week</h2>
                <p>Check back soon for exciting updates!</p>
            </div>
        `;
    }

    const productsHTML = products.map(product => `
        <div style="display: inline-block; width: 200px; margin: 10px; padding: 15px; border: 1px solid #e0eef5; border-radius: 10px; text-align: center;">
            <img src="${product.image_url || 'https://via.placeholder.com/150'}" style="width: 150px; height: 150px; object-fit: contain;" onerror="this.src='https://via.placeholder.com/150'">
            <h4 style="margin: 10px 0;">${product.name}</h4>
            <p style="color: #1976a5; font-weight: bold;">RM ${Number(product.price).toFixed(2)}</p>
            <p style="color: #f5b042;">⭐ ${product.rating || '4.5'}/5</p>
            <a href="https://seatask-admin.onrender.com/product-detail.html?id=${product.id}" style="background: #1976a5; color: white; padding: 8px 16px; text-decoration: none; border-radius: 25px; display: inline-block;">View Product</a>
        </div>
    `).join('');

    return `<!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>SeaTask Weekly Newsletter</title>
    </head>
    <body style="font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 0; background-color: #eef5fa;">
        <div style="max-width: 700px; margin: 0 auto; background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #1976a5, #2c8cbb); color: white; padding: 30px; text-align: center;">
                <h1 style="margin: 0;">🌊 SeaTask Marketplace</h1>
                <p style="margin-top: 10px; opacity: 0.9;">"When you feel good inside, the world mirrors it."</p>
            </div>
            
            <!-- Content -->
            <div style="padding: 30px;">
                <h2 style="color: #1a3a5c;">✨ New Arrivals This Week</h2>
                <p>Check out our latest products handpicked just for you!</p>
                <div style="text-align: center;">
                    ${productsHTML}
                </div>
                
                <hr style="margin: 30px 0; border-color: #e0eef5;">
                
                <div style="background: linear-gradient(135deg, #e8f4fd, #d4e6f1); padding: 25px; border-radius: 15px; text-align: center;">
                    <h3 style="margin: 0 0 10px 0; color: #1a3a5c;">🎉 Shop with Gratitude</h3>
                    <p style="margin-bottom: 20px;">Use code: <strong style="font-size: 18px; color: #1976a5;">WELCOME10</strong> for 10% off your next purchase!</p>
                    <a href="https://seatask-admin.onrender.com/" style="background: #1976a5; color: white; padding: 12px 28px; text-decoration: none; border-radius: 30px; display: inline-block; font-weight: bold;">Shop Now →</a>
                </div>
            </div>
            
            <!-- Footer -->
            <div style="background: #1a3a5c; color: #7a8e9c; padding: 20px; text-align: center; font-size: 12px;">
                <p>&copy; 2025 SeaTask Marketplace — All rights reserved.</p>
                <p style="margin-top: 10px;">
                    <a href="https://seatask-admin.onrender.com/" style="color: #4fc3f7; text-decoration: none;">Unsubscribe</a> | 
                    <a href="https://seatask-admin.onrender.com/" style="color: #4fc3f7; text-decoration: none;">Privacy Policy</a>
                </p>
                <p style="font-size: 10px; margin-top: 10px;">You received this email because you subscribed to SeaTask Marketplace newsletter.</p>
            </div>
        </div>
    </body>
    </html>`;
}

// Send newsletter to a single subscriber
async function sendNewsletterToSubscriber(email, products) {
    try {
        await transporter.sendMail({
            from: `"SeaTask Marketplace" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: `Weekly Newsletter: New Arrivals - ${new Date().toLocaleDateString()}`,
            html: generateEmailHTML(products),
        });
        console.log(`✅ Sent to: ${email}`);
        return true;
    } catch (error) {
        console.error(`❌ Failed to ${email}:`, error.message);
        return false;
    }
}

// Send to all subscribers
async function sendWeeklyNewsletter() {
    console.log(`\n📧 ===== STARTING WEEKLY NEWSLETTER =====`);
    console.log(`📅 Time: ${new Date().toLocaleString()}`);
    
    const subscribers = await getSubscribers();
    const products = await getLatestProducts();
    
    if (subscribers.length === 0) {
        console.log('⚠️ No subscribers found. Add a subscriber to test.');
        console.log('💡 Run this SQL in pgAdmin: INSERT INTO newsletter_subscribers (email, status) VALUES (\'your_email@gmail.com\', \'active\');');
        return;
    }
    
    console.log(`📊 Subscribers: ${subscribers.length}`);
    console.log(`📦 Products found: ${products.length}`);
    
    let successCount = 0;
    let failCount = 0;
    
    for (const subscriber of subscribers) {
        const success = await sendNewsletterToSubscriber(subscriber.email, products);
        if (success) {
            successCount++;
        } else {
            failCount++;
        }
        // Wait 1 second between emails to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log(`📊 ===== NEWSLETTER COMPLETE =====`);
    console.log(`✅ Success: ${successCount}`);
    console.log(`❌ Failed: ${failCount}`);
    console.log(`📧 ================================\n`);
}

// Schedule: Every Monday at 9:00 AM
cron.schedule('0 9 * * 1', () => {
    console.log('⏰ Running scheduled weekly newsletter...');
    sendWeeklyNewsletter();
});

console.log('📅 Newsletter service started!');
console.log('⏰ Will send every Monday at 9:00 AM');
console.log('💡 To test now, run: node newsletter-service.js --send-now');

// Manual trigger for testing
if (process.argv.includes('--send-now')) {
    console.log('📧 Manual trigger detected! Sending now...\n');
    sendWeeklyNewsletter();
}

module.exports = { sendWeeklyNewsletter, getSubscribers, getLatestProducts };