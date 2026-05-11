// ========== SUPABASE CONFIGURATION ==========

const SUPABASE_URL = 'https://fladlejtkgjzpehvzkub.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZsYWRsZWp0a2dqenBlaHZ6a3ViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgwODEwMTcsImV4cCI6MjA5MzY1NzAxN30.uzMR3lWl0GrKKIcpWZRDZ9ac1y_gdjOocAUweSSZMgI';

const seataskClient = {
    url: SUPABASE_URL,
    key: SUPABASE_ANON_KEY,
    
    async getProducts() {
        try {
            const response = await fetch(`${this.url}/rest/v1/products?select=*`, {
                headers: {
                    'apikey': this.key,
                    'Authorization': `Bearer ${this.key}`
                }
            });
            const data = await response.json();
            console.log('Products loaded:', data.length);
            return data;
        } catch (error) {
            console.error('Error:', error);
            return [];
        }
    },
    
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
            console.error('Error:', error);
            return null;
        }
    },
    
    async getCart(userId) {
        try {
            const response = await fetch(`${this.url}/rest/v1/cart_items?user_id=eq.${userId}&select=*`, {
                headers: {
                    'apikey': this.key,
                    'Authorization': `Bearer ${this.key}`
                }
            });
            return await response.json();
        } catch (error) {
            console.error('Error:', error);
            return [];
        }
    },
    
    async addToCart(item) {
        try {
            const response = await fetch(`${this.url}/rest/v1/cart_items`, {
                method: 'POST',
                headers: {
                    'apikey': this.key,
                    'Authorization': `Bearer ${this.key}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(item)
            });
            return await response.json();
        } catch (error) {
            console.error('Error:', error);
            return null;
        }
    },
    
    async updateCartItem(id, quantity) {
        try {
            await fetch(`${this.url}/rest/v1/cart_items?id=eq.${id}`, {
                method: 'PATCH',
                headers: {
                    'apikey': this.key,
                    'Authorization': `Bearer ${this.key}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ quantity: quantity })
            });
            return true;
        } catch (error) {
            console.error('Error:', error);
            return false;
        }
    },
    
    async removeFromCart(id) {
        try {
            await fetch(`${this.url}/rest/v1/cart_items?id=eq.${id}`, {
                method: 'DELETE',
                headers: {
                    'apikey': this.key,
                    'Authorization': `Bearer ${this.key}`
                }
            });
            return true;
        } catch (error) {
            console.error('Error:', error);
            return false;
        }
    },
    
    async clearCart(userId) {
        try {
            await fetch(`${this.url}/rest/v1/cart_items?user_id=eq.${userId}`, {
                method: 'DELETE',
                headers: {
                    'apikey': this.key,
                    'Authorization': `Bearer ${this.key}`
                }
            });
            return true;
        } catch (error) {
            console.error('Error:', error);
            return false;
        }
    }
};

window.seataskClient = seataskClient;
console.log('Supabase ready!');