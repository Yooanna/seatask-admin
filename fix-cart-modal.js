// ========== FIXED CART MODAL - WORKING VERSION ==========

(function() {
    const SUPABASE_URL = 'https://fladlejtkgjzpehvzkub.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZsYWRsZWp0a2dqenBlaHZ6a3ViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgwODEwMTcsImV4cCI6MjA5MzY1NzAxN30.uzMR3lWl0GrKKIcpWZRDZ9ac1y_gdjOocAUweSSZMgI';
    
    let currentCart = [];
    let currentUserId = null;
    
    function getUserId() {
        if (currentUserId) return currentUserId;
        let userId = localStorage.getItem('seatask_cart_user_id');
        if (!userId) {
            userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('seatask_cart_user_id', userId);
        }
        currentUserId = userId;
        return userId;
    }
    
    async function loadCart() {
        const userId = getUserId();
        try {
            const response = await fetch(`${SUPABASE_URL}/rest/v1/cart_items?user_id=eq.${userId}&select=*`, {
                headers: {
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
                }
            });
            currentCart = await response.json();
            updateCartCount();
            return currentCart;
        } catch (error) {
            console.error('Error loading cart:', error);
            currentCart = [];
            return [];
        }
    }
    
    function updateCartCount() {
        const totalItems = currentCart.reduce((sum, item) => sum + (item.quantity || 1), 0);
        const cartCountSpans = document.querySelectorAll('#cartCount');
        cartCountSpans.forEach(span => {
            if (span) span.innerText = totalItems;
        });
    }
    
    async function addToCart(productId, productName, productPrice) {
        const userId = getUserId();
        
        try {
            // Check if item exists
            const checkResponse = await fetch(`${SUPABASE_URL}/rest/v1/cart_items?user_id=eq.${userId}&product_id=eq.${productId}&select=*`, {
                headers: {
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
                }
            });
            const existing = await checkResponse.json();
            
            if (existing && existing.length > 0) {
                // Update quantity
                const newQuantity = existing[0].quantity + 1;
                await fetch(`${SUPABASE_URL}/rest/v1/cart_items?id=eq.${existing[0].id}`, {
                    method: 'PATCH',
                    headers: {
                        'apikey': SUPABASE_ANON_KEY,
                        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ quantity: newQuantity })
                });
            } else {
                // Add new item
                await fetch(`${SUPABASE_URL}/rest/v1/cart_items`, {
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
                        price: productPrice,
                        quantity: 1,
                        variation: null
                    })
                });
            }
            
            await loadCart();
            
            const toast = document.getElementById('toast');
            if (toast) {
                toast.innerText = `${productName} added to cart! 🛒`;
                toast.style.opacity = '1';
                toast.style.visibility = 'visible';
                setTimeout(() => {
                    toast.style.opacity = '0';
                    toast.style.visibility = 'hidden';
                }, 2000);
            }
            return true;
        } catch (error) {
            console.error('Error adding to cart:', error);
            alert('Error adding to cart. Please try again.');
            return false;
        }
    }
    
    async function renderCartModal() {
        const cartItemsDiv = document.getElementById('cartItems');
        const cartTotalSpan = document.getElementById('cartTotal');
        
        if (!cartItemsDiv) return;
        
        await loadCart();
        
        if (!currentCart || currentCart.length === 0) {
            cartItemsDiv.innerHTML = '<p style="text-align:center; padding:20px;">Your cart is empty. 🛒</p>';
            if (cartTotalSpan) cartTotalSpan.innerText = '0.00';
            return;
        }
        
        cartItemsDiv.innerHTML = '';
        let total = 0;
        
        for (let i = 0; i < currentCart.length; i++) {
            const item = currentCart[i];
            total += item.price * item.quantity;
            
            const itemDiv = document.createElement('div');
            itemDiv.style.cssText = 'display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #e0eef5;';
            itemDiv.innerHTML = `
                <div style="flex:1;">
                    <div style="font-weight: 500;">${item.product_name}</div>
                    <div style="font-size: 13px; color: #1976a5;">RM ${item.price.toFixed(2)} each</div>
                </div>
                <div style="display: flex; align-items: center; gap: 10px;">
                    <button class="cart-update-btn" data-id="${item.id}" data-action="decr" style="background:#e0eef5; border:none; width:28px; height:28px; border-radius:50%; cursor:pointer;">-</button>
                    <span>${item.quantity}</span>
                    <button class="cart-update-btn" data-id="${item.id}" data-action="incr" style="background:#e0eef5; border:none; width:28px; height:28px; border-radius:50%; cursor:pointer;">+</button>
                    <button class="cart-update-btn" data-id="${item.id}" data-action="remove" style="background:#ff6b6b; border:none; width:28px; height:28px; border-radius:50%; cursor:pointer; color:white;">🗑</button>
                </div>
            `;
            cartItemsDiv.appendChild(itemDiv);
        }
        
        if (cartTotalSpan) cartTotalSpan.innerText = total.toFixed(2);
        
        // Add event listeners
        document.querySelectorAll('.cart-update-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const id = parseInt(btn.dataset.id);
                const action = btn.dataset.action;
                const item = currentCart.find(i => i.id === id);
                
                if (action === 'remove') {
                    await fetch(`${SUPABASE_URL}/rest/v1/cart_items?id=eq.${id}`, {
                        method: 'DELETE',
                        headers: {
                            'apikey': SUPABASE_ANON_KEY,
                            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
                        }
                    });
                } else if (action === 'incr') {
                    await fetch(`${SUPABASE_URL}/rest/v1/cart_items?id=eq.${id}`, {
                        method: 'PATCH',
                        headers: {
                            'apikey': SUPABASE_ANON_KEY,
                            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ quantity: item.quantity + 1 })
                    });
                } else if (action === 'decr') {
                    if (item.quantity > 1) {
                        await fetch(`${SUPABASE_URL}/rest/v1/cart_items?id=eq.${id}`, {
                            method: 'PATCH',
                            headers: {
                                'apikey': SUPABASE_ANON_KEY,
                                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({ quantity: item.quantity - 1 })
                        });
                    } else {
                        await fetch(`${SUPABASE_URL}/rest/v1/cart_items?id=eq.${id}`, {
                            method: 'DELETE',
                            headers: {
                                'apikey': SUPABASE_ANON_KEY,
                                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
                            }
                        });
                    }
                }
                await renderCartModal();
            });
        });
    }
    
    // Hook all Add to Cart buttons
    function hookAddToCartButtons() {
        const buttons = document.querySelectorAll('.add-to-cart-btn, .add-to-cart-filtered, .add-to-cart-detail, .add-to-cart-btn.supabase');
        
        buttons.forEach(btn => {
            if (btn.getAttribute('data-hooked') === 'true') return;
            
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);
            newBtn.setAttribute('data-hooked', 'true');
            
            newBtn.addEventListener('click', async (e) => {
                e.stopPropagation();
                e.preventDefault();
                
                let productId = newBtn.getAttribute('data-id');
                let productName = newBtn.getAttribute('data-name');
                let productPrice = newBtn.getAttribute('data-price');
                
                if (!productId || !productName) {
                    const card = newBtn.closest('.product-card');
                    if (card) {
                        productId = card.getAttribute('data-id');
                        const titleEl = card.querySelector('.product-title');
                        const priceEl = card.querySelector('.product-price');
                        if (titleEl) productName = titleEl.innerText;
                        if (priceEl) productPrice = parseFloat(priceEl.innerText.replace('RM', ''));
                    }
                }
                
                if (productId && productName && productPrice) {
                    await addToCart(parseInt(productId), productName, parseFloat(productPrice));
                } else {
                    console.error('Cannot add to cart - missing product info');
                }
            });
        });
    }
    
    // Hook cart icon
    function hookCartIcon() {
        const cartIcon = document.getElementById('cartIcon');
        const cartModal = document.getElementById('cartModal');
        
        if (cartIcon && !cartIcon.getAttribute('data-hooked')) {
            const newIcon = cartIcon.cloneNode(true);
            cartIcon.parentNode.replaceChild(newIcon, cartIcon);
            newIcon.setAttribute('data-hooked', 'true');
            
            newIcon.addEventListener('click', async (e) => {
                e.preventDefault();
                e.stopPropagation();
                await renderCartModal();
                if (cartModal) cartModal.style.display = 'flex';
            });
        }
    }
    
    // Hook checkout button
    function hookCheckoutButton() {
        const checkoutBtn = document.getElementById('checkoutBtn');
        const cartModal = document.getElementById('cartModal');
        const checkoutModal = document.getElementById('checkoutModal');
        
        if (checkoutBtn && !checkoutBtn.getAttribute('data-hooked')) {
            const newBtn = checkoutBtn.cloneNode(true);
            checkoutBtn.parentNode.replaceChild(newBtn, checkoutBtn);
            newBtn.setAttribute('data-hooked', 'true');
            
            newBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                e.stopPropagation();
                await loadCart();
                
                if (currentCart.length === 0) {
                    const toast = document.getElementById('toast');
                    if (toast) {
                        toast.innerText = 'Cart is empty! Add items first.';
                        toast.style.opacity = '1';
                        toast.style.visibility = 'visible';
                        setTimeout(() => {
                            toast.style.opacity = '0';
                            toast.style.visibility = 'hidden';
                        }, 2000);
                    }
                    return;
                }
                if (cartModal) cartModal.style.display = 'none';
                if (checkoutModal) checkoutModal.style.display = 'flex';
            });
        }
    }
    
    // Hook checkout form
    function hookCheckoutForm() {
        const form = document.getElementById('checkoutForm');
        if (!form || form.getAttribute('data-hooked') === 'true') return;
        
        const newForm = form.cloneNode(true);
        form.parentNode.replaceChild(newForm, form);
        newForm.setAttribute('data-hooked', 'true');
        
        newForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const userId = getUserId();
            await loadCart();
            
            if (currentCart.length === 0) {
                alert('Cart is empty!');
                return;
            }
            
            const totalAmount = currentCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            const orderNumber = 'ORD-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6).toUpperCase();
            
            const fullName = document.querySelector('[name="fullName"]')?.value || 'Guest';
            const email = document.querySelector('[name="email"]')?.value || '';
            const phone = document.querySelector('[name="phone"]')?.value || '';
            const address = document.querySelector('[name="address"]')?.value || '';
            const paymentMethod = document.querySelector('[name="paymentMethod"]')?.value || 'Cash on Delivery';
            
            try {
                // Save order
                const orderResponse = await fetch(`${SUPABASE_URL}/rest/v1/orders`, {
                    method: 'POST',
                    headers: {
                        'apikey': SUPABASE_ANON_KEY,
                        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
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
                    })
                });
                
                const savedOrder = await orderResponse.json();
                
                if (savedOrder && savedOrder[0]) {
                    const orderItems = currentCart.map(item => ({
                        order_id: savedOrder[0].id,
                        product_name: item.product_name,
                        price: item.price,
                        quantity: item.quantity
                    }));
                    
                    await fetch(`${SUPABASE_URL}/rest/v1/order_items`, {
                        method: 'POST',
                        headers: {
                            'apikey': SUPABASE_ANON_KEY,
                            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(orderItems)
                    });
                }
                
                // Clear cart
                await fetch(`${SUPABASE_URL}/rest/v1/cart_items?user_id=eq.${userId}`, {
                    method: 'DELETE',
                    headers: {
                        'apikey': SUPABASE_ANON_KEY,
                        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
                    }
                });
                
                await loadCart();
                
                alert('Order placed successfully! Order #: ' + orderNumber);
                
                const checkoutModal = document.getElementById('checkoutModal');
                if (checkoutModal) checkoutModal.style.display = 'none';
                newForm.reset();
                
                const cartModal = document.getElementById('cartModal');
                if (cartModal && cartModal.style.display === 'flex') {
                    cartModal.style.display = 'none';
                }
                
            } catch (error) {
                console.error('Checkout error:', error);
                alert('Error placing order: ' + error.message);
            }
        });
    }
    
    // Initialize everything
    function init() {
        hookAddToCartButtons();
        hookCartIcon();
        hookCheckoutButton();
        hookCheckoutForm();
        loadCart();
        
        // Watch for new products being added
        const observer = new MutationObserver(() => {
            hookAddToCartButtons();
        });
        observer.observe(document.body, { childList: true, subtree: true });
        
        console.log('✅ Cart system fixed and ready!');
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();