require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');

const app = express();

// ========== MIDDLEWARE ==========
app.use(express.json());
app.use(cors());

// ========== STATIC FILES ==========
// Public customer website (main marketplace)
app.use(express.static(path.join(__dirname, '../frontend/public')));

// Admin panel files
app.use('/admin', express.static(path.join(__dirname, '../frontend/admin')));

// ========== MODELS ==========
const ProductSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, default: '' },
    category: { type: String, required: true },
    brand: { type: String, default: 'SeaTask Original' },
    origin: { type: String, default: 'Made in Malaysia' },
    material: { type: String, default: '' },
    care: { type: String, default: '' },
    price: { type: Number, required: true },
    rating: { type: Number, default: 4.5 },
    images: [{ type: String, default: [] }],
    variants: [{
        name: String,
        price: Number,
        inventory: Number,
        sku: String
    }],
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const CategorySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    icon: { type: String, default: '📦' },
    description: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 }
});

const Product = mongoose.model('Product', ProductSchema);
const Category = mongoose.model('Category', CategorySchema);

// ========== DATABASE CONNECTION ==========
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/seatask_admin';
mongoose.connect(MONGODB_URI)
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch(err => console.error('❌ MongoDB error:', err.message));

// ========== ADMIN AUTH ==========
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Seatask2025';

app.post('/api/admin/login', (req, res) => {
    const { username, password } = req.body;
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        const token = jwt.sign({ username }, process.env.JWT_SECRET || 'secret123', { expiresIn: '24h' });
        res.json({ success: true, token, message: 'Login successful' });
    } else {
        res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
});

function verifyToken(req, res, next) {
    const token = req.headers['authorization'];
    if (!token) return res.status(401).json({ message: 'No token provided' });
    jwt.verify(token.split(' ')[1], process.env.JWT_SECRET || 'secret123', (err, decoded) => {
        if (err) return res.status(403).json({ message: 'Invalid token' });
        req.user = decoded;
        next();
    });
}

// ========== PRODUCT CRUD API ==========
// Get all products (public - no auth needed for customers)
app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });
        res.json({ success: true, products });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get single product (public)
app.get('/api/products/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        res.json({ success: true, product });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Create product (admin only)
app.post('/api/products', verifyToken, async (req, res) => {
    try {
        const product = new Product(req.body);
        await product.save();
        res.json({ success: true, product });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Update product (admin only)
app.put('/api/products/:id', verifyToken, async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json({ success: true, product });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Delete product (admin only)
app.delete('/api/products/:id', verifyToken, async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ========== CATEGORY CRUD API ==========
app.get('/api/categories', async (req, res) => {
    try {
        const categories = await Category.find().sort({ order: 1 });
        res.json({ success: true, categories });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/categories', verifyToken, async (req, res) => {
    try {
        const category = new Category(req.body);
        await category.save();
        res.json({ success: true, category });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.put('/api/categories/:id', verifyToken, async (req, res) => {
    try {
        const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json({ success: true, category });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.delete('/api/categories/:id', verifyToken, async (req, res) => {
    try {
        await Category.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ========== INIT DEFAULT DATA ==========
async function initDefaultData() {
    const categoryCount = await Category.countDocuments();
    if (categoryCount === 0) {
        const defaultCategories = [
            { name: 'Shirt', icon: '👕', order: 1 },
            { name: 'Hat', icon: '🧢', order: 2 },
            { name: 'Accessories', icon: '🌂', order: 3 },
            { name: 'Electronics', icon: '🔊', order: 4 },
            { name: 'Badminton', icon: '🏸', order: 5 }
        ];
        await Category.insertMany(defaultCategories);
        console.log('✅ Default categories added');
    }

    const productCount = await Product.countDocuments();
    if (productCount === 0) {
        const defaultProducts = [
            { name: 'Premium Cotton T-Shirt', category: 'Shirt', price: 79, rating: 4.8, images: ['https://images.pexels.com/photos/2040436/pexels-photo-2040436.jpeg'], brand: 'SeaTask Original', origin: 'Made in Malaysia', material: '100% Organic Cotton', description: 'Premium quality cotton t-shirt with SeaTask logo.' },
            { name: 'Adjustable Baseball Cap', category: 'Hat', price: 29, rating: 4.5, images: ['https://images.pexels.com/photos/29926576/pexels-photo-29926576.jpeg'], brand: 'SeaTask Original', origin: 'Made in Vietnam', material: 'Cotton Blend', description: 'Classic baseball cap with embroidered SeaTask logo.' },
            { name: 'Bluetooth Speaker', category: 'Electronics', price: 129, rating: 4.9, images: ['https://wonderfulengineering.com/wp-content/uploads/2022/11/10-Best-Portable-Bluetooth-Speaker9-1024x1024.jpg'], brand: 'SeaTask Audio', origin: 'Designed in Malaysia', material: 'ABS Plastic', description: 'Portable Bluetooth speaker with 20-hour battery life.' },
            { name: 'Carbon Fiber Badminton Racket', category: 'Badminton', price: 159, rating: 4.9, images: ['https://cdn.store-assets.com/s/964873/i/49661033.jpg'], brand: 'SeaTask Sports', origin: 'Made in Malaysia', material: 'Carbon Fiber', description: 'Professional-grade badminton racket.' }
        ];
        await Product.insertMany(defaultProducts);
        console.log('✅ Default products added');
    }
}

initDefaultData();

// ========== FRONTEND ROUTES ==========
// Main customer website
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/public/index.html'));
});

// Admin panel
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/admin/admin.html'));
});

// ========== START SERVER ==========
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📱 Customer Website: http://localhost:${PORT}/`);
    console.log(`🔐 Admin Panel: http://localhost:${PORT}/admin`);
});