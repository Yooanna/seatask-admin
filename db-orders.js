// ========== SAVE ORDERS TO SUPABASE ==========
// This saves orders when user checks out

(function() {
    // Function to save order to Supabase
    async function saveOrderToSupabase(orderData, cartItems) {
        try {
            // Save order
            const orderResponse = await fetch(`${supabaseDB.url}/rest/v1/orders`, {
                method: 'POST',
                headers: {
                    'apikey': supabaseDB.key,
                    'Authorization': `Bearer ${supabaseDB.key}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(orderData)
            });
            
            const savedOrder = await orderResponse.json();
            console.log('Order saved:', savedOrder);
            
            if (savedOrder && savedOrder[0]) {
                // Save order items
                const orderItems = cartItems.map(item => ({
                    order_id: savedOrder[0].id,
                    product_name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                    selected_color: item.variation?.color || null,
                    selected_size: item.variation?.size || null
                }));
                
                await fetch(`${supabaseDB.url}/rest/v1/order_items`, {
                    method: 'POST',
                    headers: {
                        'apikey': supabaseDB.key,
                        'Authorization': `Bearer ${supabaseDB.key}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(orderItems)
                });
                
                console.log('Order items saved:', orderItems.length);
                
                // Also save to localStorage for history display
                const orderHistory = JSON.parse(localStorage.getItem('order_history')) || [];
                orderHistory.unshift({
                    order_number: orderData.order_number,
                    date: new Date().toISOString(),
                    total: orderData.total_amount,
                    items: cartItems.length,
                    status: 'completed',
                    order_items: orderItems
                });
                localStorage.setItem('order_history', JSON.stringify(orderHistory.slice(0, 20)));
                
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error saving order:', error);
            return false;
        }
    }
    
    // Wait for checkout form to exist and add our save function
    function setupCheckoutSave() {
        const checkoutForm = document.getElementById('checkoutForm');
        if (!checkoutForm) {
            setTimeout(setupCheckoutSave, 500);
            return;
        }
        
        // Check if already hooked
        if (checkoutForm.hasSupabaseHook) return;
        checkoutForm.hasSupabaseHook = true;
        
        // Save original submit
        const originalSubmit = checkoutForm.onsubmit;
        
        // Add our save before original
        checkoutForm.addEventListener('submit', async function(e) {
            // Get cart from localStorage
            const cart = JSON.parse(localStorage.getItem('cart')) || [];
            
            if (cart.length === 0) return;
            
            // Calculate total
            const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            
            // Generate order number
            const orderNumber = 'ORD-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6).toUpperCase();
            
            // Get user info from form
            const fullName = document.querySelector('[name="fullName"]')?.value || 'Guest';
            const email = document.querySelector('[name="email"]')?.value || '';
            const phone = document.querySelector('[name="phone"]')?.value || '';
            const address = document.querySelector('[name="address"]')?.value || '';
            const paymentMethod = document.querySelector('[name="paymentMethod"]')?.value || '';
            
            // Get user ID
            const userId = supabaseDB.getCurrentUserId();
            
            // Prepare order data
            const orderData = {
                order_number: orderNumber,
                user_id: userId,
                user_name: fullName,
                user_email: email,
                user_phone: phone,
                delivery_address: address,
                payment_method: paymentMethod,
                total_amount: totalAmount,
                status: 'completed',
                created_at: new Date().toISOString()
            };
            
            // Save to Supabase (don't block the UI)
            await saveOrderToSupabase(orderData, cart);
            
            console.log('✅ Order saved! Order #:', orderNumber);
        });
    }
    
    // Also override the existing checkout button to ensure it saves
    function setupCheckoutButton() {
        const checkoutBtn = document.getElementById('checkoutBtn');
        if (!checkoutBtn) {
            setTimeout(setupCheckoutButton, 500);
            return;
        }
        
        if (checkoutBtn.hasSaveHook) return;
        checkoutBtn.hasSaveHook = true;
        
        // Store the original onclick
        const originalClick = checkoutBtn.onclick;
        
        checkoutBtn.addEventListener('click', async function() {
            // Just log - the actual save happens on form submit
            console.log('Checkout button clicked - order will be saved on form submit');
        });
    }
    
    // Initialize
    function init() {
        setTimeout(setupCheckoutSave, 1000);
        setTimeout(setupCheckoutButton, 1000);
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();