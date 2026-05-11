// ========== SUPABASE CART INTEGRATION ==========
// This connects your cart to Supabase - NO localStorage for cart

// Supabase configuration
const CART_SUPABASE_URL = 'https://fladlejtkgjzpehvzkub.supabase.co';
const CART_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZsYWRsZWp0a2dqenBlaHZ6a3ViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgwODEwMTcsImV4cCI6MjA5MzY1NzAxN30.uzMR3lWl0GrKKIcpWZRDZ9ac1y_gdjOocAUweSSZMgI';

// Cart functions using Supabase instead of localStorage
const supabaseCart = {
    // Get current cart from Supabase
    async getCart() {
        const userId = this.getUserId();
        try {
            const response = await fetch(`${CART_SUPABASE_URL}/rest/v1/cart_items?user_id=eq.${userId}&select=*`, {
                headers: {
                    'apikey': CART_SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${CART_SUPABASE_ANON_KEY}`
                }
            });
            return await response.json();
        } catch (error) {
            console.error('Error fetching cart:', error);
            return [];
        }
    },

    // Add item to cart in Supabase
    async addToCart(productId, productName, productPrice, quantity = 1, variation = null) {
        const userId = this.getUserId();
        
        // Check if item already exists
        const existingCart = await this.getCart();
        const existingItem = existingCart.find(item => 
            item.product_id === productId && 
            JSON.stringify(item.variation) === JSON.stringify(variation)
        );
        
        if (existingItem) {
            // Update quantity
            const newQuantity = existingItem.quantity + quantity;
            await fetch(`${CART_SUPABASE_URL}/rest/v1/cart_items?id=eq.${existingItem.id}`, {
                method: 'PATCH',
                headers: {
                    'apikey': CART_SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${CART_SUPABASE_ANON_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ quantity: newQuantity })
            });
        } else {
            // Add new item
            await fetch(`${CART_SUPABASE_URL}/rest/v1/cart_items`, {
                method: 'POST',
                headers: {
                    'apikey': CART_SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${CART_SUPABASE_ANON_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    user_id: userId,
                    product_id: productId,
                    product_name: productName,
                    price: productPrice,
                    quantity: quantity,
                    variation: variation
                })
            });
        }
        
        await this.updateCartDisplay();
        return true;
    },

    // Update cart item quantity
    async updateCartItem(id, quantity) {
        await fetch(`${CART_SUPABASE_URL}/rest/v1/cart_items?id=eq.${id}`, {
            method: 'PATCH',
            headers: {
                'apikey': CART_SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${CART_SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ quantity: quantity })
        });
        await this.updateCartDisplay();
    },

    // Remove cart item
    async removeCartItem(id) {
        await fetch(`${CART_SUPABASE_URL}/rest/v1/cart_items?id=eq.${id}`, {
            method: 'DELETE',
            headers: {
                'apikey': CART_SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${CART_SUPABASE_ANON_KEY}`
            }
        });
        await this.updateCartDisplay();
    },

    // Clear entire cart
    async clearCart() {
        const userId = this.getUserId();
        await fetch(`${CART_SUPABASE_URL}/rest/v1/cart_items?user_id=eq.${userId}`, {
            method: 'DELETE',
            headers: {
                'apikey': CART_SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${CART_SUPABASE_ANON_KEY}`
            }
        });
        await this.updateCartDisplay();
    },

    // Get user ID (from Google login or generate one)
    getUserId() {
        // Check if user is logged in via Google
        const session = localStorage.getItem('sb_session');
        if (session) {
            try {
                const sessionData = JSON.parse(session);
                if (sessionData.user?.id) return sessionData.user.id;
            } catch(e) {}
        }
        // Generate or retrieve persistent user ID
        let userId = localStorage.getItem('seatask_supabase_user_id');
        if (!userId) {
            userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('seatask_supabase_user_id', userId);
        }
        return userId;
    },

    // Update cart count display
    async updateCartDisplay() {
        const cart = await this.getCart();
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        
        // Update all cart count displays
        const cartCountSpans = document.querySelectorAll('#cartCount');
        cartCountSpans.forEach(span => {
            if (span) span.innerText = totalItems;
        });
        
        // Update window.cart if exists (for compatibility)
        if (typeof window.cart !== 'undefined') {
            window.cart = cart;
        }
        
        return cart;
    },

    // Render cart modal content
    async renderCartModal() {
        const cart = await this.getCart();
        const cartItemsDiv = document.getElementById('cartItems');
        if (!cartItemsDiv) return;
        
        if (cart.length === 0) {
            cartItemsDiv.innerHTML = '<p style="text-align:center; padding:20px;">Your cart is empty. 🛒</p>';
            const cartTotalSpan = document.getElementById('cartTotal');
            if (cartTotalSpan) cartTotalSpan.innerText = '0.00';
            return;
        }
        
        cartItemsDiv.innerHTML = '';
        for (let i = 0; i < cart.length; i++) {
            const item = cart[i];
            const itemDiv = document.createElement('div');
            itemDiv.style.cssText = 'display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #e0eef5;';
            itemDiv.innerHTML = `
                <div style="flex:1;">
                    <div style="font-weight: 500;">${item.product_name}</div>
                    <div style="font-size: 13px; color: #1976a5;">RM ${item.price.toFixed(2)} each</div>
                    ${item.variation ? `<div style="font-size: 11px; color: #7a8e9c;">${item.variation.color ? `Color: ${item.variation.color}` : ''} ${item.variation.size ? `Size: ${item.variation.size}` : ''}</div>` : ''}
                </div>
                <div style="display: flex; align-items: center; gap: 10px;">
                    <button class="qty-btn" data-id="${item.id}" data-action="decr" style="background:#e0eef5; border:none; width:28px; height:28px; border-radius:50%; cursor:pointer;">-</button>
                    <span>${item.quantity}</span>
                    <button class="qty-btn" data-id="${item.id}" data-action="incr" style="background:#e0eef5; border:none; width:28px; height:28px; border-radius:50%; cursor:pointer;">+</button>
                    <button class="qty-btn" data-id="${item.id}" data-action="remove" style="background:#ff6b6b; border:none; width:28px; height:28px; border-radius:50%; cursor:pointer; color:white;">🗑</button>
                </div>
            `;
            cartItemsDiv.appendChild(itemDiv);
        }
        
        // Add event listeners to quantity buttons
        document.querySelectorAll('#cartItems .qty-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const id = parseInt(btn.dataset.id);
                const action = btn.dataset.action;
                const cart = await this.getCart();
                const item = cart.find(i => i.id === id);
                
                if (action === 'incr') {
                    await this.updateCartItem(id, item.quantity + 1);
                } else if (action === 'decr') {
                    if (item.quantity > 1) {
                        await this.updateCartItem(id, item.quantity - 1);
                    } else {
                        await this.removeCartItem(id);
                    }
                } else if (action === 'remove') {
                    await this.removeCartItem(id);
                }
                await this.renderCartModal();
            }.bind(this));
        });
        
        // Update total price
        const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const cartTotalSpan = document.getElementById('cartTotal');
        if (cartTotalSpan) cartTotalSpan.innerText = totalPrice.toFixed(2);
    },

    // Checkout - save order to Supabase and clear cart
    async checkout(orderData) {
        const cart = await this.getCart();
        if (cart.length === 0) return false;
        
        const orderNumber = 'ORD-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6).toUpperCase();
        const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const userId = this.getUserId();
        
        const order = {
            order_number: orderNumber,
            user_id: userId,
            user_name: orderData.fullName,
            user_email: orderData.email,
            user_phone: orderData.phone,
            delivery_address: orderData.address,
            payment_method: orderData.paymentMethod,
            total_amount: totalAmount,
            status: 'completed',
            created_at: new Date().toISOString()
        };
        
        try {
            // Save order
            const orderResponse = await fetch(`${CART_SUPABASE_URL}/rest/v1/orders`, {
                method: 'POST',
                headers: {
                    'apikey': CART_SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${CART_SUPABASE_ANON_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(order)
            });
            
            const savedOrder = await orderResponse.json();
            
            if (savedOrder && savedOrder[0]) {
                // Save order items
                const orderItems = cart.map(item => ({
                    order_id: savedOrder[0].id,
                    product_name: item.product_name,
                    price: item.price,
                    quantity: item.quantity,
                    selected_color: item.variation?.color || null,
                    selected_size: item.variation?.size || null
                }));
                
                await fetch(`${CART_SUPABASE_URL}/rest/v1/order_items`, {
                    method: 'POST',
                    headers: {
                        'apikey': CART_SUPABASE_ANON_KEY,
                        'Authorization': `Bearer ${CART_SUPABASE_ANON_KEY}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(orderItems)
                });
            }
            
            // Clear cart
            await this.clearCart();
            await this.updateCartDisplay();
            
            return { success: true, orderNumber: orderNumber };
        } catch (error) {
            console.error('Checkout error:', error);
            return { success: false, error: error.message };
        }
    }
};

// Override the main page addToCart function
function overrideAddToCartForSupabase() {
    if (typeof window.addToCart === 'function') {
        const originalAddToCart = window.addToCart;
        window.addToCart = async function(productId) {
            // Get product from original array
            const product = window.products?.find(p => p.id === productId);
            if (!product) return;
            
            await supabaseCart.addToCart(productId, product.name, product.price, 1, null);
            
            const toast = document.getElementById('toast');
            if (toast) {
                toast.innerText = `${product.name} added to cart!`;
                toast.style.opacity = '1';
                toast.style.visibility = 'visible';
                setTimeout(() => {
                    toast.style.opacity = '0';
                    toast.style.visibility = 'hidden';
                }, 2000);
            }
        };
        console.log('✅ Add to cart overridden to use Supabase');
    } else {
        setTimeout(overrideAddToCartForSupabase, 500);
    }
}

// Override the cart icon click
function overrideCartIcon() {
    const cartIcon = document.getElementById('cartIcon');
    const cartModal = document.getElementById('cartModal');
    
    if (cartIcon && !cartIcon._supabaseOverride) {
        cartIcon._supabaseOverride = true;
        const newCartIcon = cartIcon.cloneNode(true);
        cartIcon.parentNode.replaceChild(newCartIcon, cartIcon);
        
        newCartIcon.addEventListener('click', async () => {
            await supabaseCart.renderCartModal();
            if (cartModal) cartModal.style.display = 'flex';
        });
        
        window.cartIcon = newCartIcon;
    } else {
        setTimeout(overrideCartIcon, 500);
    }
}

// Override checkout form
function overrideCheckoutForm() {
    const checkoutForm = document.getElementById('checkoutForm');
    if (!checkoutForm) {
        setTimeout(overrideCheckoutForm, 500);
        return;
    }
    
    const newForm = checkoutForm.cloneNode(true);
    checkoutForm.parentNode.replaceChild(newForm, checkoutForm);
    
    newForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        const orderData = {
            fullName: document.querySelector('[name="fullName"]')?.value || 'Guest',
            email: document.querySelector('[name="email"]')?.value || '',
            phone: document.querySelector('[name="phone"]')?.value || '',
            address: document.querySelector('[name="address"]')?.value || '',
            paymentMethod: document.querySelector('[name="paymentMethod"]')?.value || 'Cash on Delivery'
        };
        
        const result = await supabaseCart.checkout(orderData);
        
        if (result.success) {
            alert('Order placed successfully! Order #: ' + result.orderNumber);
            
            const checkoutModal = document.getElementById('checkoutModal');
            if (checkoutModal) checkoutModal.style.display = 'none';
            newForm.reset();
            
            const cartModal = document.getElementById('cartModal');
            if (cartModal && cartModal.style.display === 'flex') {
                cartModal.style.display = 'none';
            }
        } else {
            alert('Error placing order: ' + result.error);
        }
    });
    
    console.log('✅ Checkout form overridden to use Supabase');
}

// Initialize
function initSupabaseCart() {
    overrideAddToCartForSupabase();
    overrideCartIcon();
    overrideCheckoutForm();
    supabaseCart.updateCartDisplay();
}

// Run when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSupabaseCart);
} else {
    initSupabaseCart();
}