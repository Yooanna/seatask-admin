// ========== SUPABASE CLIENT ==========
// This file works alongside your existing code - NO MODIFICATIONS needed

const SUPABASE_URL = 'https://fladlejtkgjzpehvzkub.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZsYWRsZWp0a2dqenBlaHZ6a3ViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgwODEwMTcsImV4cCI6MjA5MzY1NzAxN30.uzMR3lWl0GrKKIcpWZRDZ9ac1y_gdjOocAUweSSZMgI';

const supabaseDB = {
    url: SUPABASE_URL,
    key: SUPABASE_ANON_KEY,

    // Get current user ID (from Google login or localStorage)
    getCurrentUserId() {
        // Check if user is logged in via Google
        const session = localStorage.getItem('sb_session');
        if (session) {
            try {
                const sessionData = JSON.parse(session);
                return sessionData.user?.id || null;
            } catch(e) {}
        }
        // Fallback to local user ID
        let userId = localStorage.getItem('seatask_user_id');
        if (!userId) {
            userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('seatask_user_id', userId);
        }
        return userId;
    },

    // Save order to Supabase
    async saveOrder(orderData) {
        try {
            const response = await fetch(`${this.url}/rest/v1/orders`, {
                method: 'POST',
                headers: {
                    'apikey': this.key,
                    'Authorization': `Bearer ${this.key}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(orderData)
            });
            const result = await response.json();
            return result[0] || null;
        } catch (error) {
            console.error('Error saving order:', error);
            return null;
        }
    },

    // Save order items
    async saveOrderItems(orderItems) {
        try {
            const response = await fetch(`${this.url}/rest/v1/order_items`, {
                method: 'POST',
                headers: {
                    'apikey': this.key,
                    'Authorization': `Bearer ${this.key}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(orderItems)
            });
            return await response.json();
        } catch (error) {
            console.error('Error saving order items:', error);
            return null;
        }
    },

    // Get user's order history
    async getOrderHistory(userId) {
        try {
            const response = await fetch(`${this.url}/rest/v1/orders?user_id=eq.${userId}&select=*&order=created_at.desc`, {
                headers: {
                    'apikey': this.key,
                    'Authorization': `Bearer ${this.key}`
                }
            });
            return await response.json();
        } catch (error) {
            console.error('Error fetching orders:', error);
            return [];
        }
    },

    // Get order items for a specific order
    async getOrderItems(orderId) {
        try {
            const response = await fetch(`${this.url}/rest/v1/order_items?order_id=eq.${orderId}&select=*`, {
                headers: {
                    'apikey': this.key,
                    'Authorization': `Bearer ${this.key}`
                }
            });
            return await response.json();
        } catch (error) {
            console.error('Error fetching order items:', error);
            return [];
        }
    },

    // Get all products from Supabase
    async getProducts() {
        try {
            const response = await fetch(`${this.url}/rest/v1/products?select=*`, {
                headers: {
                    'apikey': this.key,
                    'Authorization': `Bearer ${this.key}`
                }
            });
            return await response.json();
        } catch (error) {
            console.error('Error fetching products:', error);
            return [];
        }
    },

    // Get single product
    async getProductById(id) {
        try {
            const response = await fetch(`${this.url}/rest/v1/products?id=eq.${id}&select=*`, {
                headers: {
                    'apikey': this.key,
                    'Authorization': `Bearer ${this.key}`
                }
            });
            const data = await response.json();
            return data[0] || null;
        } catch (error) {
            console.error('Error fetching product:', error);
            return null;
        }
    }
};

console.log('✅ Supabase client ready - orders will be saved to database!');