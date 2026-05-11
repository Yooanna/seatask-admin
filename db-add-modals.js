// ========== ADD MISSING MODALS TO PRODUCT DETAIL PAGE ==========
// This file injects cart modal and checkout modal into product-detail.html
// Your original product-detail.html remains UNCHANGED

(function() {
    // Check if we're on product detail page
    if (!window.location.pathname.includes('product-detail.html')) {
        return;
    }
    
    // Function to add missing modals
    function addMissingModals() {
        // Check if cart modal already exists
        if (document.getElementById('cartModal')) {
            console.log('✅ Modals already exist');
            return;
        }
        
        // Create cart modal
        const cartModal = document.createElement('div');
        cartModal.id = 'cartModal';
        cartModal.className = 'modal';
        cartModal.innerHTML = `
            <div class="modal-content">
                <span class="close">&times;</span>
                <h2>Your Shopping Cart</h2>
                <div id="cartItems"></div>
                <div class="cart-summary">
                    <div class="cart-total">Total: RM <span id="cartTotal">0.00</span></div>
                    <div class="cart-actions">
                        <button id="continueShoppingBtn" class="btn-secondary">Continue Shopping</button>
                        <button id="checkoutBtn" class="btn-primary">Proceed to Checkout</button>
                    </div>
                </div>
            </div>
        `;
        
        // Create checkout modal
        const checkoutModal = document.createElement('div');
        checkoutModal.id = 'checkoutModal';
        checkoutModal.className = 'modal';
        checkoutModal.innerHTML = `
            <div class="modal-content">
                <span class="close-checkout">&times;</span>
                <h2>Complete Your Order</h2>
                <form id="checkoutForm">
                    <div class="form-group">
                        <input type="text" name="fullName" placeholder="Full Name" required>
                    </div>
                    <div class="form-group">
                        <input type="email" name="email" placeholder="Email Address" required>
                    </div>
                    <div class="form-group">
                        <input type="tel" name="phone" placeholder="Phone Number" required>
                    </div>
                    <div class="form-group">
                        <input type="text" name="address" placeholder="Delivery Address" required>
                    </div>
                    <div class="form-group">
                        <select name="paymentMethod" required>
                            <option value="">Select Payment Method</option>
                            <option>Credit / Debit Card</option>
                            <option>Sea-Pay Wallet</option>
                            <option>Cash on Delivery</option>
                        </select>
                    </div>
                    <button type="submit" class="btn-submit">Place Order</button>
                </form>
            </div>
        `;
        
        // Create toast if not exists
        let toast = document.getElementById('toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'toast';
            toast.className = 'toast';
            document.body.appendChild(toast);
        }
        
        // Add modals to body
        document.body.appendChild(cartModal);
        document.body.appendChild(checkoutModal);
        
        console.log('✅ Cart and Checkout modals added to product detail page');
        
        // Initialize modal functionality
        initModalFunctionality();
    }
    
    // Function to get current cart (always fresh from localStorage)
    function getCurrentCart() {
        const cart = localStorage.getItem('cart');
        return cart ? JSON.parse(cart) : [];
    }
    
    // Function to render cart modal (UPDATED - always reads fresh cart)
    window.renderCartModal = window.renderCartModal || function() {
        const cart = getCurrentCart();
        const cartItemsDiv = document.getElementById('cartItems');
        if (!cartItemsDiv) return;
        
        console.log('Rendering cart with', cart.length, 'items');
        
        if (cart.length === 0) {
            cartItemsDiv.innerHTML = '<p style="text-align:center; padding:20px;">Your cart is empty. 🛒</p>';
            const cartTotalSpan = document.getElementById('cartTotal');
            if (cartTotalSpan) cartTotalSpan.innerText = '0.00';
            return;
        }
        
        cartItemsDiv.innerHTML = '';
        cart.forEach((item, index) => {
            const itemDiv = document.createElement('div');
            itemDiv.style.cssText = 'display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #e0eef5;';
            itemDiv.innerHTML = `
                <div style="flex:1;">
                    <div style="font-weight: 500;">${item.name}</div>
                    <div style="font-size: 13px; color: #1976a5;">RM ${item.price.toFixed(2)} each</div>
                    ${item.variation ? `<div style="font-size: 11px; color: #7a8e9c;">${item.variation.color ? `Color: ${item.variation.color}` : ''} ${item.variation.size ? `Size: ${item.variation.size}` : ''}</div>` : ''}
                </div>
                <div style="display: flex; align-items: center; gap: 10px;">
                    <button class="qty-btn" data-index="${index}" data-action="decr" style="background:#e0eef5; border:none; width:28px; height:28px; border-radius:50%; cursor:pointer;">-</button>
                    <span>${item.quantity}</span>
                    <button class="qty-btn" data-index="${index}" data-action="incr" style="background:#e0eef5; border:none; width:28px; height:28px; border-radius:50%; cursor:pointer;">+</button>
                    <button class="qty-btn" data-index="${index}" data-action="remove" style="background:#ff6b6b; border:none; width:28px; height:28px; border-radius:50%; cursor:pointer; color:white;">🗑</button>
                </div>
            `;
            cartItemsDiv.appendChild(itemDiv);
        });
        
        // Add event listeners to quantity buttons
        document.querySelectorAll('#cartItems .qty-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const idx = parseInt(btn.dataset.index);
                const action = btn.dataset.action;
                let cart = getCurrentCart();
                
                if (action === 'incr') {
                    cart[idx].quantity++;
                } else if (action === 'decr') {
                    cart[idx].quantity--;
                    if (cart[idx].quantity <= 0) cart.splice(idx, 1);
                } else if (action === 'remove') {
                    cart.splice(idx, 1);
                }
                
                localStorage.setItem('cart', JSON.stringify(cart));
                
                // Update cart count
                const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
                const cartCountSpan = document.getElementById('cartCount');
                if (cartCountSpan) cartCountSpan.innerText = totalItems;
                
                // Update total price
                const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                const cartTotalSpan = document.getElementById('cartTotal');
                if (cartTotalSpan) cartTotalSpan.innerText = totalPrice.toFixed(2);
                
                // Re-render cart modal
                if (typeof window.renderCartModal === 'function') {
                    window.renderCartModal();
                }
            });
        });
        
        // Update total price
        const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const cartTotalSpan = document.getElementById('cartTotal');
        if (cartTotalSpan) cartTotalSpan.innerText = totalPrice.toFixed(2);
    };
    
    // Function to update cart UI (UPDATED)
    window.updateCartUI = window.updateCartUI || function() {
        const cart = getCurrentCart();
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        const cartCountSpan = document.getElementById('cartCount');
        if (cartCountSpan) cartCountSpan.innerText = totalItems;
        
        const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const cartTotalSpan = document.getElementById('cartTotal');
        if (cartTotalSpan) cartTotalSpan.innerText = totalPrice.toFixed(2);
    };
    
    // Function to add to cart (UPDATED)
    window.addToCartDetail = window.addToCartDetail || function(productId, productName, productPrice, quantity, variation) {
        let cart = getCurrentCart();
        const variationKey = variation ? JSON.stringify(variation) : 'null';
        const existingIndex = cart.findIndex(item => 
            item.id === productId && JSON.stringify(item.variation || null) === variationKey
        );
        
        if (existingIndex !== -1) {
            cart[existingIndex].quantity += quantity;
        } else {
            cart.push({
                id: productId,
                name: productName,
                price: productPrice,
                quantity: quantity,
                variation: variation || null
            });
        }
        
        localStorage.setItem('cart', JSON.stringify(cart));
        
        // Update UI
        window.updateCartUI();
        
        // Show toast
        const toast = document.getElementById('toast');
        if (toast) {
            toast.innerText = `${productName} added to cart!`;
            toast.style.opacity = '1';
            toast.style.visibility = 'visible';
            setTimeout(() => {
                toast.style.opacity = '0';
                toast.style.visibility = 'hidden';
            }, 2000);
        }
        
        console.log('Cart now has', getCurrentCart().length, 'items');
    };
    
    // Initialize modal functionality
    function initModalFunctionality() {
        const cartModal = document.getElementById('cartModal');
        const checkoutModal = document.getElementById('checkoutModal');
        const cartIcon = document.getElementById('cartIcon');
        
        // Close buttons
        const closeBtn = document.querySelector('#cartModal .close');
        const closeCheckout = document.querySelector('#checkoutModal .close-checkout');
        const continueBtn = document.getElementById('continueShoppingBtn');
        const checkoutBtn = document.getElementById('checkoutBtn');
        
        // Open cart modal when cart icon clicked
        if (cartIcon && !cartIcon.hasCartListener) {
            cartIcon.hasCartListener = true;
            cartIcon.addEventListener('click', () => {
                console.log('Cart icon clicked, rendering cart...');
                if (typeof window.renderCartModal === 'function') {
                    window.renderCartModal();
                }
                if (cartModal) cartModal.style.display = 'flex';
            });
        }
        
        // Close buttons
        if (closeBtn) {
            closeBtn.onclick = () => { if (cartModal) cartModal.style.display = 'none'; };
        }
        if (closeCheckout) {
            closeCheckout.onclick = () => { if (checkoutModal) checkoutModal.style.display = 'none'; };
        }
        if (continueBtn) {
            continueBtn.onclick = () => { if (cartModal) cartModal.style.display = 'none'; };
        }
        
        // Checkout button
        if (checkoutBtn && !checkoutBtn.hasListener) {
            checkoutBtn.hasListener = true;
            checkoutBtn.addEventListener('click', () => {
                const cart = getCurrentCart();
                if (cart.length === 0) {
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
        
        // Checkout form submission
        const checkoutForm = document.getElementById('checkoutForm');
        if (checkoutForm && !checkoutForm.hasListener) {
            checkoutForm.hasListener = true;
            checkoutForm.addEventListener('submit', (e) => {
                e.preventDefault();
                
                // Clear cart
                localStorage.setItem('cart', JSON.stringify([]));
                
                // Update cart UI
                if (typeof window.updateCartUI === 'function') {
                    window.updateCartUI();
                }
                const cartCountSpan = document.getElementById('cartCount');
                if (cartCountSpan) cartCountSpan.innerText = '0';
                
                // Show success message
                const toast = document.getElementById('toast');
                if (toast) {
                    toast.innerText = 'Order placed successfully! Thank you for shopping at SeaTask.';
                    toast.style.opacity = '1';
                    toast.style.visibility = 'visible';
                    setTimeout(() => {
                        toast.style.opacity = '0';
                        toast.style.visibility = 'hidden';
                    }, 3000);
                }
                
                // Close modal and reset form
                if (checkoutModal) checkoutModal.style.display = 'none';
                checkoutForm.reset();
            });
        }
        
        // Close modals when clicking outside
        window.addEventListener('click', (e) => {
            if (cartModal && e.target === cartModal) cartModal.style.display = 'none';
            if (checkoutModal && e.target === checkoutModal) checkoutModal.style.display = 'none';
        });
    }
    
    // Wait for page to load then add modals
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(addMissingModals, 500);
        });
    } else {
        setTimeout(addMissingModals, 500);
    }
})();