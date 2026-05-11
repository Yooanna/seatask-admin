// ========== CUSTOMER ORDER HISTORY ==========
// This shows order history from localStorage (since Supabase might not have data)

(function() {
    // Add History button to header
    function addHistoryButton() {
        const headerIcons = document.querySelector('.header-icons');
        if (!headerIcons) return;
        
        if (document.querySelector('.history-icon')) return;
        
        const historyBtn = document.createElement('div');
        historyBtn.className = 'history-icon';
        historyBtn.innerHTML = '📋 History';
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
        historyBtn.title = 'View your order history';
        
        historyBtn.onmouseover = () => historyBtn.style.background = 'rgba(255,255,255,0.3)';
        historyBtn.onmouseout = () => historyBtn.style.background = 'rgba(255,255,255,0.15)';
        
        historyBtn.onclick = showOrderHistoryModal;
        
        headerIcons.appendChild(historyBtn);
    }
    
    // Show order history modal
    async function showOrderHistoryModal() {
        // Try to get orders from Supabase first
        let orders = [];
        let fromSupabase = false;
        
        try {
            const userId = supabaseDB.getCurrentUserId();
            const supabaseOrders = await supabaseDB.getOrderHistory(userId);
            if (supabaseOrders && supabaseOrders.length > 0) {
                orders = supabaseOrders;
                fromSupabase = true;
                console.log('Orders from Supabase:', orders.length);
            }
        } catch(e) {
            console.log('Supabase orders not available, using localStorage');
        }
        
        // Fallback to localStorage
        if (orders.length === 0) {
            const localOrders = JSON.parse(localStorage.getItem('order_history')) || [];
            if (localOrders.length > 0) {
                orders = localOrders;
                console.log('Orders from localStorage:', orders.length);
            }
        }
        
        // Create modal if not exists
        let modal = document.getElementById('orderHistoryModal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'orderHistoryModal';
            modal.className = 'modal';
            modal.innerHTML = `
                <div class="modal-content history-modal-content" style="max-width: 700px;">
                    <span class="close-history" style="position: absolute; right: 20px; top: 15px; font-size: 28px; cursor: pointer;">&times;</span>
                    <h2>📋 My Order History</h2>
                    <div id="orderHistoryList" style="max-height: 500px; overflow-y: auto; margin-top: 20px;">
                        Loading...
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
            
            const closeBtn = modal.querySelector('.close-history');
            closeBtn.onclick = () => modal.style.display = 'none';
            
            window.onclick = (e) => {
                if (e.target === modal) modal.style.display = 'none';
            };
        }
        
        modal.style.display = 'flex';
        
        const orderListDiv = document.getElementById('orderHistoryList');
        
        if (orders.length === 0) {
            orderListDiv.innerHTML = `
                <div style="text-align:center; padding:40px;">
                    <div style="font-size: 48px; margin-bottom: 15px;">📭</div>
                    <h3>No orders yet</h3>
                    <p style="color: #7a8e9c;">Your order history will appear here after you complete a purchase.</p>
                    <button onclick="document.getElementById('orderHistoryModal').style.display='none'" style="margin-top: 20px; background: #1976a5; color: white; border: none; padding: 10px 24px; border-radius: 30px; cursor: pointer;">Continue Shopping</button>
                </div>
            `;
            return;
        }
        
        // Build HTML for orders
        let html = '<div style="display: flex; flex-direction: column; gap: 15px;">';
        
        for (const order of orders) {
            let orderItems = [];
            
            // Get order items
            if (fromSupabase && order.id) {
                try {
                    const items = await supabaseDB.getOrderItems(order.id);
                    orderItems = items;
                } catch(e) {}
            } else if (order.order_items) {
                orderItems = order.order_items;
            }
            
            const orderDate = order.created_at ? new Date(order.created_at).toLocaleDateString() : 
                             order.date ? new Date(order.date).toLocaleDateString() : 
                             'Unknown date';
            
            html += `
                <div style="border: 1px solid #e0eef5; border-radius: 12px; padding: 15px; background: #f5f8fa;">
                    <div style="display: flex; justify-content: space-between; flex-wrap: wrap; margin-bottom: 10px;">
                        <div>
                            <strong style="color: #1976a5;">${order.order_number || 'N/A'}</strong>
                            <div style="font-size: 11px; color: #7a8e9c;">${orderDate}</div>
                        </div>
                        <div style="text-align: right;">
                            <span style="background: #22c55e; color: white; padding: 2px 10px; border-radius: 20px; font-size: 11px;">${order.status || 'completed'}</span>
                            <div style="font-weight: bold; color: #1976a5; margin-top: 5px;">RM ${(order.total_amount || order.total || 0).toFixed(2)}</div>
                        </div>
                    </div>
                    <div style="border-top: 1px solid #e0eef5; padding-top: 10px; margin-top: 5px;">
                        <div style="font-size: 12px; color: #1a3a5c; margin-bottom: 8px;">📦 Items (${orderItems.length || order.items || 0}):</div>
                        <div style="font-size: 12px; color: #4a627a;">
                            ${orderItems.map(item => `• ${item.product_name} × ${item.quantity} <span style="color: #1976a5;">(RM ${(item.price * item.quantity).toFixed(2)})</span>`).join('<br>')}
                        </div>
                    </div>
                </div>
            `;
        }
        
        html += '</div>';
        orderListDiv.innerHTML = html;
    }
    
    // Add styles
    function addHistoryStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .history-icon {
                font-size: 14px !important;
            }
            .history-modal-content {
                max-width: 700px !important;
            }
            @media (max-width: 768px) {
                .history-icon {
                    font-size: 12px !important;
                    padding: 6px 12px !important;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Initialize
    function initOrderHistory() {
        addHistoryStyles();
        addHistoryButton();
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initOrderHistory);
    } else {
        initOrderHistory();
    }
    
    console.log('✅ Order history feature active - click "History" button to see your orders!');
})();