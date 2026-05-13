// ========== USER CART & ORDER HISTORY TRACKER ==========
// UPDATED: Reads from working cart system and localStorage orders

(function() {
    const SUPABASE_URL = 'https://fladlejtkgjzpehvzkub.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZsYWRsZWp0a2dqenBlaHZ6a3ViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgwODEwMTcsImV4cCI6MjA5MzY1NzAxN30.uzMR3lWl0GrKKIcpWZRDZ9ac1y_gdjOocAUweSSZMgI';
    
    let currentUserId = null;
    
    // Get or create user ID (persistent across sessions)
    function getCurrentUserId() {
        if (currentUserId) return currentUserId;
        
        // Check if user is logged in via Google
        const session = localStorage.getItem('sb_session');
        if (session) {
            try {
                const sessionData = JSON.parse(session);
                if (sessionData.user?.id) {
                    currentUserId = sessionData.user.id;
                    return currentUserId;
                }
            } catch(e) {}
        }
        
        // Check for existing user ID
        let userId = localStorage.getItem('seatask_persistent_user_id');
        if (!userId) {
            userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 16);
            localStorage.setItem('seatask_persistent_user_id', userId);
        }
        currentUserId = userId;
        return userId;
    }
    
    // Get user's order history from localStorage (since Supabase may not have orders)
    async function getUserOrderHistory() {
        // First try to get from localStorage
        const localOrders = JSON.parse(localStorage.getItem('order_history') || '[]');
        
        if (localOrders.length > 0) {
            console.log('Orders from localStorage:', localOrders.length);
            return localOrders;
        }
        
        // Fallback to Supabase if no localStorage orders
        const userId = getCurrentUserId();
        try {
            const response = await fetch(`${SUPABASE_URL}/rest/v1/orders?user_id=eq.${userId}&select=*&order=created_at.desc`, {
                headers: {
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
                }
            });
            const orders = await response.json();
            
            // Get order items for each order
            for (const order of orders) {
                const itemsResponse = await fetch(`${SUPABASE_URL}/rest/v1/order_items?order_id=eq.${order.id}&select=*`, {
                    headers: {
                        'apikey': SUPABASE_ANON_KEY,
                        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
                    }
                });
                order.items = await itemsResponse.json();
            }
            return orders;
        } catch (error) {
            console.error('Error fetching orders from Supabase:', error);
            return [];
        }
    }
    
    // Get user's cart items from WORKING CART SYSTEM (not Supabase)
    async function getUserCartItems() {
        // Read from the working cart system (same as main page)
        const CART_KEY = 'my_simple_cart';
        const savedCart = localStorage.getItem(CART_KEY);
        const cartItems = savedCart ? JSON.parse(savedCart) : [];
        
        console.log('Cart items from working cart:', cartItems.length);
        return cartItems;
    }
    
    // Display user history modal
    async function showUserHistoryModal() {
        const orders = await getUserOrderHistory();
        const cartItems = await getUserCartItems();
        
        let modal = document.getElementById('userHistoryModal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'userHistoryModal';
            modal.className = 'modal';
            modal.innerHTML = `
                <div class="modal-content history-modal" style="max-width: 800px;">
                    <span class="close-history-modal">&times;</span>
                    <h2>📊 My Activity History</h2>
                    
                    <div class="history-tabs">
                        <button class="history-tab active" data-tab="orders">🛒 Orders (${orders.length})</button>
                        <button class="history-tab" data-tab="cart">🛍️ Cart Items (${cartItems.length})</button>
                    </div>
                    
                    <div id="ordersTab" class="history-tab-content active">
                        <div id="ordersList">Loading...</div>
                    </div>
                    <div id="cartTab" class="history-tab-content">
                        <div id="cartList">Loading...</div>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
            
            const closeBtn = modal.querySelector('.close-history-modal');
            closeBtn.onclick = () => modal.style.display = 'none';
            
            // Tab switching
            modal.querySelectorAll('.history-tab').forEach(tab => {
                tab.addEventListener('click', () => {
                    modal.querySelectorAll('.history-tab').forEach(t => t.classList.remove('active'));
                    modal.querySelectorAll('.history-tab-content').forEach(c => c.classList.remove('active'));
                    tab.classList.add('active');
                    const tabId = tab.dataset.tab + 'Tab';
                    document.getElementById(tabId).classList.add('active');
                });
            });
            
            window.onclick = (e) => {
                if (e.target === modal) modal.style.display = 'none';
            };
        }
        
        modal.style.display = 'flex';
        
        // Populate orders
        const ordersList = document.getElementById('ordersList');
        if (orders.length === 0) {
            ordersList.innerHTML = '<div style="text-align:center; padding:40px;">No orders yet. Start shopping!</div>';
        } else {
            ordersList.innerHTML = orders.map(order => `
                <div class="history-item">
                    <div class="history-item-header">
                        <strong>${order.order_number || 'Order'}</strong>
                        <span class="history-date">${new Date(order.date || order.created_at).toLocaleDateString()}</span>
                    </div>
                    <div>Total: RM ${(order.total || order.total_amount || 0).toFixed(2)}</div>
                    <div>Status: <span class="order-status">${order.status || 'completed'}</span></div>
                    <div class="history-item-products">
                        ${order.order_items ? order.order_items.map(item => `<div>• ${item.product_name} × ${item.quantity}</div>`).join('') : ''}
                    </div>
                </div>
            `).join('');
        }
        
        // Populate cart items from WORKING CART
        const cartList = document.getElementById('cartList');
        if (cartItems.length === 0) {
            cartList.innerHTML = '<div style="text-align:center; padding:40px;">Your cart is empty.</div>';
        } else {
            cartList.innerHTML = cartItems.map(item => `
                <div class="history-item">
                    <div class="history-item-header">
                        <strong>${item.name}</strong>
                        <span>RM ${item.price.toFixed(2)}</span>
                    </div>
                    <div>Quantity: ${item.quantity}</div>
                    <div>Added: ${new Date(item.addedAt || Date.now()).toLocaleDateString()}</div>
                </div>
            `).join('');
        }
    }
    
    // Add history button to header
    function addActivityHistoryButton() {
        const headerIcons = document.querySelector('.header-icons');
        if (!headerIcons) return;
        if (document.querySelector('.activity-history-btn')) return;
        
        const historyBtn = document.createElement('div');
        historyBtn.className = 'activity-history-btn';
        historyBtn.innerHTML = '📊 Activity';
        historyBtn.style.cssText = `
            font-size: 14px;
            cursor: pointer;
            background: rgba(255,255,255,0.15);
            padding: 8px 16px;
            border-radius: 30px;
            transition: 0.2s;
            display: flex;
            align-items: center;
            gap: 5px;
        `;
        historyBtn.title = 'View your activity history (orders, cart)';
        historyBtn.onclick = showUserHistoryModal;
        headerIcons.appendChild(historyBtn);
    }
    
    // Add styles for history modal
    function addHistoryStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .history-modal {
                max-width: 800px !important;
            }
            .history-tabs {
                display: flex;
                gap: 10px;
                border-bottom: 1px solid #e0eef5;
                margin: 20px 0;
            }
            .history-tab {
                padding: 10px 20px;
                background: none;
                border: none;
                cursor: pointer;
                font-size: 14px;
                color: #7a8e9c;
                transition: 0.2s;
            }
            .history-tab.active {
                color: #1976a5;
                border-bottom: 2px solid #1976a5;
            }
            .history-tab-content {
                display: none;
                max-height: 500px;
                overflow-y: auto;
            }
            .history-tab-content.active {
                display: block;
            }
            .history-item {
                border: 1px solid #e0eef5;
                border-radius: 12px;
                padding: 15px;
                margin-bottom: 15px;
                background: #f5f8fa;
            }
            .history-item-header {
                display: flex;
                justify-content: space-between;
                margin-bottom: 10px;
            }
            .history-date {
                font-size: 12px;
                color: #7a8e9c;
            }
            .order-status {
                background: #22c55e;
                color: white;
                padding: 2px 10px;
                border-radius: 20px;
                font-size: 11px;
            }
            .history-item-products {
                margin-top: 10px;
                padding-top: 10px;
                border-top: 1px solid #e0eef5;
                font-size: 13px;
            }
            .activity-history-btn:hover {
                background: rgba(255,255,255,0.3);
            }
        `;
        document.head.appendChild(style);
    }
    
    // Save order to history when checkout is completed
    function saveOrderToHistory(orderData) {
        const orderHistory = JSON.parse(localStorage.getItem('order_history') || '[]');
        orderHistory.unshift({
            order_number: orderData.order_number,
            date: new Date().toISOString(),
            total: orderData.total_amount,
            status: 'completed',
            order_items: orderData.order_items
        });
        // Keep only last 20 orders
        localStorage.setItem('order_history', JSON.stringify(orderHistory.slice(0, 20)));
    }
    
    // Hook into checkout form to save orders
    function hookCheckoutForOrderHistory() {
        const checkoutForm = document.getElementById('checkoutForm');
        if (!checkoutForm) {
            setTimeout(hookCheckoutForOrderHistory, 500);
            return;
        }
        
        const originalSubmit = checkoutForm.onsubmit;
        checkoutForm.addEventListener('submit', function(e) {
            // Get cart items before they are cleared
            const CART_KEY = 'my_simple_cart';
            const cart = JSON.parse(localStorage.getItem(CART_KEY) || '[]');
            
            if (cart.length > 0) {
                const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                const orderNumber = 'ORD-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6).toUpperCase();
                const fullName = document.querySelector('[name="fullName"]')?.value || 'Guest';
                
                saveOrderToHistory({
                    order_number: orderNumber,
                    total_amount: totalAmount,
                    order_items: cart.map(item => ({
                        product_name: item.name,
                        quantity: item.quantity,
                        price: item.price
                    }))
                });
                
                console.log('✅ Order saved to history:', orderNumber);
            }
        });
    }
    
    // Initialize
    function initHistoryTracker() {
        addHistoryStyles();
        addActivityHistoryButton();
        hookCheckoutForOrderHistory();
        console.log('✅ Activity history tracker active - reads from working cart and localStorage orders!');
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initHistoryTracker);
    } else {
        initHistoryTracker();
    }
    
    // Export functions for use in console
    window.getUserOrderHistory = getUserOrderHistory;
    window.getUserCartItems = getUserCartItems;
})();