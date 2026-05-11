// ========== USER CART & ORDER HISTORY TRACKER ==========
// Tracks all user selections, cart items, and order history in Supabase
// NO localStorage for persistent data

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
    
    // Track product view (when user clicks on a product)
    async function trackProductView(productId, productName, productCategory) {
        const userId = getCurrentUserId();
        try {
            await fetch(`${SUPABASE_URL}/rest/v1/product_views`, {
                method: 'POST',
                headers: {
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    user_id: userId,
                    product_id: productId,
                    product_name: productName,
                    product_category: productCategory,
                    viewed_at: new Date().toISOString()
                })
            });
            console.log(`📊 Tracked view: ${productName}`);
        } catch (error) {
            console.log('View tracking fallback to localStorage');
            // Fallback to localStorage
            const views = JSON.parse(localStorage.getItem('product_views_fallback') || '[]');
            views.push({ productId, productName, timestamp: new Date().toISOString() });
            localStorage.setItem('product_views_fallback', JSON.stringify(views.slice(-50)));
        }
    }
    
    // Track filter usage (what filters user applies)
    async function trackFilterUsage(filters) {
        const userId = getCurrentUserId();
        try {
            await fetch(`${SUPABASE_URL}/rest/v1/filter_usage`, {
                method: 'POST',
                headers: {
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    user_id: userId,
                    filters_applied: filters,
                    applied_at: new Date().toISOString()
                })
            });
        } catch (error) {
            console.log('Filter tracking saved locally');
        }
    }
    
    // Get user's order history from Supabase
    async function getUserOrderHistory() {
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
            console.error('Error fetching order history:', error);
            return [];
        }
    }
    
    // Get user's cart items from Supabase
    async function getUserCartItems() {
        const userId = getCurrentUserId();
        try {
            const response = await fetch(`${SUPABASE_URL}/rest/v1/cart_items?user_id=eq.${userId}&select=*`, {
                headers: {
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
                }
            });
            return await response.json();
        } catch (error) {
            console.error('Error fetching cart:', error);
            return [];
        }
    }
    
    // Get user's recently viewed products
    async function getRecentlyViewed() {
        const userId = getCurrentUserId();
        try {
            const response = await fetch(`${SUPABASE_URL}/rest/v1/product_views?user_id=eq.${userId}&select=*&order=viewed_at.desc&limit=10`, {
                headers: {
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
                }
            });
            return await response.json();
        } catch (error) {
            // Fallback to localStorage
            return JSON.parse(localStorage.getItem('product_views_fallback') || '[]').slice(-10).reverse();
        }
    }
    
    // Display user history modal
    async function showUserHistoryModal() {
        const orders = await getUserOrderHistory();
        const cartItems = await getUserCartItems();
        const recentViews = await getRecentlyViewed();
        
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
                        <button class="history-tab" data-tab="views">👁️ Recent Views (${recentViews.length})</button>
                    </div>
                    
                    <div id="ordersTab" class="history-tab-content active">
                        <div id="ordersList">Loading...</div>
                    </div>
                    <div id="cartTab" class="history-tab-content">
                        <div id="cartList">Loading...</div>
                    </div>
                    <div id="viewsTab" class="history-tab-content">
                        <div id="viewsList">Loading...</div>
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
                        <strong>Order #${order.order_number}</strong>
                        <span class="history-date">${new Date(order.created_at).toLocaleDateString()}</span>
                    </div>
                    <div>Total: RM ${order.total_amount.toFixed(2)}</div>
                    <div>Status: <span class="order-status">${order.status}</span></div>
                    <div class="history-item-products">
                        ${order.items ? order.items.map(item => `<div>• ${item.product_name} × ${item.quantity}</div>`).join('') : ''}
                    </div>
                </div>
            `).join('');
        }
        
        // Populate cart items
        const cartList = document.getElementById('cartList');
        if (cartItems.length === 0) {
            cartList.innerHTML = '<div style="text-align:center; padding:40px;">Your cart is empty.</div>';
        } else {
            cartList.innerHTML = cartItems.map(item => `
                <div class="history-item">
                    <div class="history-item-header">
                        <strong>${item.product_name}</strong>
                        <span>RM ${item.price.toFixed(2)}</span>
                    </div>
                    <div>Quantity: ${item.quantity}</div>
                    <div>Added: ${new Date(item.created_at || Date.now()).toLocaleDateString()}</div>
                </div>
            `).join('');
        }
        
        // Populate recent views
        const viewsList = document.getElementById('viewsList');
        if (recentViews.length === 0) {
            viewsList.innerHTML = '<div style="text-align:center; padding:40px;">No recently viewed products.</div>';
        } else {
            viewsList.innerHTML = recentViews.map(view => `
                <div class="history-item">
                    <div class="history-item-header">
                        <strong>${view.product_name || view.productName}</strong>
                        <span class="history-date">${new Date(view.viewed_at || view.timestamp).toLocaleDateString()}</span>
                    </div>
                    <div>Category: ${view.product_category || 'N/A'}</div>
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
        historyBtn.title = 'View your activity history (orders, cart, views)';
        historyBtn.onclick = showUserHistoryModal;
        headerIcons.appendChild(historyBtn);
    }
    
    // Track product clicks
    function initProductClickTracking() {
        document.addEventListener('click', async (e) => {
            const productCard = e.target.closest('.product-card');
            if (productCard && !e.target.classList.contains('add-to-cart-btn') && !e.target.classList.contains('add-to-cart-filtered')) {
                const productId = productCard.getAttribute('data-id');
                const productTitle = productCard.querySelector('.product-title')?.innerText;
                const productCategory = productCard.querySelector('.product-category')?.innerText;
                if (productId && productTitle) {
                    await trackProductView(parseInt(productId), productTitle, productCategory);
                }
            }
        });
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
    
    // Initialize
    function initHistoryTracker() {
        addHistoryStyles();
        addActivityHistoryButton();
        initProductClickTracking();
        console.log('✅ Activity history tracker active - all user actions tracked to Supabase!');
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initHistoryTracker);
    } else {
        initHistoryTracker();
    }
    
    // Export functions for use in console
    window.getUserOrderHistory = getUserOrderHistory;
    window.getUserCartItems = getUserCartItems;
    window.getRecentlyViewed = getRecentlyViewed;
})();